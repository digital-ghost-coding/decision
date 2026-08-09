import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../components/AppIcon';
import { BackButton } from '../components/BackButton';
import { FadeInView } from '../components/FadeInView';
import { InAppNotification } from '../components/InAppNotification';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { getArgumentWeightLabel } from '../constants/argumentWeights';
import { decisionStatusPresentation } from '../constants/decisionStatus';
import {
  getDecision,
  restoreDecision,
} from '../storage/decisionStorage';
import { colors, layout, radii, shadows, spacing } from '../theme';
import type { Argument, Decision } from '../types/decision';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DecisionDetail'>;

function formatDate(value?: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function ArgumentList({ emptyLabel, items }: { emptyLabel: string; items: Argument[] }) {
  return (
    <View style={styles.argumentList}>
      {items.length > 0 ? (
        items.map((argument) => (
          <View key={argument.id} style={styles.argumentRow}>
            <View style={styles.argumentDot} />
            <View style={styles.argumentContent}>
              <Text style={styles.argumentText}>{argument.text}</Text>
              <Text style={styles.argumentWeight}>
                {getArgumentWeightLabel(argument.weight)}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyArguments}>{emptyLabel}</Text>
      )}
    </View>
  );
}

export function DecisionDetailScreen({ navigation, route }: Props) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadDecision = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const storedDecision = await getDecision(route.params.decisionId);

      if (!storedDecision) {
        throw new Error('Décision introuvable');
      }

      setDecision(storedDecision);
    } catch {
      setLoadError('Cette décision n’est plus disponible.');
    } finally {
      setIsLoading(false);
    }
  }, [route.params.decisionId]);


  const getFreshDecision = useCallback(async () => {
  const freshDecision = await getDecision(route.params.decisionId);

  if (!freshDecision) {
    throw new Error('Décision introuvable');
  }

  return freshDecision;
}, [route.params.decisionId]);

  useFocusEffect(
    useCallback(() => {
      void loadDecision();
    }, [loadDecision]),
  );

  const restore = async () => {
    if (!decision) {
      return;
    }

    try {
      const restoredDecision = await restoreDecision(decision.id);
      setDecision(restoredDecision);
      setMessage('La décision a été restaurée.');
    } catch {
      setMessage('La décision n’a pas pu être restaurée.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!decision || loadError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.errorScreen}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text accessibilityRole="alert" style={styles.errorText}>
            {loadError ?? 'Cette décision n’est plus disponible.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = decisionStatusPresentation[decision.status];
  const hasComparison =
    decision.format === 'compare' &&
    Boolean(decision.options?.optionA) &&
    Boolean(decision.options?.optionB);
  const actedDate = formatDate(decision.actedAt);
  const trackingDate = formatDate(decision.trackingDate);
  const followUpIsDue =
    decision.status === 'tracking' &&
    Boolean(decision.trackingDate) &&
    new Date(decision.trackingDate as string).getTime() <= Date.now();
  const allArguments = [...decision.pros, ...decision.cons];
  const getComparisonArguments = (
    optionKey: 'optionA' | 'optionB',
    side: 'pro' | 'con',
  ) =>
    allArguments.filter(
      (argument) =>
        argument.optionKey === optionKey && argument.side === side,
    );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <BackButton onPress={() => navigation.goBack()} />

            <FadeInView style={styles.header}>
              <View
                accessibilityLabel={`Statut : ${status.label}`}
                style={[
                  styles.statusBadge,
                  { backgroundColor: status.backgroundColor },
                ]}
              >
                <AppIcon color={status.color} name={status.icon} size="sm" />
                <Text style={[styles.statusLabel, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                {decision.title}
              </Text>
            </FadeInView>

            {decision.chosenOption ? (
              <FadeInView delay={50} style={styles.chosenOptionCard}>
                <Text style={styles.chosenOptionLabel}>Choix retenu</Text>
                <Text style={styles.chosenOptionValue}>
                  {decision.chosenOption}
                </Text>
              </FadeInView>
            ) : null}

            {(actedDate || trackingDate) ? (
              <FadeInView delay={60} style={styles.datesCard}>
                {actedDate ? (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Actée le</Text>
                    <Text style={styles.dateValue}>{actedDate}</Text>
                  </View>
                ) : null}
                {trackingDate ? (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>
                      {followUpIsDue ? 'Suivi à faire' : 'Retour prévu le'}
                    </Text>
                    <Text style={styles.dateValue}>{trackingDate}</Text>
                  </View>
                ) : null}
              </FadeInView>
            ) : null}

            <FadeInView delay={100} style={styles.argumentsCard}>
              {hasComparison ? (
                <View style={styles.comparisonGroups}>
                  {(['optionA', 'optionB'] as const).map((optionKey) => (
                    <View key={optionKey} style={styles.comparisonGroup}>
                      <Text style={styles.optionLabel}>
                        {optionKey === 'optionA' ? 'Option A' : 'Option B'}
                      </Text>
                      <Text style={styles.sectionTitle}>
                        {decision.options?.[optionKey]}
                      </Text>

                      <View style={styles.argumentSection}>
                        <Text style={styles.argumentSubtitle}>Atouts</Text>
                        <ArgumentList
                          emptyLabel="Aucun atout pour cette option."
                          items={getComparisonArguments(optionKey, 'pro')}
                        />
                      </View>

                      <View style={styles.argumentSection}>
                        <Text style={styles.argumentSubtitle}>Freins</Text>
                        <ArgumentList
                          emptyLabel="Aucun frein pour cette option."
                          items={getComparisonArguments(optionKey, 'con')}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <>
                  <View style={styles.argumentSection}>
                    <Text style={styles.sectionTitle}>Pour</Text>
                    <ArgumentList
                      emptyLabel="Aucun argument pour cette décision."
                      items={decision.pros}
                    />
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.argumentSection}>
                    <Text style={styles.sectionTitle}>Contre</Text>
                    <ArgumentList
                      emptyLabel="Aucun argument contre cette décision."
                      items={decision.cons}
                    />
                  </View>
                </>
              )}
            </FadeInView>

            <FadeInView delay={140} style={styles.actions}>
              {['draft', 'reflecting', 'cancelled'].includes(decision.status) ? (
            <PrimaryButton
              label="Continuer ma réflexion"
              onPress={async () => {
                const freshDecision = await getFreshDecision();

                navigation.navigate('DecisionArguments', {
                  decision: freshDecision,
                  decisionTitle: freshDecision.title,
                  format: freshDecision.format,
                  options: freshDecision.options,
                });
              }}
            />
              ) : null}

              {decision.status === 'acted' ? (
                <>
                 <PrimaryButton
                    label="Planifier un suivi"
                    onPress={async () =>
                      navigation.navigate('DecisionFollowUp', {
                        decision: await getFreshDecision(),
                        origin: 'detail',
                      })
                    }
                  />
                  <SecondaryButton
                    label="Faire le bilan"
                    onPress={() =>
                      navigation.navigate('DecisionReview', {
                        decisionId: decision.id,
                      })
                    }
                  />
                </>
              ) : null}

              {decision.status === 'tracking' ? (
                <>
                  <PrimaryButton
                    label="Faire le bilan"
                    onPress={() =>
                      navigation.navigate('DecisionReview', {
                        decisionId: decision.id,
                      })
                    }
                  />
                  <SecondaryButton
                    label="Modifier le suivi"
                    onPress={() => navigation.navigate('DecisionFollowUp', {
                      decision,
                      origin: 'detail',
                    })}
                  />
                </>
              ) : null}

              {decision.status === 'completed' ? (
                <SecondaryButton
                  label={decision.satisfaction ? 'Modifier mon bilan' : 'Ajouter un bilan'}
                  onPress={() =>
                    navigation.navigate('DecisionReview', {
                      decisionId: decision.id,
                    })
                  }
                />
              ) : null}

              {decision.status === 'archived' ? (
                <PrimaryButton label="Restaurer" onPress={() => void restore()} />
              ) : null}
            </FadeInView>
          </View>
        </ScrollView>
      </SafeAreaView>

      <InAppNotification
        message={message ?? ''}
        onDismiss={() => setMessage(null)}
        visible={Boolean(message)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  screen: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorScreen: {
    flex: 1,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.xs,
  },
  errorText: { marginTop: spacing.xl, color: colors.danger, fontSize: 16 },
  header: { marginTop: spacing.xl },
  statusBadge: {
    minHeight: 36,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    borderRadius: radii.pill,
  },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  title: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 41,
  },
  datesCard: {
    marginTop: spacing.lg,
    gap: spacing.base,
    padding: spacing.ml,
    borderRadius: radii.card,
    backgroundColor: colors.primarySoft,
  },
  chosenOptionCard: {
    marginTop: spacing.lg,
    padding: spacing.ml,
    borderWidth: 1,
    borderColor: colors.successSoft,
    borderRadius: radii.card,
    backgroundColor: colors.successSoft,
  },
  chosenOptionLabel: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chosenOptionValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateLabel: { color: colors.secondaryText, fontSize: 15 },
  dateValue: { color: colors.primaryDark, fontSize: 15, fontWeight: '700' },
  argumentsCard: {
    marginTop: spacing.lg,
    padding: spacing.ml,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  argumentSection: { gap: spacing.md },
  comparisonGroups: {
    gap: spacing.md,
  },
  comparisonGroup: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  optionLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  argumentSubtitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  argumentList: { gap: spacing.sm },
  argumentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  argumentDot: {
    width: 7,
    height: 7,
    marginTop: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  argumentText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  argumentContent: {
    flex: 1,
  },
  argumentWeight: {
    marginTop: 2,
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyArguments: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: spacing.ml,
    backgroundColor: colors.border,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.base,
  },
});
