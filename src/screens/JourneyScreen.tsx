import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { FadeInView } from '../components/FadeInView';
import { JourneyChapterCard } from '../components/JourneyChapterCard';
import { JourneyMilestoneCard } from '../components/JourneyMilestoneCard';
import { JourneyOverviewCard } from '../components/JourneyOverviewCard';
import { buildJourney, evaluateJourney } from '../services/journeyService';
import { calculateDecisionStatistics } from '../services/statisticsService';
import { getDecisions } from '../storage/decisionStorage';
import { colors, layout, radii, spacing } from '../theme';
import type { Decision } from '../types/decision';
import type {
  JourneyChapter,
  MilestoneNextAction,
} from '../types/journey';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import type { DecisionStatistics } from '../types/statistics';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Journey'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CAROUSEL_GAP = spacing.base;
const CAROUSEL_PEEK = 56;
const MAX_CHAPTER_CARD_WIDTH = 460;
const MIN_CHAPTER_CARD_WIDTH = 276;

const emptyStatistics: DecisionStatistics = {
  decisionsActed: 0,
  decisionsArchived: 0,
  decisionsCancelled: 0,
  decisionsCompleted: 0,
  decisionsCreated: 0,
  decisionsFollowed: 0,
  decisionsReviewed: 0,
  decisionsTracking: 0,
  totalArguments: 0,
};

