import type { DecisionStatistics } from './statistics';

export type JourneyTargetScreen =
  | 'DecisionArguments'
  | 'DecisionList'
  | 'NewDecision';

export type MilestoneNextAction = {
  label: string;
  targetDecisionId?: string;
  targetScreen: JourneyTargetScreen;
};

export type MilestoneDecisionSelector =
  | 'in-progress'
  | 'most-developed';

export type MilestoneNextActionDefinition = {
  decisionSelector?: MilestoneDecisionSelector;
  fallback?: MilestoneNextAction;
  label: string;
  targetScreen: JourneyTargetScreen;
};

export type JourneyChapterId =
  | 'first-choices'
  | 'build-method'
  | 'decide-confidently'
  | 'decide-calmly'
  | 'long-term-vision';

export type JourneyIllustrationKey =
  | 'explorer'
  | 'analyst'
  | 'strategist'
  | 'decision-maker'
  | 'visionary';

export type JourneyChapterStatus = 'current' | 'locked' | 'unlocked';
export type JourneyChapterTone =
  | 'dawn'
  | 'lavender'
  | 'sage'
  | 'sky'
  | 'sunset'
  | 'twilight';

export type MilestoneStatus = 'locked' | 'unlocked';

export type MilestoneCondition = {
  metric: keyof DecisionStatistics;
  operator: 'greaterThanOrEqual';
  value: number;
};

export type Milestone = {
  chapterId: JourneyChapterId;
  condition: MilestoneCondition;
  dateUnlocked: string | null;
  description: string;
  id: string;
  nextAction: MilestoneNextAction | null;
  status: MilestoneStatus;
  title: string;
};

export type MilestoneDefinition = Omit<
  Milestone,
  'dateUnlocked' | 'nextAction' | 'status'
> & {
  nextAction: MilestoneNextActionDefinition;
};

export type JourneyChapterDefinition = {
  id: JourneyChapterId;
  illustrationKey: JourneyIllustrationKey;
  order: number;
  sentence: string;
  symbol: string;
  title: string;
  tone: JourneyChapterTone;
};

export type JourneyChapter = JourneyChapterDefinition & {
  milestones: Milestone[];
  progress: {
    percentage: number;
    total: number;
    unlocked: number;
  };
  status: JourneyChapterStatus;
};
