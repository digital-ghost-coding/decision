import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
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

import { BackButton } from '../components/BackButton';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { FadeInView } from '../components/FadeInView';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, layout, motion, radii, shadows, spacing } from '../theme';
import type { DecisionFormat } from '../types/decision';
import type { RootStackParamList } from '../types/navigation';

const MAX_CHARACTERS = 120;
const MAX_OPTION_CHARACTERS = 60;

function looksLikeComparison(value: string) {
  return /(?:^|\s)ou(?:\s|[?!.,;:]|$)/i.test(value.trim());
}

type Props = NativeStackScreenProps<RootStackParamList, 'NewDecision'>;

export function NewDecisionScreen({ navigation }: Props) {
  const [format, setFormat] = useState<DecisionFormat>('evaluate');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const validationLock = useRef(false);
  const comparisonIsAmbiguous =
    format === 'evaluate' && looksLikeComparison(question);
  const hasBothOptions =
    optionA.trim().length > 0 && optionB.trim().length > 0;
  const canContinue =
    question.trim().length > 0 &&
    !comparisonIsAmbiguous &&
    (format === 'evaluate' || hasBothOptions);

  const goBack = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  const continueToArguments = () => {
    const decisionTitle = question.trim();

    if (!canContinue || !decisionTitle || validationLock.current) {
      return;
    }

    validationLock.current = true;

    Keyboard.dismiss();

    navigation.navigate('DecisionArguments', {
      decisionTitle,
      format,
      options: format === 'compare'
        ? {
            optionA: optionA.trim(),
            optionB: optionB.trim(),
          }
        : undefined,
    });

    setTimeout(() => {
      validationLock.current = false;
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <BackButton onPress={goBack} />

            <FadeInView style={styles.content}>
              <Text accessibilityRole="header" style={styles.title}>
                Nouvelle décision
              </Text>

              <Text style={styles.subtitle}>
                Quelle question souhaitez-vous éclaircir ?
              </Text>

              <View style={styles.formatSection}>
                <Text style={styles.formatTitle}>
                  Quel type de décision prenez-vous ?
                </Text>
                <View
                  accessibilityLabel="Format de la décision"
                  accessibilityRole="radiogroup"
                  style={styles.formatOptions}
                >
                  <AnimatedPressable
                    accessibilityLabel="Évaluer une option"
                    accessibilityRole="radio"
                    accessibilityState={{ checked: format === 'evaluate' }}
                    haptic="selection"
                    onPress={() => setFormat('evaluate')}
                    pressedStyle={styles.formatCardPressed}
                    scaleTo={motion.subtlePressScale}
                    style={[
                      styles.formatCard,
                      format === 'evaluate' && styles.formatCardSelected,
                      Platform.OS === 'web' && styles.webButton,
                    ]}
                  >
                    <Text style={styles.formatCardTitle}>
                      Évaluer une option
                    </Text>
                    <Text style={styles.formatCardDescription}>
                      Comprendre si une possibilité vous convient.
                    </Text>
                  </AnimatedPressable>

                  <AnimatedPressable
                    accessibilityLabel="Comparer deux options"
                    accessibilityRole="radio"
                    accessibilityState={{ checked: format === 'compare' }}
                    haptic="selection"
                    onPress={() => setFormat('compare')}
                    pressedStyle={styles.formatCardPressed}
                    scaleTo={motion.subtlePressScale}
                    style={[
                      styles.formatCard,
                      format === 'compare' && styles.formatCardSelected,
                      Platform.OS === 'web' && styles.webButton,
                    ]}
                  >
                    <Text style={styles.formatCardTitle}>
                      Comparer deux options
                    </Text>
                    <Text style={styles.formatCardDescription}>
                      Mettre deux possibilités face à face.
                    </Text>
                  </AnimatedPressable>
                </View>
              </View>

              <View
                style={[
                  styles.inputCard,
                  isFocused && styles.inputCardFocused,
                ]}
              >
                <TextInput
                  accessibilityLabel="Question de décision"
                  accessibilityHint="Décrivez la décision que vous souhaitez prendre"
                  maxLength={MAX_CHARACTERS}
                  multiline
                  onBlur={() => setIsFocused(false)}
                  onChangeText={setQuestion}
                  onFocus={() => setIsFocused(true)}
                  placeholder={
                    format === 'compare'
                      ? 'Ex. Quel créneau convient le mieux pour le bénévolat ?'
                      : 'Ex. Dois-je accepter cette nouvelle opportunité ?'
                  }
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.primary}
                  style={styles.input}
                  textAlignVertical="top"
                  value={question}
                />

                <Text style={styles.counter}>
                  {question.length}/{MAX_CHARACTERS}
                </Text>
              </View>

              {comparisonIsAmbiguous ? (
                <View accessibilityRole="alert" style={styles.warningCard}>
                  <Text style={styles.warningTitle}>
                    Cette question semble comparer deux possibilités.
                  </Text>
                  <Text style={styles.warningText}>
                    Choisissez « Comparer deux options » et nommez-les
                    séparément. Sinon, reformulez la question pour n’évaluer
                    qu’une seule possibilité.
                  </Text>
                </View>
              ) : null}

              {format === 'compare' ? (
                <>
                  <View style={styles.choiceHeader}>
                    <Text style={styles.optionsTitle}>
                      Quelles options comparez-vous ?
                    </Text>
                    <Text style={styles.optionsSubtitle}>
                      Nommez clairement les deux possibilités. Chacune aura
                      ensuite ses propres arguments.
                    </Text>
                  </View>

                  <View style={styles.optionCard}>
                    <View style={styles.optionField}>
                      <Text style={styles.optionLabel}>Option A</Text>
                      <TextInput
                        accessibilityLabel="Nom de l’option A"
                        maxLength={MAX_OPTION_CHARACTERS}
                        onChangeText={setOptionA}
                        placeholder="Ex. Lundi à 14 h"
                        placeholderTextColor={colors.muted}
                        style={styles.optionInput}
                        value={optionA}
                      />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.optionField}>
                      <Text style={styles.optionLabel}>Option B</Text>
                      <TextInput
                        accessibilityLabel="Nom de l’option B"
                        maxLength={MAX_OPTION_CHARACTERS}
                        onChangeText={setOptionB}
                        placeholder="Ex. Mardi soir"
                        placeholderTextColor={colors.muted}
                        style={styles.optionInput}
                        value={optionB}
                      />
                    </View>
                  </View>

                  {!hasBothOptions ? (
                    <Text style={styles.helpText}>
                      Les deux options sont nécessaires pour continuer.
                    </Text>
                  ) : null}
                </>
              ) : null}

            </FadeInView>


            <FadeInView delay={90} style={styles.footer}>
              <PrimaryButton
                disabled={!canContinue}
                label="Explorer cette décision"
                onPress={continueToArguments}
              />
            </FadeInView>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  screen: {
    flex: 1,
    width: '100%',
    maxWidth: layout.compactContentWidth,
    minHeight: '100%',
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 8,
    paddingBottom: spacing.lg,
  },

  content: {
    marginTop: 38,
  },

  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 42,
  },

  subtitle: {
    marginTop: 14,
    color: colors.secondaryText,
    fontSize: 18,
    lineHeight: 27,
  },

  formatSection: {
    marginTop: 30,
  },

  formatTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  formatOptions: {
    marginTop: 12,
    gap: spacing.sm,
  },

  formatCard: {
    minHeight: layout.touchTarget,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },

  formatCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  formatCardPressed: {
    opacity: 0.86,
  },

  formatCardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },

  formatCardDescription: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },

  inputCard: {
    minHeight: 150,
    marginTop: 34,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    ...shadows.card,
  },

  inputCardFocused: {
    borderColor: colors.primary,
  },

  input: {
    height: 90,
    padding: 0,
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
  },

  counter: {
    marginTop: 8,
    alignSelf: 'flex-end',
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  choiceHeader: {
    marginTop: 32,
  },

  optionsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  optionsSubtitle: {
    marginTop: 5,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },

  optionCard: {
    marginTop: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.white,
  },

  optionField: {
    paddingTop: spacing.sm,
  },

  optionLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },

  optionInput: {
    height: 52,
    color: colors.text,
    fontSize: 16,
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
  },

  helpText: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },

  warningCard: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radii.md,
    backgroundColor: colors.warningSoft,
  },

  warningTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },

  warningText: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },

  webButton: {
    cursor: 'pointer',
  },

  footer: {
    marginTop: 'auto',
    paddingTop: 36,
  },
});
