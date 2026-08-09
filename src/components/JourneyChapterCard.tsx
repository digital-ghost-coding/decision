import { Fragment, memo } from 'react';
import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { getJourneyIllustration } from '../constants/journeyIllustrations';
import { journeyToneColors } from '../constants/journeyTones';
import { colors, radii, shadows, spacing } from '../theme';
import type {
  JourneyChapter,
  JourneyChapterStatus,
} from '../types/journey';
import { AppIcon } from './AppIcon';

type Props = {
  chapter: JourneyChapter;
  isSelected: boolean;
};

const statusLabels: Record<JourneyChapterStatus, string> = {
  current: 'En cours',
  locked: 'Prochain',
  unlocked: 'Terminé',
};

function JourneyChapterCardComponent({ chapter, isSelected }: Props) {
  const colorScheme = useColorScheme();
  const isLocked = chapter.status === 'locked';
  const isCurrent = chapter.status === 'current';
  const isUnlocked = chapter.status === 'unlocked';
  const visibleUnlockedMilestones = isLocked
    ? 0
    : isUnlocked
      ? chapter.progress.total
      : chapter.progress.unlocked;
  const visibleProgressPercentage = chapter.progress.total
    ? Math.round(
        (visibleUnlockedMilestones / chapter.progress.total) * 100,
      )
    : 0;
  const illustrationSource = getJourneyIllustration(
    chapter.illustrationKey,
    colorScheme,
  );

  return (
    <View
      accessibilityLabel={`Chapitre ${chapter.order}, ${chapter.title}, ${statusLabels[chapter.status]}`}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isCurrent && styles.cardCurrent,
        isLocked && styles.cardLocked,
      ]}
    >
      <View
        style={[
          styles.illustration,
          { backgroundColor: journeyToneColors[chapter.tone] },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`Illustration du niveau ${chapter.title}`}
          resizeMode="cover"
          source={illustrationSource}
          style={styles.illustrationImage}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.chapterHeader}>
          <Text style={styles.chapterNumber}>Chapitre {chapter.order}</Text>
          <View
            style={[
              styles.statusPill,
              isCurrent && styles.statusPillCurrent,
              isUnlocked && styles.statusPillUnlocked,
            ]}
          >
            <Text
              style={[
                styles.statusLabel,
                isCurrent && styles.statusLabelCurrent,
                isUnlocked && styles.statusLabelUnlocked,
              ]}
            >
              {statusLabels[chapter.status]}
            </Text>
          </View>
        </View>

        <Text accessibilityRole="header" numberOfLines={2} style={styles.title}>
          {chapter.title}
        </Text>
        <Text numberOfLines={2} style={styles.sentence}>
          {chapter.sentence}
        </Text>

        <View
          accessibilityLabel={`Progression du chapitre ${chapter.title} : ${visibleProgressPercentage} pour cent`}
          accessibilityRole="progressbar"
          accessibilityValue={{
            max: 100,
            min: 0,
            now: visibleProgressPercentage,
          }}
          style={styles.progressSection}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.milestoneTrack}
          >
            {chapter.milestones.map((milestone, index) => {
              const isMilestoneUnlocked =
                index < visibleUnlockedMilestones;
              const isConnectorUnlocked =
                index < visibleUnlockedMilestones;

              return (
                <Fragment key={milestone.id}>
                  {index > 0 ? (
                    <View
                      style={[
                        styles.milestoneConnector,
                        isConnectorUnlocked &&
                          styles.milestoneConnectorUnlocked,
                      ]}
                    />
                  ) : null}
                  <View
                    style={[
                      styles.milestonePoint,
                      isMilestoneUnlocked && styles.milestonePointUnlocked,
                    ]}
                  >
                    {isMilestoneUnlocked ? (
                      <AppIcon
                        color={colors.white}
                        name="check"
                        size="sm"
                        weight="medium"
                      />
                    ) : null}
                  </View>
                </Fragment>
              );
            })}
          </View>

          <Text style={styles.progressValue}>
            {visibleUnlockedMilestones} / {chapter.progress.total} étapes
          </Text>
        </View>
      </View>
    </View>
  );
}

export const JourneyChapterCard = memo(JourneyChapterCardComponent);

const styles = StyleSheet.create({
  card: {
    minHeight: 300,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },
  cardSelected: {
    ...shadows.card,
  },
  cardCurrent: {
    borderColor: colors.primary,
  },
  cardLocked: {
    backgroundColor: colors.surfaceMuted,
  },
  illustration: {
    width: '100%',
    aspectRatio: 2.2,
    overflow: 'hidden',
    borderTopLeftRadius: radii.lg - 1,
    borderTopRightRadius: radii.lg - 1,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  chapterNumber: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  statusPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.disabled,
  },
  statusPillCurrent: {
    backgroundColor: colors.primarySoft,
  },
  statusPillUnlocked: {
    backgroundColor: colors.successSoft,
  },
  statusLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '700',
  },
  statusLabelCurrent: {
    color: colors.primary,
  },
  statusLabelUnlocked: {
    color: colors.success,
  },
  title: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.45,
    lineHeight: 27,
  },
  sentence: {
    minHeight: 42,
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  progressSection: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  milestoneTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  milestoneConnector: {
    flex: 1,
    height: 4,
    backgroundColor: colors.disabled,
  },
  milestoneConnectorUnlocked: {
    backgroundColor: colors.primary,
  },
  milestonePoint: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  milestonePointUnlocked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  progressValue: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
