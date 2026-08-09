import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { DecisionCommitCircle } from '../components/DecisionCommitCircle';
import { FadeInView } from '../components/FadeInView';
import { COMMIT_COMPLETION_SETTLE_MS } from '../interactions/commitAnimation';
import { saveDecision } from '../storage/decisionStorage';
import { colors, layout, motion, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { transitionDecision } from '../utils/decisionLifecycle';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'DecisionCommitment'
>;

export function DecisionCommitmentScreen({
  navigation,
  route,
}: Props) {
  const confirmationLock = useRef(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { decision } = route.params;
  const concreteChoice = decision.chosenOption ?? decision.title;


  const waitForCompletionAnimation = () =>
    new Promise<void>((resolve) => {
      setTimeout(
        resolve,
        COMMIT_COMPLETION_SETTLE_MS,
      );
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

      const actedDecision = transitionDecision(
        decision,
        'acted',
        concreteChoice,
      );

      await saveDecision(actedDecision);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'DecisionFollowUp',
            params: {
              decision: actedDecision,
            },
          },
        ],
      });

    } catch {
      confirmationLock.current = false;
      setIsSaving(false);

      setSaveError(
        'Impossible de confirmer ce choix. Veuillez réessayer.',
      );
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

        <View style={styles.screen}>


          <BackButton
            onPress={() => {
              if (!isSaving) {
                navigation.goBack();
              }
            }}
          />



          <FadeInView style={styles.content}>

            <Text style={styles.eyebrow}>
              Confirmer votre choix
            </Text>


            <Text
              accessibilityRole="header"
              style={styles.title}
            >
              Vous avez choisi d’avancer avec :
            </Text>


            <View style={styles.choiceCard}>

              <Text style={styles.choiceTitle}>
                {concreteChoice}
              </Text>

              {decision.format === 'compare' ? (
                <Text style={styles.choiceContext}>{decision.title}</Text>
              ) : null}

            </View>



            <Text style={styles.subtitle}>

              Prenez un instant pour reconnaître ce choix.
              Cette étape ne vous enferme pas : elle marque
              simplement votre décision d’avancer avec intention.

            </Text>


          </FadeInView>





          <FadeInView
            delay={90}
            style={styles.interaction}
          >

            <DecisionCommitCircle
              disabled={isSaving}
              onComplete={commitDecision}
            />


            <AnimatedPressable
              accessibilityRole="button"
              disabled={isSaving}
              haptic="selection"
              onPress={() => void continueLater()}
              pressedStyle={styles.laterButtonPressed}
              scaleTo={motion.subtlePressScale}
              style={[
                styles.laterButton,
                Platform.OS === 'web' &&
                  styles.webButton,
              ]}
            >

              <Text
                style={[
                  styles.laterLabel,
                  isSaving &&
                    styles.laterLabelDisabled,
                ]}
              >
                Je veux encore réfléchir
              </Text>

            </AnimatedPressable>



            {saveError ? (
              <Text
                accessibilityRole="alert"
                style={styles.errorText}
              >
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
    flex: 1,
    width: '100%',
    maxWidth: layout.contentWidth,
    minHeight: '100%',
    alignSelf: 'center',
    paddingHorizontal:
      layout.horizontalPadding,
    paddingTop: 8,
    paddingBottom: spacing.lg,
  },


  content: {
    marginTop: 38,
  },


  eyebrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },


  title: {
    maxWidth: 470,
    marginTop: 12,
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 42,
  },


  choiceCard: {
    marginTop: 22,
    padding: 18,
    borderRadius: radii.card,
    backgroundColor: colors.primarySoft,
  },


  choiceTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },

  choiceContext: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },


  subtitle: {
    maxWidth: 460,
    marginTop: 18,
    color: colors.secondaryText,
    fontSize: 18,
    lineHeight: 28,
  },


  interaction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
    paddingBottom: 20,
  },


  confirmHint: {
    marginTop: 18,
    color: colors.secondaryText,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },


  laterButton: {
    minHeight: 44,
    marginTop: 18,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: radii.base,
  },


  laterButtonPressed: {
    backgroundColor: colors.primarySoft,
  },


  laterLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },


  laterLabelDisabled: {
    color: colors.muted,
  },


  errorText: {
    maxWidth: 340,
    marginTop: 14,
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },


  webButton: {
    cursor: 'pointer',
  },

});
