import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Decision } from '../types/decision';
import type {
  JourneyChapter,
  JourneyChapterDefinition,
  Milestone,
  MilestoneCondition,
  MilestoneDecisionSelector,
  MilestoneDefinition,
  MilestoneNextAction,
  MilestoneNextActionDefinition,
} from '../types/journey';
import type { DecisionStatistics } from '../types/statistics';

// La clé existante est conservée pour ne pas perdre les dates déjà enregistrées.
const MILESTONES_STORAGE_KEY = '@decisionly/achievements/v1';

const chapterDefinitions: JourneyChapterDefinition[] = [
  {
    id: 'first-choices',
    illustrationKey: 'explorer',
    order: 1,
    sentence: 'Comprendre avant de choisir.',
    symbol: '🌱',
    title: '🌱 Explorateur',
    tone: 'dawn',
  },
  {
    id: 'build-method',
    illustrationKey: 'analyst',
    order: 2,
    sentence: 'Explorer les options.',
    symbol: '🧭',
    title: '🧭 Analyste',
    tone: 'lavender',
  },
  {
    id: 'decide-confidently',
    illustrationKey: 'strategist',
    order: 3,
    sentence: 'Identifier ce qui compte.',
    symbol: '💡',
    title: '💡 Stratège',
    tone: 'sage',
  },
  {
    id: 'decide-calmly',
    illustrationKey: 'decision-maker',
    order: 4,
    sentence: 'Passer à l’action.',
    symbol: '🎯',
    title: '🎯 Décideur',
    tone: 'sky',
  },
  {
    id: 'long-term-vision',
    illustrationKey: 'visionary',
    order: 5,
    sentence: 'Apprendre de ses choix.',
    symbol: '👑',
    title: '👑 Visionnaire',
    tone: 'sunset',
  },
];

