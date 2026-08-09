import type { Decision, DecisionScore } from '../types/decision';


export function calculateDecisionScore(
  decision: Pick<Decision, 'cons' | 'pros' | 'options'>,
): DecisionScore {

  const proCount = Array.isArray(decision.pros)
    ? decision.pros.length
    : 0;

  const conCount = Array.isArray(decision.cons)
    ? decision.cons.length
    : 0;


  const totalCount = proCount + conCount;


  let percentage =
    totalCount === 0
      ? 50
      : Math.round(
          (proCount / totalCount) * 100,
        );



  let trend: DecisionScore['trend'] = 'neutral';


  let message =
    'Votre réflexion est encore équilibrée.';



  /*
   * COMPARAISON DE DEUX OPTIONS
   *
   * Pro = Option A
   * Con = Option B
   */
  if (
    decision.options?.optionA &&
    decision.options?.optionB
  ) {

    percentage =
      totalCount === 0
        ? 50
        : Math.round(
            (Math.max(proCount, conCount) / totalCount) * 100,
          );


    if (proCount > conCount) {

      trend = 'positive';

      message =
        `${decision.options.optionA} ressort actuellement comme l’option la plus soutenue.`;

    } else if (conCount > proCount) {

      trend = 'positive';

      message =
        `${decision.options.optionB} ressort actuellement comme l’option la plus soutenue.`;

    } else {

      trend = 'neutral';

      message =
        'Les deux options ressortent actuellement à égalité. Ajoutez un élément important pour vous ou choisissez celle qui correspond le mieux à vos priorités.';

    }


  }



  /*
   * DÉCISION SIMPLE
   */
  else {


    if (percentage > 50) {

      trend = 'positive';

      message =
        'Votre réflexion penche actuellement plutôt du côté favorable.';


    } else if (percentage < 50) {

      trend = 'negative';

      message =
        'Votre réflexion penche actuellement plutôt du côté défavorable.';


    } else {

      trend = 'neutral';

      message =
        'Votre réflexion est parfaitement équilibrée. Ajoutez un argument important ou choisissez ce qui correspond le mieux à vos priorités.';

    }

  }



  return {
    proCount,
    conCount,
    totalCount,
    percentage,
    message,
    trend,
  };

}
