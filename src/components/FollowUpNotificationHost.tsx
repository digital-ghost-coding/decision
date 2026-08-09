import type { NavigationContainerRef } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { syncDueFollowUpNotifications } from '../services/followUpService';
import { markNotificationRead } from '../storage/notificationStorage';
import type { RootStackParamList } from '../types/navigation';
import type { AppNotification } from '../types/notification';
import { InAppNotification } from './InAppNotification';

type Props = {
  navigationRef: NavigationContainerRef<RootStackParamList>;
};

export function FollowUpNotificationHost({ navigationRef }: Props) {
  const [notification, setNotification] =
    useState<AppNotification | null>(null);
  const [visible, setVisible] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const pendingNotifications =
        await syncDueFollowUpNotifications();
      const nextNotification = pendingNotifications[0] ?? null;

      setNotification(nextNotification);
      setVisible(Boolean(nextNotification));
    } catch {
      // Le rappel reste non bloquant si le stockage est indisponible.
    }
  }, []);

  useEffect(() => {
    void refresh();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  if (!notification) {
    return null;
  }

  const openReview = async () => {
    await markNotificationRead(notification.id);
    setVisible(false);
    setNotification(null);

    if (
      notification.relatedDecisionId &&
      navigationRef.isReady()
    ) {
      navigationRef.navigate('DecisionReview', {
        decisionId: notification.relatedDecisionId,
      });
    }
  };

  return (
    <InAppNotification
      actionLabel={notification.action?.label}
      duration={8000}
      message={notification.message}
      onAction={() => void openReview()}
      onDismiss={() => setVisible(false)}
      title={notification.title}
      visible={visible}
    />
  );
}
