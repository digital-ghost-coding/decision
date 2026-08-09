import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { AppIcon } from '../components/AppIcon';
import { FadeInView } from '../components/FadeInView';
import { InAppNotification } from '../components/InAppNotification';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  SwipeableDecisionRow,
  type SwipeableDecisionRowHandle,
} from '../components/SwipeableDecisionRow';
import {
  archiveDecision,
  deleteDecision,
  getDecisions,
  saveDecision,
} from '../storage/decisionStorage';
import { colors, layout, motion, radii, spacing } from '../theme';
import type { Decision } from '../types/decision';
import type {
  AppNotification,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation';
import { createAppNotification } from '../types/notification';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'DecisionList'>,
  NativeStackScreenProps<RootStackParamList>
>;

type ActionNotification = AppNotification & {
  actionLabel?: string;
  onAction?: () => void;
};

type DecisionFilter =
  | 'all'
  | 'in-progress'
  | 'acted'
  | 'completed'
  | 'archived';

const filters: { id: DecisionFilter; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'in-progress', label: 'En cours' },
  { id: 'acted', label: 'Actées' },
  { id: 'completed', label: 'Terminées' },
  { id: 'archived', label: 'Archivées' },
];

const DECISION_HIGHLIGHT_DURATION_MS = 2800;

