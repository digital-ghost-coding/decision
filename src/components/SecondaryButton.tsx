import { memo } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { colors, hapticPatterns, radii } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function SecondaryButtonComponent({
  disabled = false,
  label,
  onPress,
}: Props) {
  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      containerStyle={styles.container}
      disabled={disabled}
      haptic={hapticPatterns.selection}
      onPress={onPress}
      pressedStyle={styles.buttonPressed}
      style={[
        styles.button,
        Platform.OS === 'web' && styles.webButton,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export const SecondaryButton = memo(SecondaryButtonComponent);

const styles = StyleSheet.create({
  container: { width: '100%' },
  button: {
    width: '100%',
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  webButton: {
    cursor: 'pointer',
  },
  buttonPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  buttonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    cursor: 'auto',
  },
  label: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  labelDisabled: { color: colors.disabledText },
});