const milestoneDefinitions: MilestoneDefinition[] = [
  {
    chapterId: 'first-choices',
    id: 'first-decision',
    title: 'Première décision',
    description: 'Créez une décision et formulez clairement votre question.',
    condition: {
      metric: 'decisionsCreated',
      operator: 'greaterThanOrEqual',
      value: 1,
    },
    nextAction: {
      label: 'Créer une décision',
      targetScreen: 'NewDecision',
    },
  },
  {
    chapterId: 'first-choices',
    id: 'first-acted-decision',
    title: 'Premier choix acté',
    description: 'Actez une décision après avoir comparé ses arguments.',
    condition: {
      metric: 'decisionsActed',
      operator: 'greaterThanOrEqual',
      value: 1,
    },
    nextAction: {
      decisionSelector: 'in-progress',
      fallback: {
        label: 'Créer une décision',
        targetScreen: 'NewDecision',
      },
      label: 'Continuer',
      targetScreen: 'DecisionArguments',
    },
  },
  {
    chapterId: 'first-choices',
    id: 'first-completed-decision',
    title: 'Première décision terminée',
    description: 'Terminez une décision que vous avez déjà actée.',
    condition: {
      metric: 'decisionsCompleted',
      operator: 'greaterThanOrEqual',
      value: 1,
    },
    nextAction: {
      label: 'Choisir une décision',
      targetScreen: 'DecisionList',
    },
  },
  {
    chapterId: 'first-choices',
    id: 'first-archived-decision',
    title: 'Première décision archivée',
    description: 'Archivez une décision depuis la liste Mes décisions.',
    condition: {
      metric: 'decisionsArchived',
      operator: 'greaterThanOrEqual',
      value: 1,
    },
    nextAction: {
      label: 'Voir mes décisions',
      targetScreen: 'DecisionList',
    },
  },
  {
    chapterId: 'build-method',
    id: 'several-perspectives',
    title: 'Plusieurs perspectives',
    description: 'Ajoutez cinq arguments au total dans vos décisions.',
    condition: {
      metric: 'totalArguments',
      operator: 'greaterThanOrEqual',
      value: 5,
    },
    nextAction: {
      decisionSelector: 'most-developed',
      fallback: {
        label: 'Créer une décision',
        targetScreen: 'NewDecision',
      },
      label: 'Ajouter des arguments',
      targetScreen: 'DecisionArguments',
    },
  },
  {
    chapterId: 'build-method',
    id: 'method-takes-shape',
    title: 'Une méthode prend forme',
    description: 'Créez trois décisions pour installer votre méthode.',
    condition: {
      metric: 'decisionsCreated',
      operator: 'greaterThanOrEqual',
      value: 3,
    },
    nextAction: {
      label: 'Créer une décision',
      targetScreen: 'NewDecision',
    },
  },
  {
    chapterId: 'decide-confidently',
    id: 'choices-assumed',
    title: 'Des choix assumés',
    description: 'Actez trois décisions après avoir mené votre réflexion.',
    condition: {
      metric: 'decisionsActed',
      operator: 'greaterThanOrEqual',
      value: 3,
    },
    nextAction: {
      decisionSelector: 'in-progress',
      fallback: {
        label: 'Créer une décision',
        targetScreen: 'NewDecision',
      },
      label: 'Continuer une décision',
      targetScreen: 'DecisionArguments',
    },
  },
  {
    chapterId: 'decide-confidently',
    id: 'clearer-view',
    title: 'Un regard plus clair',
    description: 'Ajoutez dix arguments au total dans vos décisions.',
    condition: {
      metric: 'totalArguments',
      operator: 'greaterThanOrEqual',
      value: 10,
    },
    nextAction: {
      decisionSelector: 'most-developed',
      fallback: {
        label: 'Créer une décision',
        targetScreen: 'NewDecision',
      },
      label: 'Ajouter des arguments',
      targetScreen: 'DecisionArguments',
    },
  },
  {
    chapterId: 'decide-calmly',
    id: 'decisions-through',
    title: 'Aller au bout',
    description: 'Terminez trois décisions que vous avez déjà actées.',
    condition: {
      metric: 'decisionsCompleted',
      operator: 'greaterThanOrEqual',
      value: 3,
    },
    nextAction: {
      label: 'Choisir une décision',
      targetScreen: 'DecisionList',
    },
  },
  {
    chapterId: 'decide-calmly',
    id: 'steady-course',
    title: 'Un cap plus serein',
    description: 'Actez cinq décisions après avoir mené votre réflexion.',
    condition: {
      metric: 'decisionsActed',
      operator: 'greaterThanOrEqual',
      value: 5,
    },
    nextAction: {
      decisionSelector: 'in-progress',
      fallback: {
        label: 'Créer une décision',
        targetScreen: 'NewDecision',
      },
      label: 'Continuer une décision',
      targetScreen: 'DecisionArguments',
    },
  },
  {
    chapterId: 'long-term-vision',
    id: 'follow-the-thread',
    title: 'Suivre le fil',
    description: 'Conservez dix décisions en réflexion, actées ou terminées.',
    condition: {
      metric: 'decisionsFollowed',
      operator: 'greaterThanOrEqual',
      value: 10,
    },
    nextAction: {
      label: 'Créer une décision',
      targetScreen: 'NewDecision',
    },
  },
  {
    chapterId: 'long-term-vision',
    id: 'broader-picture',
    title: 'Voir plus loin',
    description: 'Ajoutez vingt arguments au total dans vos décisions.',
    condition: {
      metric: 'totalArguments',
      operator: 'greaterThanOrEqual',
      value: 20,
    },
    nextAction: {
      decisionSelector: 'most-developed',
      fallback: {
        label: 'Créer une décision',
        targetScreen: 'NewDecision',
      },
      label: 'Ajouter des arguments',
      targetScreen: 'DecisionArguments',
    },
  },
  {
    chapterId: 'long-term-vision',
    id: 'personal-compass',
    title: 'Votre propre boussole',
    description: 'Terminez dix décisions que vous avez déjà actées.',
    condition: {
      metric: 'decisionsCompleted',
      operator: 'greaterThanOrEqual',
      value: 10,
    },
    nextAction: {
      label: 'Choisir une décision',
      targetScreen: 'DecisionList',
    },
  },
  {
    chapterId: 'long-term-vision',
    id: 'decide-your-way',
    title: 'Décider à votre manière',
    description: 'Actez vingt-cinq décisions après une réflexion structurée.',
    condition: {
      metric: 'decisionsActed',
      operator: 'greaterThanOrEqual',
      value: 25,
    },
    nextAction: {
      decisionSelector: 'in-progress',
      fallback: {
        label: 'Créer une décision',
        targetScreen: 'NewDecision',
      },
      label: 'Continuer une décision',
      targetScreen: 'DecisionArguments',
    },
  },
];

type StoredMilestoneState = Record<string, string>;

