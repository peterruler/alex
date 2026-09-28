"""
MCP server configurations for the Alex Researcher
"""
import glob
import json
import logging
import os
import threading
from contextlib import asynccontextmanager
from typing import Any

from agents.mcp import MCPServerStdio
from mcp.client.stdio import stdio_client


logger = logging.getLogger(__name__)
MCP_LOGGING_ENABLED = os.getenv("MCP_LOGGING") == "True"

PLAYWRIGHT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)
PLAYWRIGHT_BROWSER_GLOB = "/ms-playwright/chromium-*/chrome-linux*/chrome"
PLAYWRIGHT_BROWSER_FALLBACK = "/ms-playwright/chromium-1208/chrome-linux64/chrome"
PLAYWRIGHT_STDERR_MAX_LENGTH = 4000


def _trim_for_log(value: Any, max_length: int = PLAYWRIGHT_STDERR_MAX_LENGTH) -> str:
    text = str(value)
    if len(text) <= max_length:
        return text
    return f"{text[:max_length]}... [trimmed {len(text) - max_length} chars]"


class LoggingMCPServerStdio(MCPServerStdio):
    @asynccontextmanager
    async def create_streams(self):
        read_fd, write_fd = os.pipe()
        stderr_reader = os.fdopen(read_fd, "r", encoding="utf-8", errors="replace")
        stderr_writer = os.fdopen(write_fd, "w", encoding="utf-8", errors="replace")

        def drain_stderr() -> None:
            try:
                for line in stderr_reader:
                    message = line.rstrip()
                    if message:
                        logger.error("[mcp:stderr] %s", _trim_for_log(message))
            except Exception:
                logger.exception("Failed to read MCP subprocess stderr")
            finally:
                stderr_reader.close()

        stderr_thread = threading.Thread(
            target=drain_stderr,
            name="playwright-mcp-stderr",
            daemon=True,
        )
        stderr_thread.start()

        try:
            async with stdio_client(self.params, errlog=stderr_writer) as streams:
                yield streams
        finally:
            stderr_writer.close()
            stderr_thread.join(timeout=1)


def create_playwright_mcp_server(timeout_seconds=120):
    """Create a Playwright MCP server instance for web browsing.

    Args:
        timeout_seconds: Client session timeout in seconds (default: 60)

    Returns:
        MCPServerStdio instance configured for Playwright
    """
    args = [
        "--headless",
        "--isolated",
        "--no-sandbox",
        "--ignore-https-errors",
        "--user-agent",
        PLAYWRIGHT_USER_AGENT,
    ]

    chrome_paths = glob.glob(PLAYWRIGHT_BROWSER_GLOB)
    if chrome_paths:
        chrome_path = chrome_paths[0]
        logger.info("Using Playwright Chrome binary: %s", chrome_path)
        args.extend(["--executable-path", chrome_path])
    else:
        chrome_path = PLAYWRIGHT_BROWSER_FALLBACK
        logger.warning(
            "Playwright Chrome not found via glob %s; using fallback: %s",
            PLAYWRIGHT_BROWSER_GLOB,
            chrome_path,
        )
        args.extend(["--executable-path", chrome_path])

    config_path = "/tmp/playwright-mcp.config.json"
    config = {
        "browser": {
            "launchOptions": {
                "args": [
                    "--single-process",
                    "--no-zygote",
                    "--disable-gpu",
                ]
            }
        }
    }
    with open(config_path, "w", encoding="utf-8") as config_file:
        json.dump(config, config_file)

    args.extend(["--config", config_path])

    params = {
        "command": "playwright-mcp",
        "args": args,
        "env": {
            "DEBUG": "pw:api,pw:browser*",
        },
    }

    logger.info(
        "Creating Playwright MCP server with timeout=%ss chrome_path=%s config_path=%s config=%s args=%s env=%s",
        timeout_seconds,
        chrome_path,
        config_path,
        config,
        args,
        params["env"],
    )

    if MCP_LOGGING_ENABLED:
        return LoggingMCPServerStdio(
            params=params,
            client_session_timeout_seconds=timeout_seconds,
        )

    return MCPServerStdio(params=params, client_session_timeout_seconds=timeout_seconds)