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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArgumentSection } from '../components/ArgumentSection';
import { BackButton } from '../components/BackButton';
import { FadeInView } from '../components/FadeInView';
import { PrimaryButton } from '../components/PrimaryButton';
import { useKeyboardVisibility } from '../hooks/useKeyboardVisibility';
import { colors, layout, radii, spacing } from '../theme';
import type {
  Argument,
  ArgumentSide,
  ArgumentWeight,
  Decision,
  DecisionOptionKey,
} from '../types/decision';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'DecisionArguments'
>;

export function DecisionArgumentsScreen({ navigation, route }: Props) {
  const { decision, decisionTitle, format, options } = route.params;

  const existingDecision = decision;
  const resolvedOptions = options ?? existingDecision?.options;
  const decisionFormat =
    format ??
    existingDecision?.format ??
    (resolvedOptions?.optionA && resolvedOptions.optionB
      ? 'compare'
      : 'evaluate');

  const isKeyboardVisible = useKeyboardVisibility();

  const [argumentsList, setArgumentsList] = useState<Argument[]>(() => [
    ...(existingDecision?.pros ?? []),
    ...(existingDecision?.cons ?? []),
  ]);

  const nextId = useRef(0);
  const analysisLock = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealFocusedField = useCallback((target: number) => {
    if (Platform.OS === 'web') {
      return;
    }

    const reveal = () => {
      scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        target,
        168,
        true,
      );
    };

    requestAnimationFrame(reveal);

    if (revealTimeout.current) {
      clearTimeout(revealTimeout.current);
    }

    revealTimeout.current = setTimeout(reveal, 320);
  }, []);

  useEffect(
    () => () => {
      if (revealTimeout.current) {
        clearTimeout(revealTimeout.current);
      }
    },
    [],
  );

  const addArgument = useCallback(
    (
      text: string,
      side: ArgumentSide,
      weight: ArgumentWeight,
      optionKey?: DecisionOptionKey,
    ) => {
      nextId.current += 1;

      const argument: Argument = {
        id: `${side}-${Date.now()}-${nextId.current}`,
        optionKey:
          decisionFormat === 'compare'
            ? optionKey
            : undefined,
        side,
        text,
        weight,
      };

      setArgumentsList((current) => [
        ...current,
        argument,
      ]);
    },
    [decisionFormat],
  );

  const removeArgument = useCallback((id: string) => {
    setArgumentsList((current) =>
      current.filter((argument) => argument.id !== id),
    );
  }, []);

  const updateArgument = useCallback(
    (id: string, text: string, weight: ArgumentWeight) => {
      setArgumentsList((current) =>
        current.map((argument) =>
          argument.id === id
            ? {
                ...argument,
                text,
                weight,
              }
            : argument,
        ),
      );
    },
    [],
  );

  const goBack = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  const proArguments = useMemo(
    () =>
      argumentsList.filter(
        (argument) => argument.side === 'pro',
      ),
    [argumentsList],
  );

  const conArguments = useMemo(
    () =>
      argumentsList.filter(
        (argument) => argument.side === 'con',
      ),
    [argumentsList],
  );

  const optionAPros = useMemo(
    () =>
      argumentsList.filter(
        (argument) =>
          argument.optionKey === 'optionA' && argument.side === 'pro',
      ),
    [argumentsList],
  );

  const optionACons = useMemo(
    () =>
      argumentsList.filter(
        (argument) =>
          argument.optionKey === 'optionA' && argument.side === 'con',
      ),
    [argumentsList],
  );

  const optionBPros = useMemo(
    () =>
      argumentsList.filter(
        (argument) =>
          argument.optionKey === 'optionB' && argument.side === 'pro',
      ),
    [argumentsList],
  );

  const optionBCons = useMemo(
    () =>
      argumentsList.filter(
        (argument) =>
          argument.optionKey === 'optionB' && argument.side === 'con',
      ),
    [argumentsList],
  );

  const canAnalyze = argumentsList.length > 0;

