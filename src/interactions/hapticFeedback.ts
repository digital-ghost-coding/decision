import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticPattern = 'light' | 'selection' | 'success';

export async function triggerHaptic(pattern: HapticPattern) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    if (pattern === 'light') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (pattern === 'selection') {
      await Haptics.selectionAsync();
      return;
    }

    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );
  } catch {
    // Le feedback enrichit l'interaction sans jamais la bloquer.
  }
}
