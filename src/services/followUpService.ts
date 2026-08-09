import { getDecisions } from '../storage/decisionStorage';
import {
  addNotifications,
  getNotifications,
} from '../storage/notificationStorage';
import type { Decision } from '../types/decision';
import {
  createAppNotification,
  type AppNotification,
} from '../types/notification';

function getDedupeKey(decision: Decision) {
  return `decision_followup_due:${decision.id}:${decision.trackingDate}`;
}

export function findDueFollowUps(
  decisions: Decision[],
  now = new Date(),
) {
  const nowTimestamp = now.getTime();

  return decisions
    .filter(
      (decision) =>
        decision.status === 'tracking' &&
        Boolean(decision.trackingDate) &&
        new Date(decision.trackingDate as string).getTime() <= nowTimestamp,
    )
    .sort(
      (first, second) =>
        new Date(first.trackingDate as string).getTime() -
        new Date(second.trackingDate as string).getTime(),
    );
}

export async function syncDueFollowUpNotifications(
  now = new Date(),
): Promise<AppNotification[]> {
  const [decisions, storedNotifications] = await Promise.all([
    getDecisions(),
    getNotifications(),
  ]);
  const existingKeys = new Set(
    storedNotifications
      .map((notification) => notification.dedupeKey)
      .filter((key): key is string => Boolean(key)),
  );
  const dueFollowUps = findDueFollowUps(decisions, now);
  const dueKeys = new Set(dueFollowUps.map(getDedupeKey));
  const timestamp = Date.now();
  const newNotifications = dueFollowUps
    .filter((decision) => !existingKeys.has(getDedupeKey(decision)))
    .map((decision, index) =>
      createAppNotification({
        action: {
          label: 'Faire le bilan',
          relatedDecisionId: decision.id,
          type: 'review-decision',
        },
        dedupeKey: getDedupeKey(decision),
        id: timestamp + index,
        message:
          'Vous aviez choisi de revenir sur cette décision aujourd’hui.',
        relatedDecisionId: decision.id,
        title: 'Il est temps de refaire le point',
        type: 'decision_followup_due',
      }),
    );

  await addNotifications(newNotifications);

  return [...storedNotifications, ...newNotifications]
    .filter(
      (notification) =>
        notification.type === 'decision_followup_due' &&
        !notification.read &&
        Boolean(notification.dedupeKey) &&
        dueKeys.has(notification.dedupeKey as string),
    )
    .sort(
      (first, second) =>
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime(),
    );
}
