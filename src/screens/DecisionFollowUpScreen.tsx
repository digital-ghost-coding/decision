import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { AppIcon } from '../components/AppIcon';
import { FadeInView } from '../components/FadeInView';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  decisionFollowUpOptions,
  resolveFollowUpDate,
  type DecisionFollowUpOptionId,
} from '../constants/decisionFollowUp';
import { saveDecision } from '../storage/decisionStorage';
import { markDecisionFollowUpsRead } from '../storage/notificationStorage';
import { colors, layout, motion, radii, shadows, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { createAppNotification } from '../types/notification';
import { transitionDecision } from '../utils/decisionLifecycle';

type Props = NativeStackScreenProps<RootStackParamList, 'DecisionFollowUp'>;

function formatFollowUpDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function DecisionFollowUpScreen({ navigation, route }: Props) {
  const { decision } = route.params;
  const saveLock = useRef(false);
  const [selectedOptionId, setSelectedOptionId] =
    useState<DecisionFollowUpOptionId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedOption = useMemo(
    () =>
      decisionFollowUpOptions.find(
        (option) => option.id === selectedOptionId,
      ),
    [selectedOptionId],
  );

  const finish = async (optionId?: DecisionFollowUpOptionId) => {
    if (saveLock.current) {
      return;
    }

    saveLock.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      const option = decisionFollowUpOptions.find(
        (item) => item.id === optionId,
      );
      const trackingDate = option
        ? resolveFollowUpDate(option)
        : undefined;
      const nextDecision = trackingDate
        ? decision.status === 'tracking'
          ? {
              ...decision,
              trackingDate,
              updatedAt: new Date().toISOString(),
            }
          : transitionDecision({ ...decision, trackingDate }, 'tracking')
        : decision.status === 'tracking'
          ? transitionDecision(
              { ...decision, trackingDate: undefined },
              'acted',
            )
          : {
              ...decision,
              status: 'acted' as const,
              trackingDate: undefined,
              updatedAt: new Date().toISOString(),
            };

      await saveDecision(nextDecision);
      await markDecisionFollowUpsRead(nextDecision.id);

      const notification = createAppNotification({
        action: {
          label: 'Voir la décision',
          relatedDecisionId: nextDecision.id,
          type: 'view-decision',
        },
        message: trackingDate
          ? `Suivi prévu le ${formatFollowUpDate(trackingDate)}.`
          : 'Vous pourrez choisir un suivi plus tard.',
        relatedDecisionId: nextDecision.id,
        title: 'Décision actée',
        type: 'decision_status',
      });

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: 'DecisionList',
              params: { notification },
            },
          },
        ],
      });
    } catch {
      saveLock.current = false;
      setIsSaving(false);
      setSaveError('Impossible d’enregistrer ce suivi. Réessayez.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screen}>
          <FadeInView style={styles.header}>
            <View style={styles.confirmationIcon}>
              <AppIcon
                color={colors.success}
                name="check-circle"
                size="xl"
                weight="medium"
              />
            </View>
            <Text style={styles.eyebrow}>Décision actée</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Votre décision est maintenant actée.
            </Text>
            <Text style={styles.subtitle}>
              Souhaitez-vous revenir dessus plus tard ?
            </Text>
            {decision.chosenOption ? (
              <View style={styles.chosenOptionCard}>
                <Text style={styles.chosenOptionLabel}>Choix acté</Text>
                <Text style={styles.chosenOptionValue}>
                  {decision.chosenOption}
                </Text>
              </View>
            ) : null}
          </FadeInView>

          <FadeInView delay={90} style={styles.followUpCard}>
            <Text style={styles.question}>
              Quand souhaitez-vous faire le point ?
            </Text>
            <Text style={styles.helper}>
              Ce choix reste facultatif et pourra être modifié.
            </Text>

            <View style={styles.options}>
              {decisionFollowUpOptions.map((option) => {
                const selected = option.id === selectedOptionId;

                return (
                  <AnimatedPressable
                    accessibilityLabel={option.label}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: selected,
                      disabled: isSaving,
                    }}
                    disabled={isSaving}
                    haptic="selection"
                    key={option.id}
                    onPress={() => setSelectedOptionId(option.id)}
                    pressedStyle={styles.optionPressed}
                    scaleTo={motion.subtlePressScale}
                    style={[
                      styles.option,
                      selected && styles.optionSelected,
                      Platform.OS === 'web' && styles.webButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        selected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioSelected,
                      ]}
                    >
                      {selected ? (
                        <AppIcon
                          color={colors.white}
                          name="check"
                          size="xs"
                          weight="medium"
                        />
                      ) : null}
                    </View>
                  </AnimatedPressable>
                );
              })}
            </View>
          </FadeInView>

          <FadeInView delay={150} style={styles.actions}>
            <PrimaryButton
              disabled={!selectedOption || isSaving}
              label={isSaving ? 'Enregistrement…' : 'Continuer'}
              onPress={() => {
                if (selectedOption) {
                  void finish(selectedOption.id);
                }
              }}
            />
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  screen: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: { alignItems: 'flex-start' },
  confirmationIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderRadius: radii.card,
    backgroundColor: colors.successSoft,
  },
  eyebrow: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: 500,
    marginTop: spacing.base,
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 43,
  },
  subtitle: {
    maxWidth: 460,
    marginTop: spacing.md,
    color: colors.secondaryText,
    fontSize: 18,
    lineHeight: 28,
  },
  chosenOptionCard: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    padding: spacing.base,
    borderRadius: radii.md,
    backgroundColor: colors.successSoft,
  },
  chosenOptionLabel: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chosenOptionValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  followUpCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  question: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 28,
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
  },
  options: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    minWidth: 150,
    minHeight: 54,
    flexGrow: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  optionPressed: { borderColor: colors.focus },
  optionLabel: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  optionLabelSelected: { color: colors.primaryDark },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  actions: { marginTop: spacing.lg, gap: spacing.base },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  webButton: { cursor: 'pointer' },
});
