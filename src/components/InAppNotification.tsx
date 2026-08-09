import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppNotificationType } from '../types/notification';

import { colors, layout, motion, radii, shadows, spacing } from '../theme';
import { AppIcon } from './AppIcon';
import type { AppIconName } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';

const SWIPE_ACTIVATION_DISTANCE = 8;
const SWIPE_DISMISS_DISTANCE = 72;
const SWIPE_DISMISS_VELOCITY = 0.65;
const SWIPE_EXIT_DISTANCE = 420;
const SWIPE_FADE_DISTANCE = 240;
const SWIPE_VERTICAL_DISMISS_DISTANCE = 50;

type Props = {
  actionLabel?: string;
  duration?: number;
  message: string;
  title?: string;
  type?: AppNotificationType;
  onAction?: () => void;
  onDismiss: () => void;
  visible: boolean;
};

function InAppNotificationComponent({
  actionLabel,
  duration = 4000,
  message,
  onAction,
  onDismiss,
  visible,
  title,
  type,
}: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-28)).current;

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        duration: motion.duration.fast,
        easing: motion.easing.exit,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        duration: motion.duration.fast,
        easing: motion.easing.exit,
        toValue: -18,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  }, [onDismiss, opacity, translateY]);

const restoreSwipePosition = useCallback(() => {
  Animated.parallel([
    Animated.spring(translateX, {
      ...motion.spring,
      toValue: 0,
      useNativeDriver: true,
    }),
    Animated.spring(translateY, {
      ...motion.spring,
      toValue: 0,
      useNativeDriver: true,
    }),
    Animated.timing(opacity, {
      duration: motion.duration.fast,
      easing: motion.easing.standard,
      toValue: 1,
      useNativeDriver: true,
    }),
  ]).start();
}, [opacity, translateX, translateY]);

const panResponder = useMemo(
  () =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > SWIPE_ACTIVATION_DISTANCE ||
        Math.abs(gesture.dy) > SWIPE_ACTIVATION_DISTANCE,

      onPanResponderMove: (_, gesture) => {
        // Swipe horizontal
        if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
          translateX.setValue(gesture.dx);

          opacity.setValue(
            Math.max(
              0.35,
              1 - Math.abs(gesture.dx) / SWIPE_FADE_DISTANCE,
            ),
          );
        }

        // Swipe vertical vers le haut
        if (gesture.dy < 0) {
          translateY.setValue(gesture.dy);
          opacity.setValue(
            Math.max(
              0.35,
              1 - Math.abs(gesture.dy) / SWIPE_FADE_DISTANCE,
            ),
          );
        }
      },

      onPanResponderRelease: (_, gesture) => {
        const dismissHorizontal =
          Math.abs(gesture.dx) > SWIPE_DISMISS_DISTANCE ||
          Math.abs(gesture.vx) > SWIPE_DISMISS_VELOCITY;

        const dismissVertical =
          gesture.dy < -SWIPE_VERTICAL_DISMISS_DISTANCE;

        if (!dismissHorizontal && !dismissVertical) {
          restoreSwipePosition();
          return;
        }

        if (dismissVertical) {
          Animated.parallel([
            Animated.timing(translateY, {
              duration: motion.duration.fast,
              easing: motion.easing.exit,
              toValue: -SWIPE_EXIT_DISTANCE,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              duration: motion.duration.fast,
              easing: motion.easing.exit,
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start(onDismiss);

          return;
        }

        const direction = gesture.dx >= 0 ? 1 : -1;

        Animated.parallel([
          Animated.timing(translateX, {
            duration: motion.duration.fast,
            easing: motion.easing.exit,
            toValue: direction * SWIPE_EXIT_DISTANCE,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            duration: motion.duration.fast,
            easing: motion.easing.exit,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start(onDismiss);
      },

      onPanResponderTerminate: restoreSwipePosition,
    }),
  [
    onDismiss,
    opacity,
    restoreSwipePosition,
    translateX,
    translateY,
  ],
);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    opacity.setValue(0);
    translateX.setValue(0);
    translateY.setValue(-28);

    Animated.parallel([
      Animated.timing(opacity, {
        duration: motion.duration.standard,
        easing: motion.easing.enter,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        ...motion.spring,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration, opacity, translateX, translateY, visible]);

  if (!visible) {
    return null;
  }

  const performAction = () => {
    onAction?.();
    dismiss();
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { top: insets.top + spacing.base }]}
    >
      <Animated.View
        {...panResponder.panHandlers}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[
          styles.banner,
          {
            opacity,
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
 <View style={styles.iconCircle}>
  <Text style={styles.emojiIcon}>
    {getNotificationEmoji(type)}
  </Text>
</View>
        <View style={styles.content}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={[styles.message, !title && styles.messageStandalone]}>
            {message}
          </Text>
        </View>
        {actionLabel && onAction ? (
          <AnimatedPressable
            accessibilityRole="button"
            haptic="selection"
            onPress={performAction}
            pressedStyle={styles.actionButtonPressed}
            style={[
              styles.actionButton,
              Platform.OS === 'web' && styles.webButton,
            ]}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </AnimatedPressable>
        ) : null}
        <AnimatedPressable
          accessibilityLabel="Fermer la notification"
          accessibilityRole="button"
          hitSlop={10}
          onPress={dismiss}
          pressedStyle={styles.closeButtonPressed}
          style={[
            styles.closeButton,
            Platform.OS === 'web' && styles.webButton,
          ]}
        >
          <AppIcon color={colors.secondaryText} name="close" size="md" />
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

function getNotificationEmoji(
  type?: AppNotificationType,
) {
  switch (type) {
    case 'milestone_unlocked':
    case 'achievement':
    case 'decision_status':
      return '🏆';

    case 'decision_followup':
    case 'decision_followup_due':
      return '🕒';

    case 'insight':
      return '💡';

    case 'reminder':
      return '🔔';

    default:
      return '✅';
  }
}

function getNotificationIcon(
  type?: AppNotificationType,
): AppIconName {
  switch (type) {
  case 'milestone_unlocked':
  case 'achievement':
  case 'decision_status':
    return 'trophy';

    case 'decision_followup':
    case 'decision_followup_due':
      return 'clock';

    case 'insight':
      return 'decision';

    case 'reminder':
      return 'notification';

    default:
      return 'check';
  }
}

export const InAppNotification = memo(InAppNotificationComponent);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    right: spacing.md,
    left: spacing.md,
    zIndex: 20,
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    maxWidth: 520,
    minHeight: layout.touchTarget + 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    ...shadows.elevated,
  },
  iconCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    marginTop: 2,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  messageStandalone: {
    marginTop: 0,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  actionButton: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  actionButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  actionLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  closeButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  closeButtonPressed: {
    backgroundColor: colors.background,
  },
  webButton: {
    cursor: 'pointer',
  },

  emojiIcon: {
  fontSize: 22,
},
});
