import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  triggerHaptic,
  type HapticPattern,
} from '../interactions/hapticFeedback';
import { colors, motion } from '../theme';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode | ((state: PressableStateCallbackType) => ReactNode);
  containerStyle?: StyleProp<ViewStyle>;
  focusStyle?: StyleProp<ViewStyle>;
  haptic?: HapticPattern;
  pressedStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  style?: PressableProps['style'];
};

export function AnimatedPressable({
  children,
  containerStyle,
  disabled,
  focusStyle,
  haptic,
  onBlur,
  onFocus,
  onPress,
  onPressIn,
  onPressOut,
  pressedStyle,
  scaleTo = motion.pressScale,
  style,
  ...props
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const [isFocused, setIsFocused] = useState(false);
  const reduceMotion = useReducedMotion();

  const animateScale = (toValue: number) => {
    if (reduceMotion) {
      scale.setValue(1);
      return;
    }

    Animated.spring(scale, {
      ...motion.spring,
      toValue,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        disabled={disabled}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onPress={(event) => {
          if (haptic) {
            void triggerHaptic(haptic);
          }
          onPress?.(event);
        }}
        onPressIn={(event) => {
          animateScale(scaleTo);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animateScale(1);
          onPressOut?.(event);
        }}
        style={(state) => [
          typeof style === 'function' ? style(state) : style,
          state.pressed && pressedStyle,
          Platform.OS === 'web' && isFocused && [
            { outlineColor: colors.focus, outlineStyle: 'solid', outlineWidth: 3 },
            focusStyle,
          ],
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
