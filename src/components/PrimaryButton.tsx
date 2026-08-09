import { memo } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { colors, hapticPatterns, radii, shadows } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  accessibilityLabel?: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function PrimaryButtonComponent({
  accessibilityLabel,
  disabled = false,
  label,
  onPress,
}: Props) {
  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      haptic={hapticPatterns.primaryAction}
      onPress={onPress}
      containerStyle={styles.container}
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

export const PrimaryButton = memo(PrimaryButtonComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    width: '100%',
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    ...shadows.primary,
  },
  webButton: {
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
    cursor: 'auto',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  label: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  labelDisabled: {
    color: colors.disabledText,
  },
});
