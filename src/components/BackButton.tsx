import { memo } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { colors, layout, motion, radii } from '../theme';
import { AppIcon } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  onPress: () => void;
};

function BackButtonComponent({ onPress }: Props) {
  return (
    <AnimatedPressable
      accessibilityLabel="Retour"
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      pressedStyle={styles.buttonPressed}
      scaleTo={motion.subtlePressScale}
      style={[
        styles.button,
        Platform.OS === 'web' && styles.webButton,
      ]}
    >
      <AppIcon
        color={colors.primary}
        name="back"
        size="lg"
        weight="medium"
      />
      <Text style={styles.label}>Retour</Text>
    </AnimatedPressable>
  );
}

export const BackButton = memo(BackButtonComponent);

const styles = StyleSheet.create({
  button: {
    minHeight: layout.touchTarget,
    marginLeft: -8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  webButton: {
    cursor: 'pointer',
  },
  buttonPressed: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    marginLeft: 6,
    color: colors.primary,
    fontSize: 17,
    fontWeight: '600',
  },
});
