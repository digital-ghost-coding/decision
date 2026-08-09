import type { Decision } from './decision';

export type AppNotificationType =
  | 'decision_status'
  | 'decision_followup'
  | 'decision_followup_due'
  | 'milestone_unlocked'
  | 'achievement'
  | 'insight'
  | 'reminder';

export type AppNotificationAction =
  | {
      decision: Decision;
      label: 'Annuler';
      type: 'restore-decision';
    }
  | {
      label: 'Voir la décision';
      relatedDecisionId: string;
      type: 'view-decision';
    }
  | {
      label: 'Faire le bilan';
      relatedDecisionId: string;
      type: 'review-decision';
    }
  | {
      label: 'Voir ma progression';
      type: 'view-journey';
    };

export type AppNotification = {
  id: number;
  type: AppNotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  action?: AppNotificationAction;
  dedupeKey?: string;
  relatedDecisionId?: string;
};

type NotificationInput = Omit<
  AppNotification,
  'createdAt' | 'id' | 'read'
> &
  Partial<Pick<AppNotification, 'createdAt' | 'id' | 'read'>>;

export function createAppNotification(
  input: NotificationInput,
): AppNotification {
  return {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
    id: input.id ?? Date.now(),
    read: input.read ?? false,
  };
}
