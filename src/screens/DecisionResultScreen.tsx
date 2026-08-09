import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { BackButton } from '../components/BackButton';
import { FadeInView } from '../components/FadeInView';
import { PrimaryButton } from '../components/PrimaryButton';
import { ResultCard, type ResultChoice } from '../components/ResultCard';
import { getDecisions, saveDecision } from '../storage/decisionStorage';
import { colors, layout, radii, spacing, typography } from '../theme';
import type { Decision } from '../types/decision';
import type { RootStackParamList } from '../types/navigation';
import { calculateDecisionScore } from '../utils/calculateDecisionScore';

type Props = NativeStackScreenProps<RootStackParamList, 'DecisionResult'>;

function getEvaluationChoice(decision: Decision, answer: 'Oui' | 'Non') {
  const subject = decision.title.replace(/\s*\?+\s*$/, '').trim();

  return subject ? `${answer} — ${subject}` : answer;
}

export function DecisionResultScreen({ navigation, route }: Props) {
  const [decision, setDecision] = useState(route.params.decision);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(
    route.params.decision.chosenOption ?? null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFreshDecision() {
      const decisions = await getDecisions();
      const freshDecision = decisions.find((item) => item.id === route.params.decision.id);

      if (freshDecision && isMounted) {
        setDecision(freshDecision);
        setSelectedChoice(
          (currentChoice) => currentChoice ?? freshDecision.chosenOption ?? null,
        );
      }
    }

    void loadFreshDecision();

    return () => {
      isMounted = false;
    };
  }, [route.params.decision.id]);

  const score = useMemo(() => calculateDecisionScore(decision), [decision]);
  const hasOptions = Boolean(decision.options?.optionA && decision.options?.optionB);

  const choices = useMemo<ResultChoice[]>(() => {
    if (decision.options?.optionA && decision.options.optionB) {
      return [
        {
          label: decision.options.optionA,
          value: decision.options.optionA,
        },
        {
          label: decision.options.optionB,
          value: decision.options.optionB,
        },
      ];
    }

    return [
      {
        label: 'Oui',
        value: getEvaluationChoice(decision, 'Oui'),
      },
      {
        label: 'Non',
        value: getEvaluationChoice(decision, 'Non'),
      },
    ];
  }, [decision]);

  useEffect(() => {
    if (selectedChoice && !choices.some((choice) => choice.value === selectedChoice)) {
      setSelectedChoice(null);
    }
  }, [choices, selectedChoice]);

  const selectedChoiceLabel = choices.find((choice) => choice.value === selectedChoice)?.label;

  const continueDecision = useCallback(() => {
    if (!selectedChoice) {
      return;
    }

    navigation.navigate('DecisionCommitment', {
      decision: {
        ...decision,
        chosenOption: selectedChoice,
      },
    });
  }, [decision, navigation, selectedChoice]);

  const editArguments = useCallback(() => {
    navigation.navigate('DecisionArguments', {
      decision,
      decisionTitle: decision.title,
      format: decision.format,
      options: decision.options,
    });
  }, [decision, navigation]);

  const continueReflecting = useCallback(async () => {
    setSaveError(null);

    const reflectingDecision: Decision = {
      ...decision,
      chosenOption: undefined,
      status: 'reflecting',
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveDecision(reflectingDecision);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: 'DecisionList',
            },
          },
        ],
      });
    } catch {
      setSaveError('Impossible d’enregistrer ce choix pour le moment. Réessayez.');
    }
  }, [decision, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screen}>
          <BackButton onPress={navigation.goBack} />

          <FadeInView delay={80} style={styles.header}>
            <Text style={styles.eyebrow}>VOTRE RÉFLEXION</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Votre décision est prête
            </Text>
            <Text style={styles.decisionTitle}>{decision.title}</Text>
          </FadeInView>

          <FadeInView delay={150} style={styles.resultSection}>
            <ResultCard
              choices={choices}
              decision={decision}
              onSelectChoice={setSelectedChoice}
              score={score}
              selectedChoice={selectedChoice}
            />
          </FadeInView>

          {hasOptions ? (
            <AnimatedPressable
              accessibilityHint="Enregistre la décision comme étant encore en réflexion"
              accessibilityRole="button"
              onPress={() => {
                void continueReflecting();
              }}
              style={styles.reflectButton}
            >
              <Text style={styles.reflectButtonText}>Je souhaite encore réfléchir</Text>
            </AnimatedPressable>
          ) : null}

          {saveError ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {saveError}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <PrimaryButton
            disabled={!selectedChoice}
            label={
              selectedChoiceLabel
                ? `Continuer avec ${selectedChoiceLabel}`
                : 'Choisissez une option'
            }
            onPress={continueDecision}
          />

          <AnimatedPressable
            accessibilityHint="Revient à l’écran des arguments"
            accessibilityRole="button"
            onPress={editArguments}
            style={styles.reviewButton}
          >
            <Text style={styles.reviewButtonText}>Revoir mes arguments</Text>
          </AnimatedPressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  screen: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  header: {
    marginTop: spacing.xl,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.4,
  },
  title: {
    ...typography.headingLarge,
    marginTop: spacing.sm,
    color: colors.text,
  },
  decisionTitle: {
    ...typography.bodyMedium,
    marginTop: spacing.sm,
    color: colors.secondaryText,
  },
  resultSection: {
    marginTop: spacing.xl,
  },
  reflectButton: {
    minHeight: 44,
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  reflectButtonText: {
    ...typography.caption,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  errorText: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.danger,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerContent: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  reviewButton: {
    minHeight: 44,
    marginTop: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
});
