import { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useCommitInteraction } from '../hooks/useCommitInteraction';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, shadows, spacing } from '../theme';
import { COMMIT_CIRCLE_SIZES } from '../utils/commitCircleSize';
import { AppIcon } from './AppIcon';

type Props = {
  disabled?: boolean;
  onComplete: () => Promise<void> | void;
  size?: number;
};

export function DecisionCommitCircle({
  disabled = false,
  onComplete,
  size = COMMIT_CIRCLE_SIZES.regular,
}: Props) {
  const strokeWidth = Math.max(8, Math.round(size * 0.04));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const scale = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReducedMotion();
  const {
    isComplete,
    isHolding,
    progress,
    startHolding,
    stopHolding,
  } = useCommitInteraction({ disabled, onComplete });

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    if (reduceMotion) {
      scale.setValue(1);
      return;
    }

    Animated.sequence([
      Animated.spring(scale, {
        damping: 16,
        mass: 0.7,
        stiffness: 190,
        toValue: 1.035,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        damping: 18,
        mass: 0.8,
        stiffness: 210,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isComplete, reduceMotion, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityHint="Maintenez le cercle environ deux secondes pour confirmer ce choix"
          accessibilityLabel="Confirmer et acter ma décision"
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          accessibilityValue={{
            max: 100,
            min: 0,
            now: Math.round(progress * 100),
          }}
          disabled={disabled}
          onPressIn={startHolding}
          onPressOut={stopHolding}
          style={({ pressed }) => [
            styles.touchSurface,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            isHolding && styles.touchSurfaceHolding,
            isComplete && styles.touchSurfaceComplete,
            disabled && !isComplete && styles.touchSurfaceDisabled,
            pressed && !isComplete && styles.touchSurfacePressed,
            Platform.OS === 'web' && styles.webButton,
          ]}
        >
          <Svg
            height={size}
            pointerEvents="none"
            style={styles.progress}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
          >
            <Circle
              cx={size / 2}
              cy={size / 2}
              fill="transparent"
              r={radius}
              stroke={isComplete ? colors.primary : colors.disabled}
              strokeWidth={strokeWidth}
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              fill="transparent"
              r={radius}
              stroke={colors.primary}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>

          <AppIcon
            color={isComplete ? colors.white : colors.primary}
            name="check"
            size="xl"
            weight="medium"
          />
        </Pressable>
      </Animated.View>

      <Text style={styles.instruction}>
        Maintenez pour confirmer
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  touchSurface: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    ...shadows.primary,
  },
  touchSurfaceHolding: {
    backgroundColor: colors.primarySurface,
    shadowOpacity: 0.16,
  },
  touchSurfaceComplete: {
    backgroundColor: colors.primary,
    shadowOpacity: 0.2,
  },
  touchSurfaceDisabled: {
    opacity: 0.7,
  },
  touchSurfacePressed: {
    transform: [{ scale: 0.995 }],
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  instruction: {
    marginTop: spacing.lg,
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  webButton: {
    cursor: 'pointer',
    userSelect: 'none',
  },
});
