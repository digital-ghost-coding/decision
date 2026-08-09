import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { AppIcon } from '../components/AppIcon';
import { BackButton } from '../components/BackButton';
import { FadeInView } from '../components/FadeInView';
import { FollowUpDatePicker } from '../components/FollowUpDatePicker';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import {
  decisionFollowUpOptions,
  resolveFollowUpDate,
  type DecisionFollowUpOptionId,
} from '../constants/decisionFollowUp';
import { saveDecision } from '../storage/decisionStorage';
import { markDecisionFollowUpsRead } from '../storage/notificationStorage';
import { colors, layout, motion, radii, shadows, spacing } from '../theme';
import type { Decision } from '../types/decision';
import type { RootStackParamList } from '../types/navigation';
import { createAppNotification } from '../types/notification';
import {
  isFutureLocalCalendarDate,
  parseTrackingDate,
} from '../utils/followUpDate';
import {
  removeDecisionFollowUp,
  scheduleDecisionFollowUp,
} from '../utils/decisionLifecycle';

type Props = NativeStackScreenProps<RootStackParamList, 'DecisionFollowUp'>;
type FollowUpIntent = 'schedule' | null;

function formatFollowUpDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function hasFutureCalendarDate(value?: string) {
  const parsedDate = parseTrackingDate(value);
  return Boolean(parsedDate && isFutureLocalCalendarDate(parsedDate));
}

