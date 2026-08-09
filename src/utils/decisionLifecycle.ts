import type {
  ActiveDecisionStatus,
  Decision,
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