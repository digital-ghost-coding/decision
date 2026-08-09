import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InAppNotification } from '../components/InAppNotification';
import { FadeInView } from '../components/FadeInView';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { colors, layout, radii, shadows, spacing } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import { getDecisions } from '../storage/decisionStorage';
import type { AppNotification } from '../types/notification';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation, route }: Props) {
const [notification, setNotification] = useState<AppNotification | undefined>(
  route.params?.notification,
);  
const [isNotificationVisible, setIsNotificationVisible] = useState(
    Boolean(notification),
  );

  const [hasDecisions, setHasDecisions] = useState(false);


  useEffect(() => {
  setIsNotificationVisible(Boolean(notification));
}, [notification?.id, notification]);

useFocusEffect(
  useCallback(() => {
    let isMounted = true;

    async function checkDecisions() {
      const storedDecisions = await getDecisions();

      if (isMounted) {
        setHasDecisions(storedDecisions.length > 0);
      }
    }

    checkDecisions();

    console.log('NOTIFICATION TYPE:', notification?.type);
    return () => {
      isMounted = false;
    };
  }, []),
);

  useEffect(() => {
    setIsNotificationVisible(Boolean(notification));
  }, [notification?.id, notification]);

  const dismissNotification = useCallback(() => {
    setIsNotificationVisible(false);
  }, []);

  console.log('NOTIFICATION TYPE:', notification?.type);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.screen}
          showsVerticalScrollIndicator={false}
        >
          <FadeInView style={styles.content}>
            <View style={styles.brandMark} accessibilityElementsHidden>
              <View style={styles.brandMarkInner} />
            </View>

            <Text accessibilityRole="header" style={styles.title}>
              Decisionly
            </Text>
            <Text style={styles.subtitle}>
              Prenez de meilleures décisions,
              un choix après l'autre.
            </Text>

              <Text style={styles.description}>
              Decisionly vous aide à clarifier
              vos options, choisir sereinement,
              et apprendre de vos décisions.            
              </Text>
          </FadeInView>

          <FadeInView delay={90} style={styles.actions}>
            <PrimaryButton
              label="Créer une décision"
              onPress={() => navigation.navigate('NewDecision')}
            />
       {hasDecisions && (
            <SecondaryButton
              label="Mes décisions"
              onPress={() => navigation.navigate('DecisionList')}
            />
          )}
          </FadeInView>
        </ScrollView>
      </SafeAreaView>

      {notification ? (
        <InAppNotification
        message={notification.message}
        onDismiss={dismissNotification}
        title={notification.title}
        type={notification.type}
        visible={isNotificationVisible}
        />  
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 72,
    paddingBottom: spacing.lg,
  },
  content: {
    alignItems: 'flex-start',
  },
  actions: {
    gap: spacing.base,
  },
  brandMark: {
    width: 64,
    height: 64,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.card,
    backgroundColor: colors.primary,
    ...shadows.primary,
  },
  brandMarkInner: {
    width: 22,
    height: 22,
    borderRadius: radii.xs,
    backgroundColor: colors.white,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  subtitle: {
    maxWidth: 340,
    marginTop: 16,
    color: colors.secondaryText,
    fontSize: 19,
    fontWeight: '400',
    lineHeight: 28,
  },

  description: {
  maxWidth: 340,
  marginTop: 80,
  color: colors.secondaryText,
  fontSize: 17,
  lineHeight: 26,
},
});
