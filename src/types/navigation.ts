import type { NavigatorScreenParams } from '@react-navigation/native';

import type { Decision, DecisionFormat, DecisionOptions } from './decision';
import type { AppNotification } from './notification';

export type { AppNotification } from './notification';

export type MainTabParamList = {
  Home:
    | {
        notification?: AppNotification;
      }
    | undefined;
  DecisionList:
    | {
        notification?: AppNotification;
      }
    | undefined;
  Journey: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  NewDecision: undefined;
DecisionArguments: {
  decisionTitle: string;
  decision?: Decision;
  format?: DecisionFormat;
  options?: DecisionOptions;
};
  DecisionResult: {
    decision: Decision;
  };
  DecisionCommitment: {
    decision: Decision;
  };
  DecisionFollowUp: {
    decision: Decision;
  };
  DecisionDetail: {
    decisionId: string;
  };
  DecisionReview: {
    decisionId: string;
  };
  Archives: undefined;
};
