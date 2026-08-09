import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { AppIcon } from '../components/AppIcon';
import { BackButton } from '../components/BackButton';
import { FadeInView } from '../components/FadeInView';
import { PrimaryButton } from '../components/PrimaryButton';
import { getDecision, saveDecision } from '../storage/decisionStorage';
import { markDecisionFollowUpsRead } from '../storage/notificationStorage';
import { colors, layout, motion, radii, shadows, spacing } from '../theme';
import type { Decision, DecisionSatisfaction } from '../types/decision';
import type { RootStackParamList } from '../types/navigation';
import { transitionDecision } from '../utils/decisionLifecycle';

type Props = NativeStackScreenProps<RootStackParamList, 'DecisionReview'>;

const MAX_NOTE_CHARACTERS = 600;
const satisfactionOptions: {
  emoji: string;
  label: string;
  value: DecisionSatisfaction;
}[] = [
  { emoji: '😊', label: 'Très bien', value: 5 },
  { emoji: '😐', label: 'Mitigé', value: 3 },
  { emoji: '😕', label: 'Pas comme prévu', value: 1 },
];

export function DecisionReviewScreen({ navigation, route }: Props) {
  const saveLock = useRef(false);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [satisfaction, setSatisfaction] =
    useState<DecisionSatisfaction | null>(null);
  const [note, setNote] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const storedDecision = await getDecision(route.params.decisionId);

        if (!storedDecision) {
          throw new Error('Décision introuvable');
        }

        if (mounted) {
          setDecision(storedDecision);
          setSatisfaction(storedDecision.satisfaction ?? null);
          setNote(storedDecision.reviewNote ?? '');
        }
      } catch {
        if (mounted) {
          setError('Cette décision n’est plus disponible.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [route.params.decisionId]);

  const saveReview = async () => {
    if (!decision || !satisfaction || saveLock.current) {
      return;
    }

    saveLock.current = true;
    setIsSaving(true);
    setError(null);
    Keyboard.dismiss();

    try {
      const completedDecision =
        decision.status === 'completed'
          ? { ...decision, updatedAt: new Date().toISOString() }
          : transitionDecision(decision, 'completed');
      const nextDecision: Decision = {
        ...completedDecision,
        completedAt: completedDecision.completedAt ?? new Date().toISOString(),
        reviewNote: note.trim() || undefined,
        satisfaction,
      };

      await saveDecision(nextDecision);
      await markDecisionFollowUpsRead(nextDecision.id);
      setDecision(nextDecision);
      setIsComplete(true);
    } catch {
      saveLock.current = false;
      setIsSaving(false);
      setError('Votre bilan n’a pas pu être enregistré. Réessayez.');
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

  if (!decision) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.errorScreen}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text accessibilityRole="alert" style={styles.errorText}>
            {error ?? 'Cette décision n’est plus disponible.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.completeScreen}>
          <FadeInView style={styles.completeContent}>
            <View style={styles.completeIcon}>
              <AppIcon
                color={colors.success}
                name="check-circle"
                size="xl"
                weight="medium"
              />
            </View>
            <Text accessibilityRole="header" style={styles.completeTitle}>
              Merci pour votre retour.
            </Text>
            <Text style={styles.completeText}>
              Chaque décision vous aide à mieux vous connaître.
            </Text>
          </FadeInView>
          <FadeInView delay={100} style={styles.completeAction}>
            <PrimaryButton
              label="Voir ma décision"
              onPress={() =>
                navigation.replace('DecisionDetail', {
                  decisionId: decision.id,
                })
              }
            />
          </FadeInView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <BackButton
              onPress={() => {
                Keyboard.dismiss();
                navigation.goBack();
              }}
            />

            <FadeInView style={styles.header}>
              <Text style={styles.eyebrow}>Faire le bilan</Text>
              <Text accessibilityRole="header" style={styles.title}>
                Comment cette décision s’est-elle passée ?
              </Text>
              <Text numberOfLines={2} style={styles.decisionTitle}>
                {decision.title}
              </Text>
            </FadeInView>

            <FadeInView delay={70} style={styles.options}>
              {satisfactionOptions.map((option) => {
                const selected = satisfaction === option.value;

                return (
                  <AnimatedPressable
                    accessibilityLabel={option.label}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected, disabled: isSaving }}
                    disabled={isSaving}
                    haptic="selection"
                    key={option.value}
                    onPress={() => setSatisfaction(option.value)}
                    pressedStyle={styles.optionPressed}
                    scaleTo={motion.subtlePressScale}
                    style={[
                      styles.option,
                      selected && styles.optionSelected,
                      Platform.OS === 'web' && styles.webButton,
                    ]}
                  >
                    <Text style={styles.emoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        selected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
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
            </FadeInView>

            <FadeInView delay={110} style={styles.noteSection}>
              <Text style={styles.noteLabel}>Note personnelle</Text>
              <Text style={styles.noteHelper}>Facultatif</Text>
              <View
                style={[
                  styles.inputCard,
                  isFocused && styles.inputCardFocused,
                ]}
              >
                <TextInput
                  accessibilityLabel="Note personnelle facultative"
                  maxLength={MAX_NOTE_CHARACTERS}
                  multiline
                  onBlur={() => setIsFocused(false)}
                  onChangeText={setNote}
                  onFocus={() => setIsFocused(true)}
                  placeholder="Qu’aimeriez-vous retenir de cette décision ?"
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.primary}
                  style={styles.input}
                  textAlignVertical="top"
                  value={note}
                />
                <Text style={styles.counter}>
                  {note.length}/{MAX_NOTE_CHARACTERS}
                </Text>
              </View>
            </FadeInView>

            <FadeInView delay={150} style={styles.footer}>
              <PrimaryButton
                disabled={!satisfaction || isSaving}
                label={isSaving ? 'Enregistrement…' : 'Enregistrer mon bilan'}
                onPress={() => void saveReview()}
              />
              {error ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {error}
                </Text>
              ) : null}
            </FadeInView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorScreen: {
    flex: 1,
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: spacing.xs,
  },
  header: { marginTop: spacing.xl },
  eyebrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.base,
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 41,
  },
  decisionTitle: {
    marginTop: spacing.md,
    color: colors.secondaryText,
    fontSize: 17,
    lineHeight: 25,
  },
  options: { marginTop: spacing.xl, gap: spacing.sm },
  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  optionPressed: { borderColor: colors.focus },
  emoji: { fontSize: 24 },
  optionLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  optionLabelSelected: { color: colors.primaryDark },
  radio: {
    width: 24,
    height: 24,
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
  noteSection: { marginTop: spacing.xl },
  noteLabel: { color: colors.text, fontSize: 19, fontWeight: '800' },
  noteHelper: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: 14,
  },
  inputCard: {
    minHeight: 150,
    marginTop: spacing.base,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  inputCardFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
  },
  input: {
    flex: 1,
    minHeight: 96,
    padding: 0,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: { marginTop: 'auto', paddingTop: spacing.xl },
  errorText: {
    marginTop: spacing.md,
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  completeScreen: {
    flex: 1,
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingVertical: spacing.xl,
  },
  completeContent: { flex: 1, justifyContent: 'center' },
  completeIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderRadius: radii.card,
    backgroundColor: colors.successSoft,
  },
  completeTitle: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 43,
  },
  completeText: {
    maxWidth: 420,
    marginTop: spacing.md,
    color: colors.secondaryText,
    fontSize: 18,
    lineHeight: 28,
  },
  completeAction: { paddingTop: spacing.lg },
  webButton: { cursor: 'pointer' },
});

