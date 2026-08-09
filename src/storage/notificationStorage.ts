import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AppNotification,
  AppNotificationType,
} from '../types/notification';

const NOTIFICATIONS_STORAGE_KEY = '@decisionly/notifications/v1';

const notificationTypes: AppNotificationType[] = [
  'decision_status',
  'decision_followup',
  'decision_followup_due',
  'milestone_unlocked',
  'achievement',
  'insight',
  'reminder',
];

function normalizeNotification(value: unknown): AppNotification | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const notification = value as Partial<AppNotification>;
  if (
    typeof notification.id !== 'number' ||
    !notificationTypes.includes(notification.type as AppNotificationType) ||
    typeof notification.title !== 'string' ||
    typeof notification.message !== 'string' ||
    typeof notification.createdAt !== 'string' ||
    typeof notification.read !== 'boolean'
  ) {
    return null;
  }

  return {
    id: notification.id,
    type: notification.type as AppNotificationType,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt,
    read: notification.read,
    action: notification.action,
    dedupeKey:
      typeof notification.dedupeKey === 'string'
        ? notification.dedupeKey
        : undefined,
    relatedDecisionId:
      typeof notification.relatedDecisionId === 'string'
        ? notification.relatedDecisionId
        : undefined,
  };
}

function sortByMostRecent(notifications: AppNotification[]) {
  return [...notifications].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );
}

export async function getNotifications(): Promise<AppNotification[]> {
  const storedValue = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortByMostRecent(
      parsedValue
        .map(normalizeNotification)
        .filter(
          (notification): notification is AppNotification =>
            notification !== null,
        ),
    );
  } catch {
    return [];
  }
}

async function saveNotifications(notifications: AppNotification[]) {
  await AsyncStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(sortByMostRecent(notifications)),
  );
}

export async function addNotifications(
  notifications: AppNotification[],
): Promise<void> {
  if (notifications.length === 0) {
    return;
  }

  const storedNotifications = await getNotifications();
  const existingKeys = new Set(
    storedNotifications
      .map((notification) => notification.dedupeKey)
      .filter((key): key is string => Boolean(key)),
  );
  const uniqueNotifications = notifications.filter(
    (notification) =>
      !notification.dedupeKey ||
      !existingKeys.has(notification.dedupeKey),
  );

  await saveNotifications([
    ...storedNotifications,
    ...uniqueNotifications,
  ]);
}

export async function markNotificationRead(id: number): Promise<void> {
  const notifications = await getNotifications();
  await saveNotifications(
    notifications.map((notification) =>
      notification.id === id
        ? { ...notification, read: true }
        : notification,
    ),
  );
}

export async function markDecisionFollowUpsRead(
  decisionId: string,
): Promise<void> {
  const notifications = await getNotifications();
  await saveNotifications(
    notifications.map((notification) =>
      notification.type === 'decision_followup_due' &&
      notification.relatedDecisionId === decisionId
        ? { ...notification, read: true }
        : notification,
    ),
  );
}