function isConditionMet(
  condition: MilestoneCondition,
  statistics: DecisionStatistics,
) {
  if (condition.operator === 'greaterThanOrEqual') {
    return statistics[condition.metric] >= condition.value;
  }

  return false;
}

function selectTargetDecision(
  decisions: Decision[],
  selector: MilestoneDecisionSelector,
) {
  const editableDecisions = decisions.filter((decision) =>
    ['draft', 'reflecting'].includes(decision.status),
  );

  if (selector === 'most-developed') {
    return [...editableDecisions].sort(
      (first, second) =>
        second.pros.length +
        second.cons.length -
        (first.pros.length + first.cons.length),
    )[0];
  }

  return editableDecisions[0];
}

function resolveNextAction(
  definition: MilestoneNextActionDefinition,
  decisions: Decision[],
): MilestoneNextAction {
  if (!definition.decisionSelector) {
    return {
      label: definition.label,
      targetScreen: definition.targetScreen,
    };
  }

  const targetDecision = selectTargetDecision(
    decisions,
    definition.decisionSelector,
  );

  if (!targetDecision) {
    return definition.fallback ?? {
      label: 'Créer une décision',
      targetScreen: 'NewDecision',
    };
  }

  return {
    label: definition.label,
    targetDecisionId: targetDecision.id,
    targetScreen: definition.targetScreen,
  };
}

function evaluateMilestones(
  statistics: DecisionStatistics,
  decisions: Decision[],
  unlockedDates: StoredMilestoneState,
  now: string,
) {
  const nextUnlockedDates = { ...unlockedDates };

  const milestones: Milestone[] = milestoneDefinitions.map((definition) => {
    const isUnlocked =
      Boolean(unlockedDates[definition.id]) ||
      isConditionMet(definition.condition, statistics);

    if (isUnlocked && !nextUnlockedDates[definition.id]) {
      nextUnlockedDates[definition.id] = now;
    }

    return {
      ...definition,
      nextAction: isUnlocked
        ? null
        : resolveNextAction(definition.nextAction, decisions),
      status: isUnlocked ? 'unlocked' : 'locked',
      dateUnlocked: isUnlocked ? nextUnlockedDates[definition.id] : null,
    };
  });

  return { milestones, nextUnlockedDates };
}

export function buildJourney(
  statistics: DecisionStatistics,
  unlockedDates: StoredMilestoneState = {},
  now = new Date().toISOString(),
  decisions: Decision[] = [],
) {
  const evaluated = evaluateMilestones(
    statistics,
    decisions,
    unlockedDates,
    now,
  );
  let previousChapterIsComplete = true;

  const chapters: JourneyChapter[] = chapterDefinitions.map((definition) => {
    const milestones = evaluated.milestones.filter(
      (milestone) => milestone.chapterId === definition.id,
    );
    const unlocked = milestones.filter(
      (milestone) => milestone.status === 'unlocked',
    ).length;
    const isComplete = milestones.length > 0 && unlocked === milestones.length;
    const status = !previousChapterIsComplete
      ? ('locked' as const)
      : isComplete
        ? ('unlocked' as const)
        : ('current' as const);

    previousChapterIsComplete = previousChapterIsComplete && isComplete;

    return {
      ...definition,
      milestones,
      progress: {
        percentage:
          milestones.length === 0
            ? 0
            : Math.round((unlocked / milestones.length) * 100),
        total: milestones.length,
        unlocked,
      },
      status,
    };
  });

  return { chapters, nextUnlockedDates: evaluated.nextUnlockedDates };
}

async function getUnlockedDates(): Promise<StoredMilestoneState> {
  const storedValue = await AsyncStorage.getItem(MILESTONES_STORAGE_KEY);

  if (!storedValue) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object'
      ? (parsedValue as StoredMilestoneState)
      : {};
  } catch {
    return {};
  }
}

export async function evaluateJourney(
  statistics: DecisionStatistics,
  decisions: Decision[],
) {
  const unlockedDates = await getUnlockedDates();
  const journey = buildJourney(
    statistics,
    unlockedDates,
    new Date().toISOString(),
    decisions,
  );

  if (
    JSON.stringify(journey.nextUnlockedDates) !==
    JSON.stringify(unlockedDates)
  ) {
    await AsyncStorage.setItem(
      MILESTONES_STORAGE_KEY,
      JSON.stringify(journey.nextUnlockedDates),
    );
  }

  return journey.chapters;
}
