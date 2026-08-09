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
import { AppIcon } from './AppIcon';

const SIZE = 224;
const STROKE_WIDTH = 9;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
  disabled?: boolean;
  onComplete: () => Promise<void> | void;
};

export function DecisionCommitCircle({
  disabled = false,
  onComplete,
}: Props) {
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
            isHolding && styles.touchSurfaceHolding,
            isComplete && styles.touchSurfaceComplete,
            disabled && !isComplete && styles.touchSurfaceDisabled,
            pressed && !isComplete && styles.touchSurfacePressed,
            Platform.OS === 'web' && styles.webButton,
          ]}
        >
          <Svg
            height={SIZE}
            pointerEvents="none"
            style={styles.progress}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
          >
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              fill="transparent"
              r={RADIUS}
              stroke={isComplete ? colors.primary : colors.disabled}
              strokeWidth={STROKE_WIDTH}
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              fill="transparent"
              r={RADIUS}
              stroke={colors.primary}
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              strokeLinecap="round"
              strokeWidth={STROKE_WIDTH}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
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
        Maintenez doucement pour confirmer votre choix
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  touchSurface: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZE / 2,
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
