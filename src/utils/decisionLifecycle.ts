import type {
  ActiveDecisionStatus,
  Decision,
  DecisionSatisfaction,
  DecisionStatus,
} from '../types/decision';


const allowedTransitions: Record<
  DecisionStatus,
  DecisionStatus[]
> = {

  draft: [
    'reflecting',
    'cancelled',
    'archived',
  ],


  reflecting: [
    'draft',
    'acted',
    'completed',
    'cancelled',
    'archived',
  ],


  acted: [
    'reflecting',
    'tracking',
    'completed',
    'cancelled',
    'archived',
  ],


  tracking: [
    'reflecting',
    'acted',
    'completed',
    'cancelled',
    'archived',
  ],


  completed: [
    'reflecting',
    'archived',
  ],


  cancelled: [
    'reflecting',
    'archived',
  ],


  archived: [
    'draft',
    'reflecting',
    'acted',
    'tracking',
    'completed',
    'cancelled',
  ],

};



export function canTransitionDecision(
  from: DecisionStatus,
  to: DecisionStatus,
) {
  return allowedTransitions[from].includes(to);
}



export function transitionDecision(
  decision: Decision,
  status: DecisionStatus,
  chosenOption?: string,
): Decision {

  if (!canTransitionDecision(decision.status, status)) {
    throw new Error(
      `Transition de décision invalide : ${decision.status} → ${status}`,
    );
  }


  const updatedAt = new Date().toISOString();



  if (status === 'archived') {

    return {
      ...decision,

      archivedFromStatus:
        decision.status as ActiveDecisionStatus,

      status,

      updatedAt,
    };

  }



  return {
    ...decision,


    chosenOption:
      status === 'acted'
        ? chosenOption ?? decision.chosenOption
        : decision.chosenOption,



    actedAt:
      status === 'acted'
        ? (decision.actedAt ?? updatedAt)
        : decision.actedAt,



    completedAt:
      status === 'completed'
        ? (decision.completedAt ?? updatedAt)
        : decision.completedAt,



    archivedFromStatus: undefined,


    status,


    updatedAt,
  };

}



export function completeDecisionFromReview(
  decision: Decision,
  satisfaction: DecisionSatisfaction,
  reviewNote?: string,
  completedOn = new Date(),
): Decision {
  if (!['acted', 'tracking', 'completed'].includes(decision.status)) {
    throw new Error(
      `Bilan impossible pour une décision au statut ${decision.status}`,
    );
  }

  const updatedAt = completedOn.toISOString();
  const completedDecision =
    decision.status === 'completed'
      ? decision
      : transitionDecision(decision, 'completed');

  return {
    ...completedDecision,
    completedAt: decision.completedAt ?? updatedAt,
    reviewNote: reviewNote?.trim() || undefined,
    satisfaction,
    status: 'completed',
    updatedAt,
  };
}



export function scheduleDecisionFollowUp(
  decision: Decision,
  trackingDate: string,
  updatedOn = new Date(),
): Decision {
  if (!['acted', 'tracking'].includes(decision.status)) {
    throw new Error(
      `Suivi impossible pour une décision au statut ${decision.status}`,
    );
  }

  const trackingDecision =
    decision.status === 'tracking'
      ? decision
      : transitionDecision({ ...decision, trackingDate }, 'tracking');

  return {
    ...trackingDecision,
    trackingDate,
    status: 'tracking',
    updatedAt: updatedOn.toISOString(),
  };
}



export function removeDecisionFollowUp(
  decision: Decision,
  updatedOn = new Date(),
): Decision {
  if (!['acted', 'tracking'].includes(decision.status)) {
    throw new Error(
      `Suppression du suivi impossible pour le statut ${decision.status}`,
    );
  }

  const actedDecision =
    decision.status === 'tracking'
      ? transitionDecision({ ...decision, trackingDate: undefined }, 'acted')
      : decision;

  return {
    ...actedDecision,
    status: 'acted',
    trackingDate: undefined,
    updatedAt: updatedOn.toISOString(),
  };
}




export function restoreArchivedDecision(
  decision: Decision,
): Decision {

  if (decision.status !== 'archived') {
    return decision;
  }


  return transitionDecision(
    decision,
    decision.archivedFromStatus ?? 'completed',
  );

}
