import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FollowUpNotificationHost } from './src/components/FollowUpNotificationHost';
import { ReducedMotionProvider } from './src/hooks/useReducedMotion';
import { MainTabs } from './src/navigation/MainTabs';
import { ArchivesScreen } from './src/screens/ArchivesScreen';
import { DecisionArgumentsScreen } from './src/screens/DecisionArgumentsScreen';
import { DecisionCommitmentScreen } from './src/screens/DecisionCommitmentScreen';
import { DecisionDetailScreen } from './src/screens/DecisionDetailScreen';
import { DecisionFollowUpScreen } from './src/screens/DecisionFollowUpScreen';
import { DecisionReviewScreen } from './src/screens/DecisionReviewScreen';
import { DecisionResultScreen } from './src/screens/DecisionResultScreen';
import { NewDecisionScreen } from './src/screens/NewDecisionScreen';
import { colors } from './src/theme';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ReducedMotionProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            screenOptions={{
              animation: 'slide_from_right',
              animationMatchesGesture: true,
              contentStyle: { backgroundColor: colors.background },
              fullScreenGestureEnabled: true,
              gestureEnabled: true,
              headerShown: false,
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="NewDecision" component={NewDecisionScreen} />
            <Stack.Screen
              name="DecisionArguments"
              component={DecisionArgumentsScreen}
            />
            <Stack.Screen
              name="DecisionResult"
              component={DecisionResultScreen}
            />
            <Stack.Screen
              name="DecisionCommitment"
              component={DecisionCommitmentScreen}
            />
            <Stack.Screen
              name="DecisionFollowUp"
              component={DecisionFollowUpScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="DecisionDetail"
              component={DecisionDetailScreen}
            />
            <Stack.Screen
              name="DecisionReview"
              component={DecisionReviewScreen}
            />
            <Stack.Screen name="Archives" component={ArchivesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <FollowUpNotificationHost navigationRef={navigationRef} />
      </ReducedMotionProvider>
    </SafeAreaProvider>
  );
}
