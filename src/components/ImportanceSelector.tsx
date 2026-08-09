import { memo, useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import {
  argumentWeightOptions,
  normalizeArgumentWeight,
} from '../constants/argumentWeights';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  colors,
  hapticPatterns,
  layout,
  motion,
  radii,
  spacing,
} from '../theme';
import type { ArgumentWeight } from '../types/decision';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  disabled?: boolean;
  label?: string;
  onChange: (weight: ArgumentWeight) => void;
  value: ArgumentWeight;
};

type SegmentProps = {
  disabled: boolean;
  index: number;
  onChange: (weight: ArgumentWeight) => void;
  selectedValue: ArgumentWeight;
};

type WebKeyboardEvent = {
  key: string;
  preventDefault: () => void;
};

function ImportanceSegment({
  disabled,
  index,
  onChange,
  selectedValue,
}: SegmentProps) {
  const option = argumentWeightOptions[index];
  const isSelected = option.value === selectedValue;
  const selectionOpacity = useRef(
    new Animated.Value(isSelected ? 1 : 0),
  ).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      selectionOpacity.setValue(isSelected ? 1 : 0);
      return;
    }

    const animation = Animated.timing(selectionOpacity, {
      duration: motion.duration.fast,
      easing: motion.easing.standard,
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [isSelected, reduceMotion, selectionOpacity]);

  const select = (nextIndex: number) => {
    const nextValue = argumentWeightOptions[nextIndex].value;

    if (!disabled && nextValue !== selectedValue) {
      onChange(nextValue);
    }
  };

  const handleKeyDown = (event: WebKeyboardEvent) => {
    const direction =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;

    if (disabled || direction === 0) {
      return;
    }

    event.preventDefault();
    select(
      (index + direction + argumentWeightOptions.length) %
        argumentWeightOptions.length,
    );
  };

  const webKeyboardProps =
    Platform.OS === 'web' ? { onKeyDown: handleKeyDown } : {};

  return (
    <AnimatedPressable
      {...webKeyboardProps}
      accessibilityHint={option.description}
      accessibilityLabel={`${option.label}, importance, ${
        isSelected ? 'sélectionnée' : 'non sélectionnée'
      }`}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      containerStyle={styles.segmentContainer}
      disabled={disabled}
      haptic={isSelected ? undefined : hapticPatterns.selection}
      onPress={() => select(index)}
      pressedStyle={styles.segmentPressed}
      scaleTo={motion.subtlePressScale}
      style={styles.segment}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.selectedBackground,
          { opacity: selectionOpacity },
        ]}
      />
      <Text
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1.35}
        minimumFontScale={0.86}
        numberOfLines={2}
        style={[
          styles.segmentText,
          isSelected && styles.segmentTextSelected,
          disabled && styles.segmentTextDisabled,
        ]}
      >
        {option.label}
      </Text>
    </AnimatedPressable>
  );
}

function ImportanceSelectorComponent({
  disabled = false,
  label = 'Importance de cet élément',
  onChange,
  value,
}: Props) {
  const selectedValue = normalizeArgumentWeight(value);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        accessibilityLabel={label}
        accessibilityRole="radiogroup"
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
        ]}
      >
        {argumentWeightOptions.map((option, index) => (
          <ImportanceSegment
            disabled={disabled}
            index={index}
            key={option.level}
            onChange={onChange}
            selectedValue={selectedValue}
          />
        ))}
      </View>
    </View>
  );
}

export const ImportanceSelector = memo(ImportanceSelectorComponent);

const styles = StyleSheet.create({
  field: {
    marginTop: spacing.sm,
  },
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  selector: {
    minHeight: 15,
    flexDirection: 'row',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
  },
  selectorDisabled: {
    opacity: 0.6,
  },
  segmentContainer: {
    flex: 1,
  },
  segment: {
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
    borderRadius: radii.sm,
  },
  segmentPressed: {
    backgroundColor: colors.surfaceMutedStrong,
  },
  selectedBackground: {
    position: 'absolute',
    top: 3,
    right: 2,
    bottom: 3,
    left: 2,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },

  segmentText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  segmentTextSelected: {
    color: colors.white,
  },
  segmentTextDisabled: {
    color: colors.disabledText,
  },
});
