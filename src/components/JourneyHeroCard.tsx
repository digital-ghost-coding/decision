import { memo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { getJourneyIllustration } from '../constants/journeyIllustrations';
import { journeyToneColors } from '../constants/journeyTones';
import { colors, radii, shadows, spacing } from '../theme';
import type { JourneyChapter } from '../types/journey';

type Props = {
  chapter: JourneyChapter;
};

function JourneyHeroCardComponent({ chapter }: Props) {
  const colorScheme = useColorScheme();
  const illustrationSource = getJourneyIllustration(
    chapter.illustrationKey,
    colorScheme,
  );
  const statusLabel =
    chapter.status === 'current'
      ? 'Chapitre actuel'
      : chapter.status === 'unlocked'
        ? 'Chapitre accompli'
        : 'Chapitre à venir';

  return (
    <View
      accessibilityLabel={`${statusLabel}, ${chapter.title}. ${chapter.sentence}. ${chapter.progress.unlocked} jalons sur ${chapter.progress.total}`}
      style={styles.card}
    >
      <View
        style={[
          styles.illustration,
          { backgroundColor: journeyToneColors[chapter.tone] },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`Illustration du chapitre ${chapter.title}`}
          resizeMode="cover"
          source={illustrationSource}
          style={styles.illustrationImage}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.chapterLabel}>
          {statusLabel} · Chapitre {chapter.order}
        </Text>
        <Text accessibilityRole="header" style={styles.title}>
          {chapter.title}
        </Text>
        <Text style={styles.sentence}>{chapter.sentence}</Text>

        <View style={styles.progressRow}>
          <View
            accessibilityLabel={`Progression : ${chapter.progress.percentage} pour cent`}
            accessibilityRole="progressbar"
            accessibilityValue={{
              max: 100,
              min: 0,
              now: chapter.progress.percentage,
            }}
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${chapter.progress.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressValue}>
            {chapter.progress.unlocked} / {chapter.progress.total} jalons
          </Text>
        </View>
      </View>
    </View>
  );
}

export const JourneyHeroCard = memo(JourneyHeroCardComponent);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  illustration: {
    width: '100%',
    aspectRatio: 1.85,
    overflow: 'hidden',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: spacing.lg,
  },
  chapterLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  sentence: {
    maxWidth: 430,
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 24,
  },
  progressRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.base,
  },
  progressTrack: {
    height: 5,
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
  progressValue: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
