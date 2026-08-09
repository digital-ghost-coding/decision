import type { Decision } from '../types/decision';
import type { DecisionStatistics } from '../types/statistics';

function getProgressStatus(decision: Decision) {
  return decision.status === 'archived'
    ? (decision.archivedFromStatus ?? decision.status)
    : decision.status;
}

export function calculateDecisionStatistics(
  decisions: Decision[],
): DecisionStatistics {
  return {
    decisionsActed: decisions.filter((decision) =>
      ['acted', 'tracking', 'completed'].includes(
        getProgressStatus(decision),
      ),
    ).length,
    decisionsArchived: decisions.filter(
      (decision) => decision.status === 'archived',
    ).length,
    decisionsCancelled: decisions.filter(
      (decision) => getProgressStatus(decision) === 'cancelled',
    ).length,
    decisionsCompleted: decisions.filter(
      (decision) => getProgressStatus(decision) === 'completed',
    ).length,
    decisionsCreated: decisions.length,
    decisionsFollowed: decisions.filter((decision) =>
      ['reflecting', 'acted', 'tracking', 'completed'].includes(
        getProgressStatus(decision),
      ),
    ).length,
    decisionsReviewed: decisions.filter(
      (decision) => decision.satisfaction !== undefined,
    ).length,
    decisionsTracking: decisions.filter(
      (decision) => decision.trackingDate !== undefined,
    ).length,
    totalArguments: decisions.reduce(
      (total, decision) =>
        total + decision.pros.length + decision.cons.length,
      0,
    ),
  };
}
