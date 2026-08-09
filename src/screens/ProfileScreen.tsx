import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '../components/AnimatedPressable';
import { AppIcon } from '../components/AppIcon';
import { FadeInView } from '../components/FadeInView';
import { colors, layout, motion, radii, spacing } from '../theme';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { resetJourneyData } from '../utils/resetJourneyData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ProfileScreen({ navigation }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.screen}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>

          <Text accessibilityRole="header" style={styles.title}>
            Profil
          </Text>

          <Text style={styles.subtitle}>
            Vos préférences et vos données.
          </Text>
        </FadeInView>


        <FadeInView delay={70} style={styles.sections}>
          
          <AnimatedPressable
            accessibilityHint="Affiche les décisions mises de côté"
            accessibilityRole="button"
            onPress={() => navigation.navigate('Archives')}
            pressedStyle={styles.rowPressed}
            scaleTo={motion.subtlePressScale}
            style={[
              styles.row,
              Platform.OS === 'web' && styles.webButton,
            ]}
          >
            <View style={styles.rowIcon}>
              <AppIcon
                color={colors.primary}
                name="archive"
                size="md"
                weight="medium"
              />
            </View>

            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                Archives
              </Text>

              <Text style={styles.rowSubtitle}>
                Décisions mises de côté
              </Text>
            </View>

            <AppIcon
              color={colors.primary}
              name="chevron-right"
              size="lg"
            />
          </AnimatedPressable>

          <View style={styles.testSection}>
            <Text style={styles.sectionLabel}>
              Tests
            </Text>

            <AnimatedPressable
              accessibilityHint="Réinitialise la progression du parcours"
              accessibilityRole="button"
            onPress={async () => {
            await resetJourneyData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
              pressedStyle={styles.rowPressed}
              scaleTo={motion.subtlePressScale}
              style={[
                styles.row,
                Platform.OS === 'web' && styles.webButton,
              ]}
            >
              <View style={styles.rowIcon}>
                <AppIcon
                  color={colors.primary}
                  name="database"
                  size="md"
                  weight="medium"
                />
              </View>

         <View style={styles.rowText}>
            <Text style={styles.rowTitle}>
              Réinitialiser le parcours
            </Text>

            <Text style={styles.rowSubtitle}>
              Recommencer comme un nouvel utilisateur
            </Text>
          </View>

          <AppIcon
            color={colors.primary}
            name="chevron-right"
            size="lg"
          />
            </AnimatedPressable>
          </View>

          <View style={styles.localData}>
            <View style={styles.rowIcon}>
              <AppIcon
                color={colors.primary}
                name="database"
                size="md"
                weight="medium"
              />
            </View>

            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                Données locales
              </Text>

              <Text style={styles.rowSubtitle}>
                Conservées uniquement sur cet appareil
              </Text>
            </View>
          </View>



        </FadeInView>


        <Text style={styles.version}>
          Décisions · MVP
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screen: {
    flexGrow: 1,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 30,
    paddingBottom: spacing.lg,
  },


  header: {
    alignItems: 'flex-start',
  },


  avatar: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.card,
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '800',
  },


  title: {
    marginTop: 24,
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 42,
  },


  subtitle: {
    marginTop: 10,
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 24,
  },


  sections: {
    marginTop: 34,
    gap: 12,
  },


  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.white,
  },


  localData: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },


  rowPressed: {
    borderColor: colors.primary,
  },


  rowIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.base,
    backgroundColor: colors.primarySoft,
  },


  rowText: {
    flex: 1,
    marginLeft: 14,
  },


  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },


  rowSubtitle: {
    marginTop: 3,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },


  testSection: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },


  sectionLabel: {
    marginBottom: 12,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },


  version: {
    marginTop: 'auto',
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },


  webButton: {
    cursor: 'pointer',
  },

});
