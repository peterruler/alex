/**
 * Event system for cross-component communication
 */

export const AnalysisEvents = {
  STARTED: 'analysis:started',
  COMPLETED: 'analysis:completed',
  FAILED: 'analysis:failed',
} as const;

export interface AnalysisEventDetail {
  jobId: string;
  timestamp: number;
  status?: string;
  error?: string;
}

/**
 * Emit when an analysis starts
 */
export function emitAnalysisStarted(jobId: string) {
  const event = new CustomEvent(AnalysisEvents.STARTED, {
    detail: { jobId, timestamp: Date.now() }
  });
  window.dispatchEvent(event);
}

/**
 * Emit when an analysis completes successfully
 */
export function emitAnalysisCompleted(jobId: string) {
  const event = new CustomEvent(AnalysisEvents.COMPLETED, {
    detail: { jobId, timestamp: Date.now(), status: 'completed' }
  });
  window.dispatchEvent(event);
}

/**
 * Emit when an analysis fails
 */
export function emitAnalysisFailed(jobId: string, error?: string) {
  const event = new CustomEvent(AnalysisEvents.FAILED, {
    detail: { jobId, timestamp: Date.now(), status: 'failed', error }
  });
  window.dispatchEvent(event);
}