export function DecisionListScreen({ navigation, route }: Props) {
  const routeNotification = route.params?.notification;
  const routeFilter = route.params?.filter;
  const routeHighlightedDecisionId = route.params?.highlightedDecisionId;
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<DecisionFilter>('all');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<ActionNotification | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [highlightedDecisionId, setHighlightedDecisionId] =
    useState<string | null>(null);

  const rowRefs = useRef(
    new Map<string, RefObject<SwipeableDecisionRowHandle | null>>(),
  );
  const openRowId = useRef<string | null>(null);
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getRowRef = useCallback((decisionId: string) => {
    const existingRef = rowRefs.current.get(decisionId);

    if (existingRef) {
      return existingRef;
    }

    const nextRef = createRef<SwipeableDecisionRowHandle>();
    rowRefs.current.set(decisionId, nextRef);
    return nextRef;
  }, []);

  const closeOpenRow = useCallback((animated = true) => {
    const decisionId = openRowId.current;

    if (!decisionId) {
      return;
    }

    rowRefs.current.get(decisionId)?.current?.close(animated);
    openRowId.current = null;
  }, []);

  const handleRowWillOpen = useCallback(
    (decisionId: string) => {
      const previousId = openRowId.current;

      if (previousId && previousId !== decisionId) {
        rowRefs.current.get(previousId)?.current?.close();
      }

      openRowId.current = decisionId;
    },
    [],
  );

  const handleRowDidClose = useCallback((decisionId: string) => {
    if (openRowId.current === decisionId) {
      openRowId.current = null;
    }
  }, []);

  const loadDecisions = useCallback(async () => {
    closeOpenRow(false);
    setIsLoading(true);
    setLoadError(null);

    try {
      setDecisions(await getDecisions());
    } catch {
      setLoadError('Impossible de charger vos décisions.');
    } finally {
      setIsLoading(false);
    }
  }, [closeOpenRow]);

  const showNotification = useCallback(
    (nextNotification: ActionNotification) => {
      setNotification(nextNotification);
      setIsNotificationVisible(true);
    },
    [],
  );

  const restorePreviousStatus = useCallback(
    async (decision: Decision) => {
      try {
        await saveDecision({
          ...decision,
          updatedAt: new Date().toISOString(),
        });
        await loadDecisions();
      } catch {
        showNotification({
          ...createAppNotification({
            message: 'Le statut précédent n’a pas pu être restauré.',
            title: 'Annulation impossible',
            type: 'decision_status',
          }),
        });
      }
    },
    [loadDecisions, showNotification],
  );

  const openDecisionById = useCallback(
    async (decisionId: string) => {
      try {
        const storedDecisions = await getDecisions();
        const decision = storedDecisions.find(
          (item) => item.id === decisionId,
        );

        if (!decision) {
          throw new Error('Décision introuvable');
        }

        navigation.navigate('DecisionDetail', {
          decisionId: decision.id,
        });
      } catch {
        showNotification({
          ...createAppNotification({
            message: 'Cette décision n’est plus disponible.',
            title: 'Ouverture impossible',
            type: 'decision_status',
          }),
        });
      }
    },
    [navigation, showNotification],
  );

  useEffect(() => {
    if (routeNotification) {
      const routeAction = routeNotification.action;
      showNotification({
        ...routeNotification,
        actionLabel: routeAction?.label,
        onAction:
          routeAction?.type === 'restore-decision'
            ? () => {
                void restorePreviousStatus(routeAction.decision);
              }
            : routeAction?.type === 'view-decision'
              ? () => {
                  void openDecisionById(routeAction.relatedDecisionId);
                }
              : routeAction?.type === 'review-decision'
                ? () => {
                    navigation.navigate('DecisionReview', {
                      decisionId: routeAction.relatedDecisionId,
                    });
                  }
                : routeAction?.type === 'view-journey'
                  ? () => navigation.navigate('Journey')
                : undefined,
      });
      navigation.setParams({ notification: undefined });
    }
  }, [
    navigation,
    restorePreviousStatus,
    openDecisionById,
    routeNotification?.id,
    routeNotification,
    showNotification,
  ]);

  useEffect(() => {
    let consumedTemporaryParams = false;

    if (routeFilter) {
      setFilter(routeFilter);
      consumedTemporaryParams = true;
    }

    if (routeHighlightedDecisionId) {
      setHighlightedDecisionId(routeHighlightedDecisionId);
      consumedTemporaryParams = true;
    }

    if (consumedTemporaryParams) {
      navigation.setParams({
        filter: undefined,
        highlightedDecisionId: undefined,
      });
    }
  }, [navigation, routeFilter, routeHighlightedDecisionId]);

  useEffect(() => {
    const highlightedDecisionExists = decisions.some(
      (decision) => decision.id === highlightedDecisionId,
    );

    if (highlightedDecisionId && !isLoading && !highlightedDecisionExists) {
      setHighlightedDecisionId(null);
      return;
    }

    if (
      !highlightedDecisionId ||
      isLoading ||
      !highlightedDecisionExists ||
      highlightTimeout.current
    ) {
      return;
    }

    highlightTimeout.current = setTimeout(() => {
      setHighlightedDecisionId(null);
      highlightTimeout.current = null;
    }, DECISION_HIGHLIGHT_DURATION_MS);
  }, [decisions, highlightedDecisionId, isLoading]);

  useEffect(
    () => () => {
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      closeOpenRow(false);
      void loadDecisions();

      return () => {
        closeOpenRow(false);
      };
    }, [closeOpenRow, loadDecisions]),
  );

  useEffect(() => {
    const visibleDecisionIds = new Set(
      decisions.map((decision) => decision.id),
    );

    if (
      openRowId.current &&
      !visibleDecisionIds.has(openRowId.current)
    ) {
      closeOpenRow(false);
    }

    rowRefs.current.forEach((_, decisionId) => {
      if (!visibleDecisionIds.has(decisionId)) {
        rowRefs.current.delete(decisionId);
      }
    });
  }, [closeOpenRow, decisions]);

  const undoRemoval = useCallback(async (decision: Decision) => {
    await saveDecision({
      ...decision,
      updatedAt: new Date().toISOString(),
    });
    await loadDecisions();
  }, [loadDecisions]);

  const handleArchive = useCallback(async (decision: Decision) => {
    try {
      const archivedDecision = await archiveDecision(decision.id);
      setDecisions((current) =>
        current.map((item) =>
          item.id === decision.id ? archivedDecision : item,
        ),
      );
      showNotification({
        ...createAppNotification({
          action: {
            decision,
            label: 'Annuler',
            type: 'restore-decision',
          },
          message: 'Elle reste disponible dans vos archives.',
          relatedDecisionId: decision.id,
          title: 'Décision archivée',
          type: 'decision_status',
        }),
        actionLabel: 'Annuler',
        onAction: () => {
          void undoRemoval(decision);
        },
      });
    } catch {
      showNotification({
        ...createAppNotification({
          message: 'La décision n’a pas été déplacée.',
          title: 'Archivage impossible',
          type: 'decision_status',
        }),
      });
    }
  }, [showNotification, undoRemoval]);

  const handleDelete = useCallback(async (decision: Decision) => {
    try {
      await deleteDecision(decision.id);
      setDecisions((current) =>
        current.filter((item) => item.id !== decision.id),
      );
      showNotification({
        ...createAppNotification({
          action: {
            decision,
            label: 'Annuler',
            type: 'restore-decision',
          },
          message: 'Vous pouvez encore annuler cette action.',
          relatedDecisionId: decision.id,
          title: 'Décision supprimée',
          type: 'decision_status',
        }),
        actionLabel: 'Annuler',
        onAction: () => {
          void undoRemoval(decision);
        },
      });
    } catch {
      showNotification({
        ...createAppNotification({
          message: 'La décision n’a pas été supprimée.',
          title: 'Suppression impossible',
          type: 'decision_status',
        }),
      });
    }
  }, [showNotification, undoRemoval]);

  const openDecision = useCallback(
  (decision: Decision) => {
    closeOpenRow(false);
    navigation.navigate('DecisionDetail', {
      decisionId: decision.id,
    });
  },
  [closeOpenRow, navigation],
);

  const filteredDecisions = useMemo(() => {
   if (filter === 'in-progress') {
  return decisions.filter((decision) =>
    ['draft', 'reflecting'].includes(decision.status),
  );
}

    if (filter === 'all') {
      return decisions;
    }

    if (filter === 'acted') {
      return decisions.filter((decision) =>
        ['acted', 'tracking'].includes(decision.status),
      );
    }

    return decisions.filter((decision) => decision.status === filter);
  }, [decisions, filter]);

  const decisionSections = useMemo(
    () =>
      [
        {
          data: filteredDecisions.filter((decision) =>
            ['draft', 'reflecting'].includes(decision.status),
          ),
          title: 'En réflexion',
        },
        {
          data: filteredDecisions.filter(
            (decision) => decision.status === 'acted',
          ),
          title: 'Décisions actées',
        },
        {
          data: filteredDecisions.filter(
            (decision) => decision.status === 'tracking',
          ),
          title: 'En suivi',
        },
        {
          data: filteredDecisions.filter(
            (decision) => decision.status === 'completed',
          ),
          title: 'Décisions terminées',
        },
        {
          data: filteredDecisions.filter(
            (decision) => decision.status === 'cancelled',
          ),
          title: 'Décisions annulées',
        },
        {
          data: filteredDecisions.filter(
            (decision) => decision.status === 'archived',
          ),
          title: 'Décisions archivées',
        },
      ].filter((section) => section.data.length > 0),
    [filteredDecisions],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.screen}>
          <FadeInView style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text accessibilityRole="header" style={styles.title}>
                Mes décisions
              </Text>
              <Text style={styles.subtitle}>
                Vos choix, toujours à portée de main.
              </Text>
            </View>
            <AnimatedPressable
              accessibilityLabel="Ouvrir les archives"
              accessibilityRole="button"
              onPress={() => {
                closeOpenRow(false);
                navigation.navigate('Archives');
              }}
              pressedStyle={styles.archiveButtonPressed}
              scaleTo={motion.subtlePressScale}
              style={[
                styles.archiveButton,
                Platform.OS === 'web' && styles.webButton,
              ]}
            >
              <Text style={styles.archiveButtonLabel}>Archives</Text>
            </AnimatedPressable>
          </FadeInView>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.stateText}>Chargement de vos décisions…</Text>
            </View>
          ) : loadError ? (
            <View style={styles.centerState}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {loadError}
              </Text>
              <PrimaryButton
                label="Réessayer"
                onPress={() => void loadDecisions()}
              />
            </View>
          ) : decisions.length === 0 ? (
            <View style={styles.centerState}>
              <View style={styles.emptyIcon}>
                <AppIcon color={colors.primary} name="decision" size="xl" />
              </View>
              <Text style={styles.emptyTitle}>Aucune décision en cours</Text>
              <Text style={styles.stateText}>
                Votre prochaine décision apparaîtra ici avec ses arguments.
              </Text>
              <View style={styles.emptyAction}>
                <PrimaryButton
                  label="Nouvelle décision"
                  onPress={() => navigation.navigate('NewDecision')}
                />
              </View>
            </View>
          ) : (
            <SectionList
              contentContainerStyle={styles.listContent}
              sections={decisionSections}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <View>
                  <ScrollView
                    accessibilityRole="tablist"
                    contentContainerStyle={styles.filters}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {filters.map((item) => {
                      const selected = item.id === filter;

                      return (
                        <AnimatedPressable
                          accessibilityRole="tab"
                          accessibilityState={{ selected }}
                          key={item.id}
                          onPress={() => {
                            closeOpenRow();
                            setFilter(item.id);
                          }}
                          pressedStyle={styles.filterPressed}
                          style={[
                            styles.filter,
                            selected && styles.filterSelected,
                            Platform.OS === 'web' && styles.webButton,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterLabel,
                              selected && styles.filterLabelSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </AnimatedPressable>
                      );
                    })}
                  </ScrollView>
                  <Text style={styles.swipeHint}>
                    Glissez vers la gauche pour plus d’options.
                  </Text>
                  {filteredDecisions.length === 0 ? (
                    <View style={styles.filteredEmpty}>
                      <Text style={styles.filteredEmptyTitle}>
                        Aucune décision ici
                      </Text>
                      <Text style={styles.filteredEmptyText}>
                        Les décisions correspondant à ce statut apparaîtront ici.
                      </Text>
                    </View>
                  ) : null}
                </View>
              }
              renderItem={({ index, item }) => (
                <FadeInView
                  delay={Math.min(index, 5) * 35}
                  style={[
                    styles.decisionRow,
                    highlightedDecisionId === item.id &&
                      styles.decisionRowHighlighted,
                  ]}
                >
                  <SwipeableDecisionRow
                    decision={item}
                    ref={getRowRef(item.id)}
                    onArchive={
                      item.status === 'archived' ||
                      item.status === 'completed'
                        ? undefined
                        : handleArchive
                    }
                    onDelete={handleDelete}
                    onDidClose={handleRowDidClose}
                    onOpen={
                      openDecision
                    }
                    onWillOpen={handleRowWillOpen}
                  />
                  {['acted', 'tracking'].includes(item.status) ? (
                    <AnimatedPressable
                      accessibilityHint="Ouvre le bilan avant de terminer cette décision."
                      accessibilityLabel={`Faire le bilan de ${item.title}`}
                      accessibilityRole="button"
                      haptic="selection"
                      onPress={() => {
                        closeOpenRow(false);
                        navigation.navigate('DecisionReview', {
                          decisionId: item.id,
                        });
                      }}
                      pressedStyle={styles.completeButtonPressed}
                      scaleTo={motion.subtlePressScale}
                      style={[
                        styles.completeButton,
                        Platform.OS === 'web' && styles.webButton,
                      ]}
                    >
                      <AppIcon
                        color={colors.success}
                        name="check-circle"
                        size="sm"
                        weight="medium"
                      />
                      <Text style={styles.completeButtonLabel}>
                        Faire le bilan
                      </Text>
                    </AnimatedPressable>
                  ) : null}
                </FadeInView>
              )}
              renderSectionHeader={({ section }) => (
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  {section.title}
                </Text>
              )}
              onScrollBeginDrag={() => closeOpenRow()}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              style={styles.list}
            />
          )}
        </View>
      </SafeAreaView>

      {notification ? (
        <InAppNotification
          actionLabel={notification.actionLabel}
          duration={notification.actionLabel ? 5500 : 4000}
          message={notification.message}
          title={notification.title}
          type={notification.type}
          onAction={notification.onAction}
          onDismiss={() => setIsNotificationVisible(false)}
          visible={isNotificationVisible}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: layout.wideContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 42,
  },
  subtitle: {
    maxWidth: 420,
    marginTop: 10,
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 24,
  },
  archiveButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.base,
    backgroundColor: colors.white,
  },
  archiveButtonPressed: { borderColor: colors.primary },
  archiveButtonLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  list: { flex: 1, marginTop: 22 },
  listContent: { paddingBottom: 28 },
  filters: { gap: spacing.xs, paddingBottom: spacing.md },
  filter: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  filterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterPressed: { borderColor: colors.focus },
  filterLabel: {
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  filterLabelSelected: { color: colors.white },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 11,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.25,
  },
  decisionRow: {
    marginBottom: 14,
  },
  decisionRowHighlighted: {
    padding: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: radii.card,
    backgroundColor: colors.successSoft,
  },
  completeButton: {
    minHeight: layout.touchTarget,
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.base,
    backgroundColor: colors.white,
  },
  completeButtonPressed: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  completeButtonLabel: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  swipeHint: {
    marginBottom: 2,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  filteredEmpty: {
    alignItems: 'center',
    paddingTop: spacing.huge,
    paddingHorizontal: spacing.lg,
  },
  filteredEmptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  filteredEmptyText: {
    maxWidth: 330,
    marginTop: spacing.sm,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  stateText: {
    maxWidth: 340,
    marginTop: 12,
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  errorText: {
    maxWidth: 340,
    marginBottom: 20,
    color: colors.danger,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.card,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: {
    marginTop: 22,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  emptyAction: { width: '100%', maxWidth: 360, marginTop: 28 },
  webButton: { cursor: 'pointer' },
});
