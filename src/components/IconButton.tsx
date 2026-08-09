import { Platform, StyleSheet } from 'react-native';

import { colors, layout, radii } from '../theme';
import type { AppIconName } from './AppIcon';
import { AppIcon } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  accessibilityHint?: string;
  destructive?: boolean;
  icon: AppIconName;
  label: string;
  onPress: () => void;
};

export function IconButton({
  accessibilityHint,
  destructive = false,
  icon,
  label,
  onPress,
}: Props) {
  const webTooltipProps = Platform.OS === 'web' ? { title: label } : {};

  return (
    <AnimatedPressable
      {...webTooltipProps}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      haptic="light"
      onPress={onPress}
      pressedStyle={[
        styles.pressed,
        destructive && styles.destructivePressed,
      ]}
      style={styles.button}
    >
      {({ pressed }) => (
        <AppIcon
          color={
            destructive && pressed
              ? colors.danger
              : colors.secondaryText
          }
          name={icon}
          size="sm"
          weight="regular"
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceMutedStrong,
  },
  destructivePressed: {
    backgroundColor: colors.dangerSoft,
  },
});
