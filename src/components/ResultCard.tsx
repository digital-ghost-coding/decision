import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing } from '../theme';
import type { Decision, DecisionScore } from '../types/decision';
import { ScoreBar } from './ScoreBar';


type Props = {
  score: DecisionScore;
  decision: Decision;
};


const SUCCESS_GREEN = 'rgb(21,128,61)';
const SUCCESS_BACKGROUND = '#F1FBF5';
const SUCCESS_BORDER = '#B7E4C7';


function formatArgumentCount(
  count: number,
  suffix = '',
) {
  return `${count} argument${count > 1 ? 's' : ''}${suffix}`;
}


function ResultCardComponent({
  score,
  decision,
}: Props) {


  const hasOptions =
    Boolean(decision.options?.optionA) &&
    Boolean(decision.options?.optionB);



  const firstLabel = hasOptions
    ? decision.options!.optionA
    : 'Pour';


  const secondLabel = hasOptions
    ? decision.options!.optionB
    : 'Contre';



  const firstCount = score.proCount;
  const secondCount = score.conCount;



  const firstWins =
    firstCount > secondCount;



  const secondWins =
    secondCount > firstCount;



  const balanced =
    firstCount === secondCount;



  const isPositive =
    score.trend === 'positive';



  return (

    <View style={styles.card}>


      <Text style={styles.title}>
        Votre réflexion
      </Text>



      <View style={styles.counts}>


        <View
          style={[
            styles.optionCard,
            firstWins && styles.highlightCard,
          ]}
        >

          <View style={styles.optionHeader}>

            {firstWins ? (
              <View style={styles.dot}/>
            ) : null}


            <Text style={styles.optionName}>
              {firstLabel}
            </Text>

          </View>


          <Text
            style={[
              styles.optionMeta,
              firstWins && styles.highlightText,
            ]}
          >
            {formatArgumentCount(
              firstCount,
              firstWins
                ? ' · ressort davantage'
                : '',
            )}
          </Text>


        </View>





        <View
          style={[
            styles.optionCard,
            secondWins && styles.highlightCard,
          ]}
        >

          <View style={styles.optionHeader}>

            {secondWins ? (
              <View style={styles.dot}/>
            ) : null}


            <Text style={styles.optionName}>
              {secondLabel}
            </Text>

          </View>


          <Text
            style={[
              styles.optionMeta,
              secondWins && styles.highlightText,
            ]}
          >
            {formatArgumentCount(
              secondCount,
              secondWins
                ? ' · ressort davantage'
                : '',
            )}
          </Text>


        </View>


      </View>





      {balanced ? (

        <Text style={styles.balanceText}>
          Votre réflexion est parfaitement équilibrée.
          Ajoutez un élément important ou choisissez
          selon ce qui correspond le mieux à vos priorités.
        </Text>

      ) : null}





      <View style={styles.scoreHeader}>


        <Text style={styles.scoreLabel}>
          {balanced
            ? 'Équilibre actuel'
            : hasOptions
              ? 'Part des arguments de l’option en tête'
              : 'Tendance actuelle'}
        </Text>



        <Text
          style={[
            styles.percentage,
            isPositive &&
              styles.percentagePositive,
          ]}
        >
          {score.percentage}%
        </Text>


      </View>





      <ScoreBar
        percentage={score.percentage}
        positive={isPositive}
      />





      <Text style={styles.message}>
        {score.message}
      </Text>


    </View>

  );
}



export const ResultCard =
  memo(ResultCardComponent);





const styles = StyleSheet.create({


  card:{
    padding:spacing.lg,
    borderRadius:radii.lg,
    backgroundColor:colors.white,
    ...shadows.card,
  },


  title:{
    color:colors.text,
    fontSize:24,
    fontWeight:'800',
    letterSpacing:-0.5,
  },


  counts:{
    marginTop:20,
    gap:10,
  },


  optionCard:{
    paddingVertical:14,
    paddingHorizontal:16,
    borderRadius:radii.md,
    backgroundColor:colors.background,
    borderWidth:1,
    borderColor:colors.border,
  },


  highlightCard:{
    backgroundColor:SUCCESS_BACKGROUND,
    borderColor:SUCCESS_BORDER,
  },


  optionHeader:{
    flexDirection:'row',
    alignItems:'center',
    gap:8,
  },


  dot:{
    width:8,
    height:8,
    borderRadius:4,
    backgroundColor:SUCCESS_GREEN,
  },


  optionName:{
    flex:1,
    color:colors.text,
    fontSize:16,
    fontWeight:'700',
  },


  optionMeta:{
    marginTop:6,
    color:colors.secondaryText,
    fontSize:14,
    fontWeight:'500',
  },


  highlightText:{
    color:SUCCESS_GREEN,
    fontWeight:'700',
  },


  balanceText:{
    marginTop:14,
    color:colors.secondaryText,
    fontSize:14,
    lineHeight:21,
  },


  scoreHeader:{
    marginTop:30,
    marginBottom:12,
    flexDirection:'row',
    alignItems:'flex-end',
    justifyContent:'space-between',
  },


  scoreLabel:{
    color:colors.secondaryText,
    fontSize:14,
    fontWeight:'600',
  },


  percentage:{
    color:colors.primary,
    fontSize:34,
    fontWeight:'800',
    letterSpacing:-0.8,
    lineHeight:38,
  },


  percentagePositive:{
    color:SUCCESS_GREEN,
  },


  message:{
    marginTop:24,
    color:colors.text,
    fontSize:19,
    fontWeight:'700',
    lineHeight:27,
  },

});
