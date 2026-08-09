import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { BackButton } from '../components/BackButton';
import { DecisionCommitCircle } from '../components/DecisionCommitCircle';
import { FadeInView } from '../components/FadeInView';
import { COMMIT_COMPLETION_SETTLE_MS } from '../interactions/commitAnimation';
import { saveDecision } from '../storage/decisionStorage';
import {
  colors,
  layout,
  motion,
  radii,
  spacing,
  typography,
} from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { getCommitCircleSize } from '../utils/commitCircleSize';
import { transitionDecision } from '../utils/decisionLifecycle';

type Props = NativeStackScreenProps<RootStackParamList, 'DecisionCommitment'>;

export function DecisionCommitmentScreen({ navigation, route }: Props) {
  const confirmationLock = useRef(false);
  const { height: viewportHeight } = useWindowDimensions();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { decision } = route.params;
  const concreteChoice = decision.chosenOption ?? decision.title;
  const circleSize = getCommitCircleSize(viewportHeight);
  const isCompact = viewportHeight <= 700;

  const waitForCompletionAnimation = () =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, COMMIT_COMPLETION_SETTLE_MS);
    });

  const commitDecision = async () => {
    if (confirmationLock.current) {
      return;
    }

    confirmationLock.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      await waitForCompletionAnimation();

      const actedDecision = transitionDecision(decision, 'acted', concreteChoice);
      await saveDecision(actedDecision);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'DecisionFollowUp',
            params: {
              decision: actedDecision,
              origin: 'commitment',
            },
          },
        ],
      });
    } catch {
      confirmationLock.current = false;
      setIsSaving(false);
      setSaveError('Impossible de confirmer ce choix. Veuillez réessayer.');
    }
  };

  const continueLater = async () => {
    if (confirmationLock.current) {
      return;
    }

    confirmationLock.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      await saveDecision({
        ...decision,
        chosenOption: undefined,
        status: 'reflecting',
        updatedAt: new Date().toISOString(),
      });

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
      confirmationLock.current = false;
      setIsSaving(false);
      setSaveError(
        'Impossible d’enregistrer cette réflexion. Veuillez réessayer.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.screen, isCompact && styles.screenCompact]}>
          <BackButton
            onPress={() => {
              if (!isSaving) {
                navigation.goBack();
              }
            }}
          />

          <FadeInView style={[styles.content, isCompact && styles.contentCompact]}>
            <Text style={styles.eyebrow}>ACTER MA DÉCISION</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Confirmez votre choix
            </Text>

            <View style={[styles.choiceCard, isCompact && styles.choiceCardCompact]}>
              <Text style={styles.choiceLabel}>VOTRE CHOIX</Text>
              <Text style={styles.choiceTitle}>{concreteChoice}</Text>
            </View>

            <Text style={styles.subtitle}>
              Vous pourrez toujours faire évoluer cette décision.
            </Text>
          </FadeInView>

          <FadeInView
            delay={90}
            style={[styles.interaction, isCompact && styles.interactionCompact]}
          >
            <DecisionCommitCircle
              disabled={isSaving}
              onComplete={commitDecision}
              size={circleSize}
            />

            <AnimatedPressable
              accessibilityHint="Conserve cette décision en réflexion sans la confirmer"
              accessibilityRole="button"
              disabled={isSaving}
              haptic="selection"
              onPress={() => void continueLater()}
              pressedStyle={styles.laterButtonPressed}
              scaleTo={motion.subtlePressScale}
              style={[
                styles.laterButton,
                isCompact && styles.laterButtonCompact,
                Platform.OS === 'web' && styles.webButton,
              ]}
            >
              <Text
                style={[
                  styles.laterLabel,
                  isSaving && styles.laterLabelDisabled,
                ]}
              >
                Je veux encore réfléchir
              </Text>
            </AnimatedPressable>

            {saveError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {saveError}
              </Text>
            ) : null}
          </FadeInView>
        </View>
      </ScrollView>
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
  },
  screen: {
    flexGrow: 1,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  screenCompact: {
    paddingBottom: spacing.sm,
  },
  content: {
    marginTop: spacing.lg,
  },
  contentCompact: {
    marginTop: spacing.md,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.1,
  },
  title: {
    ...typography.headingLarge,
    marginTop: spacing.xs,
    color: colors.text,
  },
  choiceCard: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },
  choiceCardCompact: {
    marginTop: spacing.base,
    paddingVertical: spacing.sm,
  },
  choiceLabel: {
    ...typography.caption,
    color: colors.primaryDark,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  choiceTitle: {
    ...typography.bodyLarge,
    marginTop: spacing.xxs,
    color: colors.text,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.bodyMedium,
    marginTop: spacing.base,
    color: colors.secondaryText,
  },
  interaction: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  interactionCompact: {
    justifyContent: 'flex-start',
    paddingTop: spacing.md,
    paddingBottom: 0,
  },
  laterButton: {
    minHeight: layout.touchTarget,
    marginTop: spacing.base,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.base,
  },
  laterButtonCompact: {
    marginTop: spacing.sm,
  },
  laterButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  laterLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  laterLabelDisabled: {
    color: colors.muted,
  },
  errorText: {
    ...typography.caption,
    maxWidth: 340,
    marginTop: spacing.sm,
    color: colors.danger,
    textAlign: 'center',
  },
  webButton: {
    cursor: 'pointer',
  },
});
