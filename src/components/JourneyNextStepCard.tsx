import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  layout,
  motion,
  radii,
  shadows,
  spacing,
} from '../theme';
import type { Milestone, MilestoneNextAction } from '../types/journey';
import { AppIcon } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  milestone: Milestone;
  onAction: (action: MilestoneNextAction) => void;
};

function JourneyNextStepCardComponent({ milestone, onAction }: Props) {
  if (!milestone.nextAction) {
    return null;
  }

  const action = milestone.nextAction;

  return (
    <View
      accessibilityLabel={`Prochaine étape : ${milestone.title}. ${milestone.description}`}
      style={styles.card}
    >
      <View style={styles.eyebrowRow}>
        <View style={styles.iconContainer}>
          <AppIcon
            color={colors.primary}
            name="journey"
            size="md"
            weight="medium"
          />
        </View>
        <Text style={styles.eyebrow}>Votre prochaine étape</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {milestone.title}
      </Text>
      <Text style={styles.description}>{milestone.description}</Text>
      <AnimatedPressable
        accessibilityHint="Ouvre directement l’écran où accomplir cette étape"
        accessibilityLabel={`${action.label} pour ${milestone.title}`}
        accessibilityRole="button"
        haptic="selection"
        onPress={() => onAction(action)}
        pressedStyle={styles.buttonPressed}
        scaleTo={motion.subtlePressScale}
        style={[
          styles.button,
          Platform.OS === 'web' && styles.webButton,
        ]}
      >
        <Text style={styles.buttonLabel}>{action.label}</Text>
        <AppIcon
          color={colors.white}
          name="chevron-right"
          size="sm"
          weight="medium"
        />
      </AnimatedPressable>
    </View>
  );
}

export const JourneyNextStepCard = memo(JourneyNextStepCardComponent);

const styles = StyleSheet.create({
  card: {
    padding: spacing.ml,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    ...shadows.card,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.base,
    backgroundColor: colors.white,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    minHeight: layout.touchTarget,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.base,
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  webButton: {
    cursor: 'pointer',
  },
});
