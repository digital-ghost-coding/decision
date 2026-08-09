import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { AppIcon } from '../components/AppIcon';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { FadeInView } from '../components/FadeInView';
import { InAppNotification } from '../components/InAppNotification';
import {
  deleteDecision,
  getArchivedDecisions,
  restoreDecision,
  saveDecision,
} from '../storage/decisionStorage';
import { colors, layout, radii, spacing } from '../theme';
import type { Decision } from '../types/decision';
import type { AppNotification, RootStackParamList } from '../types/navigation';
import { createAppNotification } from '../types/notification';

type Props = NativeStackScreenProps<RootStackParamList, 'Archives'>;

type ArchiveNotification = AppNotification & {
  actionLabel?: string;
  onAction?: () => void;
};

export function ArchivesScreen({ navigation }: Props) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notification, setNotification] =
    useState<ArchiveNotification | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const loadArchives = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      setDecisions(await getArchivedDecisions());
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadArchives();
    }, [loadArchives]),
  );

  const showNotification = (nextNotification: ArchiveNotification) => {
    setNotification(nextNotification);
    setIsNotificationVisible(true);
  };

  const restore = async (decision: Decision) => {
    try {
      await restoreDecision(decision.id);
      setDecisions((current) =>
        current.filter((item) => item.id !== decision.id),
      );
      showNotification({
        ...createAppNotification({
          message: 'Elle retrouve son statut précédent.',
          relatedDecisionId: decision.id,
          title: 'Décision restaurée',
          type: 'decision_status',
        }),
      });
    } catch {
      showNotification({
        ...createAppNotification({
          message: 'La décision reste dans les archives.',
          title: 'Restauration impossible',
          type: 'decision_status',
        }),
      });
    }
  };

  const remove = async (decision: Decision) => {
    try {
      await deleteDecision(decision.id);
      setDecisions((current) =>
        current.filter((item) => item.id !== decision.id),
      );
      showNotification({
        ...createAppNotification({
          action: {
            decision,
            label: 'Annuler',
            type: 'restore-decision',
          },
          message: 'Vous pouvez encore annuler cette action.',
          relatedDecisionId: decision.id,
          title: 'Archive supprimée',
          type: 'decision_status',
        }),
        actionLabel: 'Annuler',
        onAction: () => {
          void saveDecision({
            ...decision,
            updatedAt: new Date().toISOString(),
          }).then(loadArchives);
        },
      });
    } catch {
      showNotification({
        ...createAppNotification({
          message: 'L’archive n’a pas été supprimée.',
          title: 'Suppression impossible',
          type: 'decision_status',
        }),
      });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          <BackButton onPress={() => navigation.goBack()} />
          <FadeInView style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              Archives
            </Text>
            <Text style={styles.subtitle}>
              Vos décisions mises de côté.
            </Text>
          </FadeInView>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : loadError ? (
            <View style={styles.centerState}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                Impossible de charger les archives.
              </Text>
              <AnimatedPressable
                accessibilityRole="button"
                haptic="selection"
                onPress={() => void loadArchives()}
                pressedStyle={styles.actionPressed}
                style={[
                  styles.retryButton,
                  Platform.OS === 'web' && styles.webButton,
                ]}
              >
                <Text style={styles.retryLabel}>Réessayer</Text>
              </AnimatedPressable>
            </View>
          ) : decisions.length === 0 ? (
            <View style={styles.centerState}>
              <View style={styles.emptyIcon}>
                <AppIcon color={colors.primary} name="archive" size="xl" />
              </View>
              <Text style={styles.emptyTitle}>Aucune archive</Text>
              <Text style={styles.emptyText}>
                Elles apparaîtront ici quand vous les mettrez de côté.
              </Text>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={decisions}
              keyExtractor={(item) => item.id}
              renderItem={({ index, item }) => (
                <FadeInView
                  delay={Math.min(index, 5) * 35}
                  style={styles.card}
                >
                  <Text
                    accessibilityRole="header"
                    numberOfLines={2}
                    style={styles.cardTitle}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardMeta}>
                    Archivée · {item.pros.length} Pour · {item.cons.length} Contre
                  </Text>
                  <View style={styles.cardActions}>
                    <AnimatedPressable
                      accessibilityLabel={`Restaurer ${item.title}`}
                      accessibilityRole="button"
                      containerStyle={styles.actionButtonContainer}
                      haptic="selection"
                      onPress={() => void restore(item)}
                      pressedStyle={styles.actionPressed}
                      style={[
                        styles.actionButton,
                        styles.restoreButton,
                        Platform.OS === 'web' && styles.webButton,
                      ]}
                    >
                      <Text style={styles.restoreLabel}>Restaurer</Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                      accessibilityLabel={`Supprimer définitivement ${item.title}`}
                      accessibilityRole="button"
                      containerStyle={styles.actionButtonContainer}
                      haptic="selection"
                      onPress={() => void remove(item)}
                      pressedStyle={styles.actionPressed}
                      style={[
                        styles.actionButton,
                        Platform.OS === 'web' && styles.webButton,
                      ]}
                    >
                      <Text style={styles.deleteLabel}>Supprimer</Text>
                    </AnimatedPressable>
                  </View>
                </FadeInView>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </View>
      </SafeAreaView>

      {notification ? (
          <InAppNotification
        actionLabel={notification.actionLabel}
        duration={notification.actionLabel ? 5500 : 4000}
        message={notification.message}
        title={notification.title}
        type={notification.type}
        onAction={notification.onAction}
        onDismiss={() => setIsNotificationVisible(false)}
        visible={isNotificationVisible}
      />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 8,
  },
  header: { marginTop: 34 },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 42,
  },
  subtitle: {
    marginTop: 12,
    color: colors.secondaryText,
    fontSize: 16,
    lineHeight: 24,
  },
  list: { flex: 1, marginTop: 28 },
  listContent: { gap: 14, paddingBottom: 28 },
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.white,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  cardMeta: {
    marginTop: 9,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  cardActions: { marginTop: 18, flexDirection: 'row', gap: 10 },
  actionButtonContainer: { flex: 1 },
  actionButton: {
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.base,
  },
  restoreButton: { borderColor: colors.primarySoft, backgroundColor: colors.primarySurface },
  restoreLabel: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  deleteLabel: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  actionPressed: { opacity: 0.72 },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.card,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: {
    marginTop: 20,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    maxWidth: 320,
    marginTop: 10,
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorText: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: layout.touchTarget,
    marginTop: 18,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: radii.base,
    backgroundColor: colors.primary,
  },
  retryLabel: { color: colors.white, fontSize: 14, fontWeight: '700' },
  webButton: { cursor: 'pointer' },
});
