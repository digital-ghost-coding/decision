import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import { AppIcon, type AppIconName } from '../components/AppIcon';
import { DecisionListScreen } from '../screens/DecisionListScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JourneyScreen } from '../screens/JourneyScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, radii, spacing } from '../theme';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, AppIconName> = {
  Home: 'home',
  DecisionList: 'decisions',
  Journey: 'journey',
  Profile: 'profile',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, focused }) => (
          <AppIcon
            active={focused}
            color={color}
            name={tabIcons[route.name]}
            size="lg"
          />
        ),
        tabBarIconStyle: styles.icon,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen
        component={HomeScreen}
        name="Home"
        options={{
          tabBarAccessibilityLabel: 'Accueil',
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        component={DecisionListScreen}
        name="DecisionList"
        options={{
          tabBarAccessibilityLabel: 'Mes décisions',
          tabBarLabel: 'Mes décisions',
        }}
      />
      <Tab.Screen
        component={JourneyScreen}
        name="Journey"
        options={{
          tabBarAccessibilityLabel: 'Parcours',
          tabBarLabel: 'Parcours',
        }}
      />
      <Tab.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          tabBarAccessibilityLabel: 'Profil',
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingTop: spacing.xs,
  },
  tabBarItem: {
    minHeight: 49,
    borderRadius: radii.sm,
  },
  icon: {
    marginTop: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
});