const analyzeDecision = () => {
  if (!canAnalyze || analysisLock.current) {
    return;
  }

  analysisLock.current = true;

  Keyboard.dismiss();

  const now = new Date().toISOString();

  const hasDecisionOptions =
    decisionFormat === 'compare' &&
    Boolean(resolvedOptions?.optionA?.trim()) &&
    Boolean(resolvedOptions?.optionB?.trim());


  const newDecision: Decision = {
    ...(existingDecision ?? {}),

    id:
      existingDecision?.id ??
      `decision-${Date.now()}`,

    format: hasDecisionOptions ? 'compare' : 'evaluate',
    argumentModelVersion: 2,
    title: decisionTitle,

    pros: proArguments,
    cons: conArguments,

    options: hasDecisionOptions
      ? {
          optionA: resolvedOptions!.optionA,
          optionB: resolvedOptions!.optionB,
        }
      : undefined,
    chosenOption: undefined,

    createdAt:
      existingDecision?.createdAt ?? now,

    updatedAt: now,

    status: 'reflecting',

    trackingDate: undefined,
    archivedFromStatus: undefined,
  };


  navigation.navigate('DecisionResult', {
    decision: newDecision,
  });


  setTimeout(() => {
    analysisLock.current = false;
  }, 500);
};

  const hasOptions =
    decisionFormat === 'compare' &&
    Boolean(resolvedOptions?.optionA?.trim()) &&
    Boolean(resolvedOptions?.optionB?.trim());

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardVisible && styles.scrollContentWithKeyboard,
          ]}
          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>

            <BackButton onPress={goBack} />

            <FadeInView style={styles.decisionHeader}>

              <Text style={styles.eyebrow}>
                Votre décision
              </Text>

              <Text
                accessibilityRole="header"
                style={styles.decisionTitle}
              >
                {decisionTitle}
              </Text>


              {hasOptions ? (
                <View style={styles.optionsPreview}>

                  <Text style={styles.optionsLabel}>
                    Vous comparez :
                  </Text>

                  <Text style={styles.optionText}>
                    • {resolvedOptions?.optionA}
                  </Text>

                  <Text style={styles.optionText}>
                    • {resolvedOptions?.optionB}
                  </Text>

                </View>
              ) : null}

            </FadeInView>


 <FadeInView delay={60} style={styles.sections}>

  {hasOptions ? (
    <>
      <View style={styles.comparisonOptionCard}>
        <Text style={styles.comparisonOptionLabel}>Option A</Text>
        <Text style={styles.comparisonOptionName}>
          {resolvedOptions?.optionA}
        </Text>

        <View style={styles.comparisonSections}>
          <ArgumentSection
            argumentsList={optionAPros}
            embedded
            onAdd={(text, side, weight) =>
              addArgument(text, side, weight, 'optionA')
            }
            onRemove={removeArgument}
            onFieldFocus={revealFocusedField}
            onUpdate={updateArgument}
            placeholder="Ajouter un atout"
            side="pro"
            subtitle="Ce que cette option vous apporte"
            title="Atouts"
          />

          <View style={styles.comparisonDivider} />

          <ArgumentSection
            argumentsList={optionACons}
            embedded
            onAdd={(text, side, weight) =>
              addArgument(text, side, weight, 'optionA')
            }
            onRemove={removeArgument}
            onFieldFocus={revealFocusedField}
            onUpdate={updateArgument}
            placeholder="Ajouter un frein"
            side="con"
            subtitle="Ce qui peut poser problème"
            title="Freins"
          />
        </View>
      </View>

      <View style={styles.comparisonOptionCard}>
        <Text style={styles.comparisonOptionLabel}>Option B</Text>
        <Text style={styles.comparisonOptionName}>
          {resolvedOptions?.optionB}
        </Text>

        <View style={styles.comparisonSections}>
          <ArgumentSection
            argumentsList={optionBPros}
            embedded
            onAdd={(text, side, weight) =>
              addArgument(text, side, weight, 'optionB')
            }
            onRemove={removeArgument}
            onFieldFocus={revealFocusedField}
            onUpdate={updateArgument}
            placeholder="Ajouter un atout"
            side="pro"
            subtitle="Ce que cette option vous apporte"
            title="Atouts"
          />

          <View style={styles.comparisonDivider} />

          <ArgumentSection
            argumentsList={optionBCons}
            embedded
            onAdd={(text, side, weight) =>
              addArgument(text, side, weight, 'optionB')
            }
            onRemove={removeArgument}
            onFieldFocus={revealFocusedField}
            onUpdate={updateArgument}
            placeholder="Ajouter un frein"
            side="con"
            subtitle="Ce qui peut poser problème"
            title="Freins"
          />
        </View>
      </View>
    </>
  ) : (
    <>
      <ArgumentSection
        argumentsList={proArguments}
        onAdd={addArgument}
        onRemove={removeArgument}
        onFieldFocus={revealFocusedField}
        onUpdate={updateArgument}
        side="pro"
        subtitle="Ce qui vous pousse à dire oui"
        title="Pour"
      />

      <ArgumentSection
        argumentsList={conArguments}
        onAdd={addArgument}
        onRemove={removeArgument}
        onFieldFocus={revealFocusedField}
        onUpdate={updateArgument}
        side="con"
        subtitle="Ce qui vous fait hésiter"
        title="Contre"
      />
    </>
  )}

</FadeInView>

          </View>
        </ScrollView>


        {!isKeyboardVisible ? (
          <FadeInView
            distance={6}
            style={styles.footer}
          >
            <View style={styles.footerContent}>

              {!canAnalyze ? (
                <Text style={styles.helpText}>
                  Ajoutez un argument pour continuer.
                </Text>
              ) : null}


              <PrimaryButton
                accessibilityLabel="Analyser la décision"
                disabled={!canAnalyze}
                label="Analyser ma décision"
                onPress={analyzeDecision}
              />

            </View>
          </FadeInView>
        ) : null}

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

  scrollContentWithKeyboard: {
    paddingBottom: 220,
  },

  screen: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 8,
    paddingBottom: 40,
  },

  decisionHeader: {
    marginTop: 34,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  decisionTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 39,
  },


  optionsPreview: {
    marginTop: 18,
    padding: 16,
    borderRadius: radii.card,
    backgroundColor: colors.primarySoft,
  },

  optionsLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  optionText: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 22,
  },


  sections: {
    marginTop: 38,
    gap: 20,
  },

  comparisonOptionCard: {
    padding: spacing.ml,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },

  comparisonOptionLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  comparisonOptionName: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 30,
  },

  comparisonSections: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },

  comparisonDivider: {
    height: 1,
    backgroundColor: colors.border,
  },


  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },


  footerContent: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 10,
    paddingBottom: spacing.md,
  },


  helpText: {
    marginBottom: spacing.sm,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

});
