import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { motion } from '../theme';

type Props = PropsWithChildren<{
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function FadeInView({
  children,
  delay = 0,
  distance = 10,
  style,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }

    const animation = Animated.timing(progress, {
      delay,
      duration: motion.duration.entrance,
      easing: motion.easing.enter,
      toValue: 1,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [delay, progress, reduceMotion]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
