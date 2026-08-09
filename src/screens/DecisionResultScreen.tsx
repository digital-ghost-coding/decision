import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { FadeInView } from '../components/FadeInView';
import { PrimaryButton } from '../components/PrimaryButton';
import { ResultCard } from '../components/ResultCard';
import { SecondaryButton } from '../components/SecondaryButton';
import { colors, layout, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { calculateDecisionScore } from '../utils/calculateDecisionScore';
import { getDecisions, saveDecision } from '../storage/decisionStorage';
import type { Decision } from '../types/decision';


type Props = NativeStackScreenProps<
  RootStackParamList,
  'DecisionResult'
>;

function getDisplayTitle(decision: Decision) {
  if (
    decision.options?.optionA &&
    decision.options?.optionB
  ) {
    return `${decision.options.optionA} ou ${decision.options.optionB}`;
  }

  return decision.title;
}

function getEvaluationChoice(decision: Decision, answer: 'Oui' | 'Non') {
  return `${answer} — ${decision.title.replace(/\s*\?+\s*$/, '')}`;
}


export function DecisionResultScreen({
  navigation,
  route,
}: Props) {

  const [decision, setDecision] = useState(route.params.decision);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadFreshDecision = useCallback(async () => {
    const decisions = await getDecisions();

    const freshDecision = decisions.find(
      (item) => item.id === route.params.decision.id,
    );

    if (freshDecision) {
      setDecision(freshDecision);
    }
  }, [route.params.decision.id]);


  useEffect(() => {
    void loadFreshDecision();
  }, [loadFreshDecision]);


  const score = useMemo(
    () => calculateDecisionScore(decision),
    [decision],
  );


  const hasOptions =
    decision.format === 'compare' &&
    Boolean(decision.options?.optionA) &&
    Boolean(decision.options?.optionB);


  const optionA = decision.options?.optionA ?? '';
  const optionB = decision.options?.optionB ?? '';


  const isBalanced =
    hasOptions
      ? score.comparison?.result === 'tie'
      : score.trend === 'neutral';


  const optionAWins =
    hasOptions &&
    score.comparison?.result === 'optionA';


  const winningOption = optionAWins
    ? optionA
    : optionB;


  const otherOption = optionAWins
    ? optionB
    : optionA;

  const continueReflecting = async () => {
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
      setSaveError(
        'Impossible d’enregistrer cette réflexion. Veuillez réessayer.',
      );
    }
  };



  const shortOptions =
    winningOption.length <= 15 &&
    otherOption.length <= 15;



  const continueDecision = (chosenOption: string) => {
    navigation.navigate('DecisionCommitment', {
      decision: {
        ...decision,
        chosenOption,
      },
    });
  };



  const chooseOtherOption = () => {
    continueDecision(otherOption);
  };



  const editArguments = () => {
    navigation.navigate('DecisionArguments', {
      decisionTitle: decision.title,
      decision,
      format: decision.format,
      options: decision.options,
    });
  };



const displayTitle = getDisplayTitle(decision);

  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar style="dark" />


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.screen}>


          <BackButton
            onPress={() => navigation.goBack()}
          />



          <FadeInView style={styles.decisionHeader}>


            <Text style={styles.eyebrow}>
              Votre réflexion
            </Text>


            <Text
            accessibilityRole="header"
            style={styles.title}
          >
            {decision.status === 'reflecting'
              ? 'Votre réflexion avance'
              : 'Votre décision est prête'}
          </Text>
          

              <Text style={styles.decisionTitle}>
            {displayTitle}
              </Text>


            {hasOptions ? (

              <View style={styles.optionsCard}>

                <Text style={styles.optionsLabel}>
                  Vous comparez :
                </Text>


                <Text style={styles.optionText}>
                  • {optionA}
                </Text>


                <Text style={styles.optionText}>
                  • {optionB}
                </Text>


              </View>

            ) : null}



          </FadeInView>





          <FadeInView
            delay={60}
            style={styles.result}
          >

            <ResultCard
              decision={decision}
              score={score}
            />

          </FadeInView>





          <FadeInView
            delay={90}
            style={styles.explanation}
          >

            <Text style={styles.explanationTitle}>
              À vous de choisir la suite
            </Text>


            <Text style={styles.explanationText}>
              Cette réflexion vous aide à clarifier vos options.
              La décision finale reste la vôtre.
            </Text>


          </FadeInView>






          <FadeInView
            delay={120}
            style={styles.actions}
          >


            {isBalanced && hasOptions ? (

              <>

                <PrimaryButton
                  label="Ajouter un argument important"
                  onPress={editArguments}
                />


                <View
                  style={[
                    styles.choiceContainer,
                    !shortOptions && styles.choiceColumn,
                  ]}
                >

                  <View style={styles.choiceButton}>

                    <SecondaryButton
                      label={`Choisir ${optionA}`}
                      onPress={() => continueDecision(optionA)}
                    />

                  </View>



                  <View style={styles.choiceButton}>

                    <SecondaryButton
                      label={`Choisir ${optionB}`}
                      onPress={() => continueDecision(optionB)}
                    />

                  </View>


                </View>

              </>


            ) : hasOptions ? (

              <>

                <View
                  style={[
                    styles.choiceContainer,
                    !shortOptions && styles.choiceColumn,
                  ]}
                >

                  <View style={styles.choiceButton}>

                    <PrimaryButton
                      label={`Confirmer : ${winningOption}`}
                      onPress={() => continueDecision(winningOption)}
                    />

                  </View>



                  <View style={styles.choiceButton}>

                    <SecondaryButton
                      label={`Choisir ${otherOption}`}
                      onPress={chooseOtherOption}
                    />

                  </View>


                </View>


                <SecondaryButton
                  label="Revoir ma réflexion"
                  onPress={editArguments}
                />

              </>


            ) : (

              <>

                <PrimaryButton
                  label="Choisir oui"
                  onPress={() =>
                    continueDecision(getEvaluationChoice(decision, 'Oui'))
                  }
                />


                <SecondaryButton
                  label="Choisir non"
                  onPress={() =>
                    continueDecision(getEvaluationChoice(decision, 'Non'))
                  }
                />


                <SecondaryButton
                  label="Revoir ma réflexion"
                  onPress={editArguments}
                />

              </>

            )}

            {hasOptions ? (
              <SecondaryButton
                label="Je souhaite encore réfléchir"
                onPress={() => void continueReflecting()}
              />
            ) : null}

            {saveError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {saveError}
              </Text>
            ) : null}



          </FadeInView>




          <Text style={styles.reassurance}>
            Vous pourrez toujours revenir sur cette décision plus tard.
          </Text>



        </View>


      </ScrollView>


    </SafeAreaView>
  );
}





