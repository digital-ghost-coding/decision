import AsyncStorage from '@react-native-async-storage/async-storage';

const RESET_KEYS = [
  '@decisionly/decisions/v1',
  '@decisionly/notifications/v1',
  '@decisionly/achievements/v1',
];

export async function resetJourneyData() {
  await AsyncStorage.multiRemove(RESET_KEYS);
}