export function JourneyScreen({ navigation }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const carouselRef = useRef<FlatList<JourneyChapter>>(null);
  const [statistics, setStatistics] =
    useState<DecisionStatistics>(emptyStatistics);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [chapters, setChapters] = useState<JourneyChapter[]>(() =>
    buildJourney(emptyStatistics).chapters,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const carouselViewportWidth = Math.min(
    windowWidth,
    layout.contentWidth,
  );
  const chapterCardWidth = Math.min(
    MAX_CHAPTER_CARD_WIDTH,
    Math.max(
      MIN_CHAPTER_CARD_WIDTH,
      carouselViewportWidth - CAROUSEL_PEEK,
    ),
  );
  const carouselSideInset = Math.max(
    spacing.md,
    (carouselViewportWidth - chapterCardWidth) / 2,
  );
  const carouselInterval = chapterCardWidth + CAROUSEL_GAP;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadJourney = async () => {
        setIsLoading(true);
        setLoadError(false);

        try {
          const nextDecisions = await getDecisions();
          const nextStatistics = calculateDecisionStatistics(nextDecisions);
          const nextChapters = await evaluateJourney(
            nextStatistics,
            nextDecisions,
          );

          if (isActive) {
            setDecisions(nextDecisions);
            setStatistics(nextStatistics);
            setChapters(nextChapters);
          }
        } catch {
          if (isActive) {
            setLoadError(true);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      void loadJourney();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const currentChapterIndex = useMemo(() => {
    const currentIndex = chapters.findIndex(
      (chapter) => chapter.status === 'current',
    );

    if (currentIndex >= 0) {
      return currentIndex;
    }

    const lastUnlockedIndex = chapters.reduce(
      (lastIndex, chapter, index) =>
        chapter.status === 'unlocked' ? index : lastIndex,
      0,
    );

    return lastUnlockedIndex;
  }, [chapters]);

  useEffect(() => {
    if (isLoading || chapters.length === 0) {
      return undefined;
    }

    setSelectedIndex(currentChapterIndex);
    const frame = requestAnimationFrame(() => {
      carouselRef.current?.scrollToOffset({
        animated: false,
        offset: currentChapterIndex * carouselInterval,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    carouselInterval,
    chapters.length,
    currentChapterIndex,
    isLoading,
  ]);

  const selectedChapter =
    chapters[Math.min(selectedIndex, chapters.length - 1)] ?? chapters[0];
  const currentChapter = chapters[currentChapterIndex] ?? chapters[0];
  const nextMilestone = useMemo(
    () =>
      currentChapter
        ? currentChapter.milestones.find(
            (milestone) => milestone.status !== 'unlocked',
          )
        : undefined,
    [currentChapter],
  );

  const globalProgress = useMemo(
    () =>
      chapters.reduce(
        (progress, chapter) => ({
          completed: progress.completed + chapter.progress.unlocked,
          total: progress.total + chapter.progress.total,
        }),
        { completed: 0, total: 0 },
      ),
    [chapters],
  );

  const updateSelectedChapter = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.max(
      0,
      Math.min(
        chapters.length - 1,
        Math.round(
          event.nativeEvent.contentOffset.x / carouselInterval,
        ),
      ),
    );

    setSelectedIndex(nextIndex);
  };

  const selectChapter = (index: number) => {
    setSelectedIndex(index);
    carouselRef.current?.scrollToOffset({
      animated: true,
      offset: index * carouselInterval,
    });
  };

  const openMilestoneAction = useCallback(
    (action: MilestoneNextAction) => {
      if (action.targetScreen === 'DecisionList') {
        navigation.navigate('DecisionList');
        return;
      }

      if (action.targetScreen === 'DecisionArguments') {
        const targetDecision = decisions.find(
          (decision) => decision.id === action.targetDecisionId,
        );

        if (targetDecision) {
          navigation.navigate('DecisionArguments', {
            decision: targetDecision,
            decisionTitle: targetDecision.title,
            format: targetDecision.format,
            options: targetDecision.options,
          });
          return;
        }
      }

      navigation.navigate('NewDecision');
    },
    [decisions, navigation],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : loadError ? (
        <View style={styles.loadingState}>
          <Text accessibilityRole="alert" style={styles.errorText}>
            Votre parcours est momentanément indisponible.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            {currentChapter ? (
              <FadeInView style={styles.heroSection}>
                <Text accessibilityRole="header" style={styles.pageTitle}>
                  Mon parcours
                </Text>
                <Text style={styles.heroIntro}>
                  J’apprends à mieux décider, un choix après l’autre.
                </Text>
                <JourneyOverviewCard
                  chapter={currentChapter}
                  completedMilestones={globalProgress.completed}
                  nextMilestone={nextMilestone}
                  totalMilestones={globalProgress.total}
                />
              </FadeInView>
            ) : null}

            <FadeInView delay={90} style={styles.carouselSection}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionEyebrow}>Votre évolution</Text>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  Le voyage
                </Text>
                <Text style={styles.sectionDescription}>
                  Chaque chapitre développe une compétence pour mieux décider.
                </Text>
              </View>
              <View style={styles.carouselHeader}>
                <Text style={styles.carouselPosition}>
                  Chapitre {selectedIndex + 1} sur {chapters.length}
                </Text>
                <Text style={styles.carouselHint}>
                  Balayez ou choisissez un chapitre
                </Text>
              </View>

              <FlatList
                accessibilityLabel="Chapitres du parcours"
                contentContainerStyle={{
                  paddingHorizontal: carouselSideInset,
                }}
                data={chapters}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                  index,
                  length: carouselInterval,
                  offset: carouselInterval * index,
                })}
                horizontal
                ItemSeparatorComponent={() => (
                  <View style={styles.carouselSeparator} />
                )}
                keyExtractor={(chapter) => chapter.id}
                nestedScrollEnabled
                onMomentumScrollEnd={updateSelectedChapter}
                onScrollToIndexFailed={({ index }) => {
                  carouselRef.current?.scrollToOffset({
                    animated: false,
                    offset: index * carouselInterval,
                  });
                }}
                ref={carouselRef}
                renderItem={({ index, item }) => (
                  <View style={{ width: chapterCardWidth }}>
                    <JourneyChapterCard
                      chapter={item}
                      isSelected={index === selectedIndex}
                    />
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={carouselInterval}
                style={styles.carousel}
              />

              <View
                accessibilityLabel="Choisir un chapitre"
                accessibilityRole="tablist"
                style={styles.pageIndicator}
              >
                {chapters.map((chapter, index) => (
                  <AnimatedPressable
                    accessibilityLabel={`Afficher le chapitre ${index + 1}, ${chapter.title}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: index === selectedIndex }}
                    haptic="selection"
                    key={chapter.id}
                    onPress={() => selectChapter(index)}
                    pressedStyle={styles.pageDotButtonPressed}
                    scaleTo={0.94}
                    style={[
                      styles.pageDotButton,
                      Platform.OS === 'web' && styles.webButton,
                    ]}
                  >
                    <View
                      style={[
                        styles.pageDot,
                        index === selectedIndex && styles.pageDotSelected,
                      ]}
                    />
                  </AnimatedPressable>
                ))}
              </View>
            </FadeInView>

            {selectedChapter ? (
              <FadeInView
                delay={120}
                key={selectedChapter.id}
                style={styles.milestoneSection}
              >
                <Text style={styles.sectionEyebrow}>Étapes concrètes</Text>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  Vos prochaines étapes
                </Text>
                <Text style={styles.sectionDescription}>
                  {selectedChapter.status === 'locked'
                    ? 'Vous découvrirez ces étapes lorsque ce chapitre commencera.'
                    : selectedChapter.status === 'unlocked'
                      ? 'Vous avez franchi toutes les étapes de ce chapitre.'
                      : 'Une action concrète à la fois, à votre rythme.'}
                </Text>
                <View style={styles.milestoneList}>
                  {selectedChapter.milestones.map((milestone, index) => (
                    <FadeInView
                      delay={Math.min(index, 4) * 35}
                      key={`${milestone.id}-${milestone.status}`}
                      distance={6}
                    >
                      <JourneyMilestoneCard
                        currentValue={
                          statistics[milestone.condition.metric]
                        }
                        isChapterLocked={selectedChapter.status === 'locked'}
                        isNextStep={
                          selectedChapter.status === 'current' &&
                          milestone.id === nextMilestone?.id
                        }
                        milestone={milestone}
                        onAction={openMilestoneAction}
                      />
                    </FadeInView>
                  ))}
                </View>
              </FadeInView>
            ) : null}

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    maxWidth: 320,
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  screen: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.lg,
  },
  heroSection: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroIntro: {
    maxWidth: 420,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 24,
  },
  carouselSection: {
    marginHorizontal: -layout.horizontalPadding,
  },
  sectionHeading: {
    marginBottom: spacing.md,
    paddingHorizontal: layout.horizontalPadding,
  },
  carouselHeader: {
    marginBottom: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.horizontalPadding,
    gap: spacing.base,
  },
  carouselPosition: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  carouselHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  carousel: {
    overflow: 'visible',
  },
  carouselSeparator: {
    width: CAROUSEL_GAP,
  },
  pageIndicator: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageDotButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  pageDotButtonPressed: {
    backgroundColor: colors.primarySurface,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.disabled,
  },
  pageDotSelected: {
    width: 18,
    backgroundColor: colors.primary,
  },
  webButton: {
    cursor: 'pointer',
  },
  milestoneSection: {
    marginTop: spacing.xl,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionDescription: {
    maxWidth: 430,
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
  },
  milestoneList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