const styles = StyleSheet.create({

  safeArea:{
    flex:1,
    backgroundColor:colors.background,
  },


  scrollContent:{
    flexGrow:1,
  },


  screen:{
    width:'100%',
    maxWidth:layout.contentWidth,
    alignSelf:'center',
    paddingHorizontal:layout.horizontalPadding,
    paddingTop:8,
    paddingBottom:spacing.xl,
  },


  decisionHeader:{
    marginTop:34,
  },


  eyebrow:{
    color:colors.primary,
    fontSize:14,
    fontWeight:'700',
    letterSpacing:0.2,
    textTransform:'uppercase',
  },


  title:{
    marginTop:10,
    color:colors.text,
    fontSize:32,
    fontWeight:'800',
    letterSpacing:-0.8,
    lineHeight:39,
  },


  decisionTitle:{
    marginTop:spacing.base,
    color:colors.secondaryText,
    fontSize:18,
    fontWeight:'600',
    lineHeight:27,
  },


  optionsCard:{
    marginTop:20,
    padding:16,
    borderRadius:radii.card,
    backgroundColor:colors.primarySoft,
  },


  optionsLabel:{
    color:colors.text,
    fontSize:15,
    fontWeight:'700',
    marginBottom:8,
  },


  optionText:{
    color:colors.secondaryText,
    fontSize:15,
    lineHeight:23,
  },


  result:{
    marginTop:34,
  },


  explanation:{
    marginTop:spacing.lg,
    padding:spacing.md,
    borderRadius:radii.card,
    backgroundColor:colors.primarySoft,
  },


  explanationTitle:{
    color:colors.text,
    fontSize:16,
    fontWeight:'800',
  },


  explanationText:{
    marginTop:6,
    color:colors.secondaryText,
    fontSize:14,
    lineHeight:21,
  },


  actions:{
    marginTop:24,
    gap:12,
  },


  choiceContainer:{
    flexDirection:'row',
    gap:12,
  },


  choiceColumn:{
    flexDirection:'column',
  },

  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },


  choiceButton:{
    flex:1,
  },


  reassurance:{
    marginTop:18,
    textAlign:'center',
    color:colors.muted,
    fontSize:13,
    lineHeight:19,
  },

});
