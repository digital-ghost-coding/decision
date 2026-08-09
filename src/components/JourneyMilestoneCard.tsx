import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, layout, motion, radii, spacing } from '../theme';
import type { Milestone, MilestoneNextAction } from '../types/journey';
import { AppIcon } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  currentValue: number;
  isChapterLocked: boolean;
  isNextStep: boolean;
  milestone: Milestone;
  onAction: (action: MilestoneNextAction) => void;
};

function formatCompletionDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function JourneyMilestoneCardComponent({
  currentValue,
  isChapterLocked,
  isNextStep,
  milestone,
  onAction,
}: Props) {
  const isUnlocked =
    !isChapterLocked && milestone.status === 'unlocked';
  const target = milestone.condition.value;
  const percentage = isChapterLocked
    ? 0
    : Math.min(100, Math.round((currentValue / target) * 100));
  const visibleCurrentValue = isChapterLocked
    ? 0
    : Math.min(currentValue, target);
  const hasPartialProgress =
    !isChapterLocked && !isUnlocked && target > 1 && visibleCurrentValue > 0;
  const stateLabel = isChapterLocked
    ? 'À venir'
    : isUnlocked
      ? 'Terminé'
      : isNextStep
        ? 'Prochaine étape'
        : 'À faire';
  const nextAction =
    !isChapterLocked && !isUnlocked ? milestone.nextAction : null;
  const completionDate = isUnlocked
    ? formatCompletionDate(milestone.dateUnlocked)
    : null;

  return (
    <View
      accessibilityLabel={`${milestone.title}, ${stateLabel}, progression ${visibleCurrentValue} sur ${target}`}
      style={[
        styles.card,
        isNextStep && styles.cardNext,
        isUnlocked && styles.cardUnlocked,
        isChapterLocked && styles.cardLocked,
      ]}
    >
      <View
        style={[
          styles.mark,
          isUnlocked && styles.markUnlocked,
        ]}
      >
        <AppIcon
          color={isUnlocked ? colors.success : colors.primary}
          name={isUnlocked ? 'check' : 'circle'}
          size={isUnlocked ? 'sm' : 'md'}
          weight={isUnlocked ? 'medium' : 'regular'}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isChapterLocked && styles.textLocked]}>
            {milestone.title}
          </Text>
          <Text
            style={[
              styles.state,
              isNextStep && styles.stateNext,
              isUnlocked && styles.stateUnlocked,
            ]}
          >
            {stateLabel}
          </Text>
        </View>
        <Text style={[
          styles.description,
          isChapterLocked && styles.textLocked,
        ]}>
          {milestone.description}
        </Text>
        {hasPartialProgress ? (
          <View style={styles.partialProgress}>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ max: 100, min: 0, now: percentage }}
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressValue}>
              Déjà {visibleCurrentValue} sur {target}
            </Text>
          </View>
        ) : null}
        {completionDate ? (
          <Text style={styles.completionDate}>
            Terminé le {completionDate}
          </Text>
        ) : null}
        {nextAction ? (
          <AnimatedPressable
            accessibilityHint="Ouvre directement l’étape utile pour atteindre ce jalon"
            accessibilityLabel={`${nextAction.label} pour le jalon ${milestone.title}`}
            accessibilityRole="button"
            haptic="selection"
            onPress={() => onAction(nextAction)}
            pressedStyle={styles.actionPressed}
            scaleTo={motion.subtlePressScale}
            style={[
              styles.action,
              Platform.OS === 'web' && styles.webButton,
            ]}
          >
            <Text style={styles.actionLabel}>
              {nextAction.label}
            </Text>
            <AppIcon
              color={colors.primary}
              name="chevron-right"
              size="sm"
              weight="medium"
            />
          </AnimatedPressable>
        ) : null}
      </View>
    </View>
  );
}

export const JourneyMilestoneCard = memo(JourneyMilestoneCardComponent);

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  cardLocked: {
    backgroundColor: colors.surfaceMuted,
  },
  cardNext: {
    borderColor: colors.primarySoft,
    backgroundColor: colors.primarySurface,
  },
  cardUnlocked: {
    borderColor: colors.successSoft,
  },
  mark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.base,
    backgroundColor: colors.primarySoft,
  },
  markUnlocked: {
    backgroundColor: colors.successSoft,
  },
  content: {
    flex: 1,
    marginLeft: spacing.base,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  state: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 16,
  },
  stateUnlocked: {
    color: colors.success,
  },
  stateNext: {
    color: colors.primary,
  },
  description: {
    marginTop: spacing.xxs,
    color: colors.secondaryText,
    fontSize: 12,
    lineHeight: 17,
  },
  textLocked: {
    color: colors.muted,
  },
  progressTrack: {
    height: 4,
    flex: 1,
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.disabled,
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  partialProgress: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressValue: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  completionDate: {
    marginTop: spacing.xxs,
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  action: {
    minHeight: layout.touchTarget,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    borderRadius: radii.base,
    backgroundColor: colors.primarySoft,
  },
  actionPressed: {
    backgroundColor: colors.disabled,
  },
  actionLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  webButton: {
    cursor: 'pointer',
  },
});
