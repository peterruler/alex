output "dashboard_urls" {
  description = "URLs to access the CloudWatch dashboards"
  value = {
    ai_model_usage    = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.ai_model_usage.dashboard_name}"
    agent_performance = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.agent_performance.dashboard_name}"
  }
}

output "dashboard_names" {
  description = "Names of the created dashboards"
  value = {
    ai_model_usage    = aws_cloudwatch_dashboard.ai_model_usage.dashboard_name
    agent_performance = aws_cloudwatch_dashboard.agent_performance.dashboard_name
  }
}

output "setup_instructions" {
  description = "Instructions for using the dashboards"
  value = <<-EOT

    ✅ CloudWatch Dashboards deployed successfully!

    Dashboards Created:
    - AI Model Usage Dashboard: ${aws_cloudwatch_dashboard.ai_model_usage.dashboard_name}
    - Agent Performance Dashboard: ${aws_cloudwatch_dashboard.agent_performance.dashboard_name}

    To view the dashboards:
    1. Sign in to AWS Console
    2. Navigate to CloudWatch → Dashboards
    3. Select your dashboard from the list

    Or use these direct links:
    - AI Model Usage: https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.ai_model_usage.dashboard_name}
    - Agent Performance: https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.agent_performance.dashboard_name}

    Dashboard Features:

    AI Model Usage Dashboard:
    - Bedrock model invocations and errors
    - Token usage (input/output) tracking
    - Model response latency metrics
    - SageMaker endpoint invocations
    - SageMaker model latency
    - Endpoint resource utilization (CPU/Memory)

    Agent Performance Dashboard:
    - Execution times for each agent
    - Invocation counts by agent
    - Error rates monitoring
    - Total invocations over time
    - Concurrent execution metrics
    - Throttle detection

    Note: Some metrics may take a few minutes to populate after initial deployment.
    Ensure your Lambda functions have been invoked at least once to see data.
  EOT
}