import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, motion, radii } from '../theme';

type Props = {
  percentage: number;
  positive?: boolean;
};

function ScoreBarComponent({
  percentage,
  positive = false,
}: Props) {
  const normalizedPercentage = Math.max(
    0,
    Math.min(100, percentage),
  );

  const progress = useRef(
    new Animated.Value(0),
  ).current;

  const reduceMotion = useReducedMotion();


  useEffect(() => {

    if (reduceMotion) {
      progress.setValue(normalizedPercentage);
      return;
    }


    Animated.timing(progress, {
      delay: motion.duration.fast,
      duration: motion.duration.entrance,
      easing: motion.easing.enter,
      toValue: normalizedPercentage,
      useNativeDriver: false,
    }).start();


  }, [
    normalizedPercentage,
    progress,
    reduceMotion,
  ]);



  const progressWidth =
    progress.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });



  return (
    <View
      accessibilityLabel={`Tendance actuelle à ${normalizedPercentage} pour cent`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: 100,
        min: 0,
        now: normalizedPercentage,
      }}
      style={styles.track}
    >

      <Animated.View
        style={[
          styles.progress,
          positive && styles.progressPositive,
          {
            width: progressWidth,
          },
        ]}
      />

    </View>
  );
}


export const ScoreBar = memo(ScoreBarComponent);



const styles = StyleSheet.create({

  track: {
    width: '100%',
    height: 10,
    overflow: 'hidden',
    borderRadius: radii.xs,
    backgroundColor: colors.disabled,
  },


  progress: {
    height: '100%',
    borderRadius: radii.xs,
    backgroundColor: colors.primary,
  },


  progressPositive: {
    backgroundColor: 'rgb(21, 128, 61)',
  },

});