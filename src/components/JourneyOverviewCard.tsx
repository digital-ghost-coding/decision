import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing } from '../theme';
import type { JourneyChapter, Milestone } from '../types/journey';
import { AppIcon } from './AppIcon';

type Props = {
  chapter: JourneyChapter;
  completedMilestones: number;
  nextMilestone?: Milestone;
  totalMilestones: number;
};

function JourneyOverviewCardComponent({
  chapter,
  completedMilestones,
  nextMilestone,
  totalMilestones,
}: Props) {
  const globalPercentage = totalMilestones
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;
  const completedLabel = `${completedMilestones} étape${
    completedMilestones === 1 ? '' : 's'
  } franchie${completedMilestones === 1 ? '' : 's'}`;

  return (
    <View
      accessible
      accessibilityLabel={`Votre chemin actuel : ${chapter.title}. Progression globale : ${globalPercentage} pour cent. Prochaine étape : ${nextMilestone?.title ?? 'continuer à apprendre de vos décisions'}.`}
      style={styles.card}
    >
      <View style={styles.currentChapter}>
        <View style={styles.iconContainer}>
          <AppIcon
            color={colors.primary}
            name="journey"
            size="lg"
            weight="medium"
          />
        </View>
        <View style={styles.chapterContent}>
          <Text style={styles.eyebrow}>Vous êtes ici</Text>
          <Text accessibilityRole="header" style={styles.chapterTitle}>
            {chapter.title}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Progression globale</Text>
          <Text style={styles.summaryValue}>{completedLabel}</Text>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${globalPercentage}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            {nextMilestone ? 'Prochaine étape' : 'Chemin parcouru'}
          </Text>
          <Text style={styles.summaryValue}>
            {nextMilestone?.title ?? 'Continuer à apprendre'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const JourneyOverviewCard = memo(JourneyOverviewCardComponent);

const styles = StyleSheet.create({
  card: {
    padding: spacing.ml,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  currentChapter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },
  chapterContent: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  chapterTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 27,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
    backgroundColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  summaryValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  progressTrack: {
    height: 5,
    marginTop: spacing.sm,
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: colors.disabled,
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: spacing.md,
    backgroundColor: colors.border,
  },
});
