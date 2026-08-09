import { normalizeArgumentWeight } from '../constants/argumentWeights';
import type {
  Argument,
  Decision,
  DecisionOptionKey,
  DecisionOptionScore,
  DecisionScore,
} from '../types/decision';

function sumWeights(argumentsList: Argument[]) {
  return argumentsList.reduce(
    (total, argument) => total + normalizeArgumentWeight(argument.weight),
    0,
  );
}

function calculateOptionScore(
  argumentsList: Argument[],
  optionKey: DecisionOptionKey,
): DecisionOptionScore {
  const optionArguments = argumentsList.filter(
    (argument) => argument.optionKey === optionKey,
  );
  const pros = optionArguments.filter((argument) => argument.side === 'pro');
  const cons = optionArguments.filter((argument) => argument.side === 'con');
  const proWeight = sumWeights(pros);
  const conWeight = sumWeights(cons);

  return {
    balance: proWeight - conWeight,
    conCount: cons.length,
    conWeight,
    proCount: pros.length,
    proWeight,
  };
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Exprime la force relative de l'option en tête sans perdre les scores négatifs.
 *
 * Chaque option reçoit sa balance positive éventuelle, plus la balance négative
 * de l'autre option. La part la plus forte est affichée entre 50 et 100 %.
 * Une égalité exacte ou une absence d'arguments vaut 50 %.
 */
function calculateComparisonPercentage(
  optionA: DecisionOptionScore,
  optionB: DecisionOptionScore,
) {
  if (optionA.balance === optionB.balance) {
    return 50;
  }

  const evidenceForA =
    Math.max(optionA.balance, 0) + Math.max(-optionB.balance, 0);
  const evidenceForB =
    Math.max(optionB.balance, 0) + Math.max(-optionA.balance, 0);
  const totalEvidence = evidenceForA + evidenceForB;

  if (totalEvidence === 0) {
    return 50;
  }

  return clampPercentage(
    (Math.max(evidenceForA, evidenceForB) / totalEvidence) * 100,
  );
}

function getComparisonArguments(
  decision: Pick<
    Decision,
    'argumentModelVersion' | 'cons' | 'pros'
  >,
) {
  if (decision.argumentModelVersion === 2) {
    return [...decision.pros, ...decision.cons];
  }

  // Compatibilité avec l'ancien modèle : `pros` représentait l'option A
  // et `cons` l'option B, sans notion de frein.
  return [
    ...decision.pros.map((argument) => ({
      ...argument,
      optionKey: 'optionA' as const,
      side: 'pro' as const,
    })),
    ...decision.cons.map((argument) => ({
      ...argument,
      optionKey: 'optionB' as const,
      side: 'pro' as const,
    })),
  ];
}

export function calculateDecisionScore(
  decision: Pick<
    Decision,
    | 'argumentModelVersion'
    | 'cons'
    | 'format'
    | 'options'
    | 'pros'
  >,
): DecisionScore {
  const pros = Array.isArray(decision.pros) ? decision.pros : [];
  const cons = Array.isArray(decision.cons) ? decision.cons : [];
  const proCount = pros.length;
  const conCount = cons.length;
  const totalCount = proCount + conCount;
  const proWeight = sumWeights(pros);
  const conWeight = sumWeights(cons);

  if (
    decision.format === 'compare' &&
    decision.options?.optionA &&
    decision.options.optionB
  ) {
    const comparisonArguments = getComparisonArguments(decision);
    const optionA = calculateOptionScore(comparisonArguments, 'optionA');
    const optionB = calculateOptionScore(comparisonArguments, 'optionB');
    const result =
      optionA.balance > optionB.balance
        ? 'optionA'
        : optionB.balance > optionA.balance
          ? 'optionB'
          : 'tie';
    const leadingOption =
      result === 'optionA'
        ? decision.options.optionA
        : decision.options.optionB;
    const leadingBalance =
      result === 'optionA'
        ? optionA.balance
        : optionB.balance;
    const bothBalancesAreNegative =
      optionA.balance < 0 && optionB.balance < 0;
    const noFavorableOption =
      result !== 'tie' && leadingBalance <= 0;

    return {
      comparison: {
        optionA,
        optionB,
        result,
      },
      conCount,
      conWeight,
      message:
        result === 'tie'
          ? bothBalancesAreNegative
            ? 'Les deux options présentent des points de vigilance importants. La tendance reste partagée.'
            : 'Les deux options ont la même balance. La tendance reste partagée.'
          : noFavorableOption
            ? `${leadingOption} est actuellement en tête, mais aucune option ne se dégage favorablement pour le moment.`
            : `${leadingOption} est actuellement en tête. Cette tendance éclaire votre choix sans décider à votre place.`,
      percentage: calculateComparisonPercentage(optionA, optionB),
      proCount,
      proWeight,
      totalCount,
      trend:
        result === 'tie' || noFavorableOption
          ? 'neutral'
          : 'positive',
    };
  }

  const totalWeight = proWeight + conWeight;
  const percentage =
    totalWeight === 0
      ? 50
      : clampPercentage((proWeight / totalWeight) * 100);
  const trend =
    proWeight > conWeight
      ? 'positive'
      : conWeight > proWeight
        ? 'negative'
        : 'neutral';

  return {
    conCount,
    conWeight,
    message:
      trend === 'positive'
        ? 'Votre réflexion penche actuellement plutôt du côté favorable.'
        : trend === 'negative'
          ? 'Votre réflexion penche actuellement plutôt du côté défavorable.'
          : totalWeight === 0
            ? 'Votre réflexion peut commencer dès que vous ajoutez un argument.'
            : 'Votre réflexion est parfaitement équilibrée. Choisissez ce qui correspond le mieux à vos priorités.',
    percentage,
    proCount,
    proWeight,
    totalCount,
    trend,
  };
}