export function DecisionFollowUpScreen({ navigation, route }: Props) {
  const { decision } = route.params;
  const managesExistingFollowUp =
    decision.status === 'tracking' && Boolean(decision.trackingDate);
  const canGoBack =
    route.params.origin === 'detail' || managesExistingFollowUp;
  const saveLock = useRef(false);
  const [intent, setIntent] = useState<FollowUpIntent>(
    managesExistingFollowUp ? 'schedule' : null,
  );
  const [selectedOptionId, setSelectedOptionId] =
    useState<DecisionFollowUpOptionId | null>(
      managesExistingFollowUp ? 'custom' : null,
    );
  const [customDate, setCustomDate] = useState<string | undefined>(
    decision.trackingDate,
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedOption = useMemo(
    () =>
      decisionFollowUpOptions.find(
        (option) => option.id === selectedOptionId,
      ),
    [selectedOptionId],
  );
  const selectedTrackingDate = useMemo(() => {
    if (selectedOptionId === 'custom') {
      return customDate;
    }

    return selectedOption
      ? resolveFollowUpDate(selectedOption)
      : undefined;
  }, [customDate, selectedOption, selectedOptionId]);
  const canSchedule = hasFutureCalendarDate(selectedTrackingDate);

  const returnToDecisionList = (
    notification: ReturnType<typeof createAppNotification>,
  ) => {
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
  };

  const saveAndReturn = async (
    nextDecision: Decision,
    message: string,
    title = 'Décision actée',
    showJourneyAction = true,
  ) => {
    await saveDecision(nextDecision);
    await markDecisionFollowUpsRead(nextDecision.id);

    returnToDecisionList(
      createAppNotification({
        action: showJourneyAction
          ? {
              label: 'Voir ma progression',
              type: 'view-journey',
            }
          : undefined,
        message,
        relatedDecisionId: nextDecision.id,
        title,
        type: 'decision_status',
      }),
    );
  };

  const startSaving = () => {
    if (saveLock.current) {
      return false;
    }

    saveLock.current = true;
    setIsSaving(true);
    setSaveError(null);
    return true;
  };

  const handleSaveError = () => {
    saveLock.current = false;
    setIsSaving(false);
    setSaveError('Impossible d’enregistrer ce suivi. Réessayez.');
  };

  const chooseNotNow = async () => {
    if (!startSaving()) {
      return;
    }

    try {
      const nextDecision = removeDecisionFollowUp(decision);

      await saveAndReturn(
        nextDecision,
        'Aucun rappel planifié. Vous pourrez en ajouter un depuis cette décision.',
      );
    } catch {
      handleSaveError();
    }
  };

  const scheduleFollowUp = async () => {
    if (!selectedTrackingDate || !canSchedule || !startSaving()) {
      return;
    }

    try {
      const nextDecision = scheduleDecisionFollowUp(
        decision,
        selectedTrackingDate,
      );

      await saveAndReturn(
        nextDecision,
        `Suivi prévu le ${formatFollowUpDate(selectedTrackingDate)}.`,
        managesExistingFollowUp ? 'Suivi modifié' : 'Décision actée',
        !managesExistingFollowUp,
      );
    } catch {
      handleSaveError();
    }
  };

  const removeFollowUp = async () => {
    if (!managesExistingFollowUp || !startSaving()) {
      return;
    }

    try {
      const nextDecision = removeDecisionFollowUp(decision);

      await saveAndReturn(
        nextDecision,
        'La décision reste actée, sans rappel planifié.',
        'Suivi supprimé',
        false,
      );
    } catch {
      handleSaveError();
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
          {canGoBack ? (
            <BackButton
              onPress={() => {
                if (!isSaving) {
                  navigation.goBack();
                }
              }}
            />
          ) : null}

          <FadeInView style={[styles.header, canGoBack && styles.headerAfterBack]}>
            <View style={styles.confirmationIcon}>
              <AppIcon
                color={colors.success}
                name={managesExistingFollowUp ? 'clock' : 'check-circle'}
                size="xl"
                weight="medium"
              />
            </View>
            <Text style={styles.eyebrow}>
              {managesExistingFollowUp ? 'Modifier le suivi' : 'Décision actée'}
            </Text>
            <Text accessibilityRole="header" style={styles.title}>
              {managesExistingFollowUp
                ? 'Votre suivi est planifié'
                : 'Votre décision est actée'}
            </Text>
            <Text style={styles.subtitle}>
              {managesExistingFollowUp
                ? 'Vous pouvez changer sa date ou le supprimer.'
                : 'Souhaitez-vous faire le point plus tard ?'}
            </Text>

            {decision.chosenOption ? (
              <View style={styles.chosenOptionCard}>
                <Text style={styles.chosenOptionLabel}>Choix acté</Text>
                <Text style={styles.chosenOptionValue}>
                  {decision.chosenOption}
                </Text>
              </View>
            ) : null}

            {managesExistingFollowUp && decision.trackingDate ? (
              <View style={styles.currentDateCard}>
                <Text style={styles.currentDateLabel}>Retour actuellement prévu</Text>
                <Text style={styles.currentDateValue}>
                  {formatFollowUpDate(decision.trackingDate)}
                </Text>
              </View>
            ) : null}
          </FadeInView>

          {!managesExistingFollowUp && intent === null ? (
            <FadeInView delay={90} style={styles.intentions}>
              <PrimaryButton
                disabled={isSaving}
                label="Oui, choisir un moment"
                onPress={() => setIntent('schedule')}
              />
              <SecondaryButton
                disabled={isSaving}
                label={isSaving ? 'Enregistrement…' : 'Pas maintenant'}
                onPress={() => void chooseNotNow()}
              />
              <Text style={styles.intentHelper}>
                Pas maintenant ne crée aucun rappel. Vous pourrez en planifier un depuis la fiche de cette décision.
              </Text>
            </FadeInView>
          ) : null}

          {intent === 'schedule' ? (
            <FadeInView delay={90} style={styles.followUpCard}>
              <Text style={styles.question}>Quand souhaitez-vous faire le point ?</Text>
              <Text style={styles.helper}>
                Le moment choisi peut être modifié plus tard.
              </Text>

              <View accessibilityRole="radiogroup" style={styles.options}>
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
                      onPress={() => {
                        if (option.id === 'custom') {
                          setIsDatePickerVisible(true);
                          return;
                        }

                        setSelectedOptionId(option.id);
                        setCustomDate(undefined);
                        setIsDatePickerVisible(false);
                      }}
                      pressedStyle={styles.optionPressed}
                      scaleTo={motion.subtlePressScale}
                      style={[
                        styles.option,
                        selected && styles.optionSelected,
                        Platform.OS === 'web' && styles.webButton,
                      ]}
                    >
                      <View style={styles.optionText}>
                        <Text
                          style={[
                            styles.optionLabel,
                            selected && styles.optionLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {option.id === 'custom' && selectedTrackingDate ? (
                          <Text style={styles.optionDate}>
                            {formatFollowUpDate(selectedTrackingDate)}
                          </Text>
                        ) : null}
                      </View>
                      <View style={[styles.radio, selected && styles.radioSelected]}>
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

              {isDatePickerVisible ? (
                <FollowUpDatePicker
                  initialValue={customDate ?? decision.trackingDate}
                  onCancel={() => setIsDatePickerVisible(false)}
                  onConfirm={(value) => {
                    setCustomDate(value);
                    setSelectedOptionId('custom');
                    setIsDatePickerVisible(false);
                  }}
                />
              ) : null}
            </FadeInView>
          ) : null}

          {intent === 'schedule' ? (
            <FadeInView delay={150} style={styles.actions}>
              <PrimaryButton
                disabled={!canSchedule || isSaving}
                label={isSaving ? 'Enregistrement…' : 'Planifier ce suivi'}
                onPress={() => void scheduleFollowUp()}
              />

              {!managesExistingFollowUp ? (
                <SecondaryButton
                  disabled={isSaving}
                  label="Pas maintenant"
                  onPress={() => void chooseNotNow()}
                />
              ) : null}

              {managesExistingFollowUp ? (
                <AnimatedPressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => void removeFollowUp()}
                  pressedStyle={styles.removeButtonPressed}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonLabel}>Supprimer ce suivi</Text>
                </AnimatedPressable>
              ) : null}

              {saveError ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {saveError}
                </Text>
              ) : null}
            </FadeInView>
          ) : saveError ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {saveError}
            </Text>
          ) : null}
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
  headerAfterBack: { marginTop: spacing.lg },
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
  currentDateCard: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  currentDateLabel: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  currentDateValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  intentions: { marginTop: spacing.xl, gap: spacing.sm },
  intentHelper: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
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
  options: { marginTop: spacing.lg, gap: spacing.sm },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  optionText: { flex: 1 },
  optionLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  optionLabelSelected: { color: colors.primaryDark },
  optionDate: {
    marginTop: spacing.xxs,
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '600',
  },
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
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  removeButton: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.field,
  },
  removeButtonPressed: { backgroundColor: colors.dangerSoft },
  removeButtonLabel: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  webButton: { cursor: 'pointer' },
});
