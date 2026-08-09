import { memo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, layout, radii, shadows, spacing } from '../theme';
import type { Argument, ArgumentSide } from '../types/decision';
import { AppIcon } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';
import { FadeInView } from './FadeInView';

type Props = {
  argumentsList: Argument[];
  onAdd: (text: string, side: ArgumentSide) => void;
  onRemove: (id: string) => void;
  side: ArgumentSide;
  subtitle: string;
  title: string;
};

function ArgumentSectionComponent({
  argumentsList,
  onAdd,
  onRemove,
  side,
  subtitle,
  title,
}: Props) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const canAdd = value.trim().length > 0;

  const addArgument = () => {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (!normalizedValue) {
      return;
    }

    onAdd(normalizedValue, side);
    setValue('');
  };

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.list}>
        {argumentsList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aucun argument pour l’instant.
            </Text>
          </View>
        ) : (
          argumentsList.map((argument, index) => (
            <FadeInView
              delay={Math.min(index, 4) * 35}
              key={argument.id}
              style={styles.argumentCard}
            >
              <Text style={styles.argumentText}>{argument.text}</Text>
              <AnimatedPressable
                accessibilityLabel={`Supprimer l’argument ${argument.text}`}
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => onRemove(argument.id)}
                pressedStyle={styles.removeButtonPressed}
                style={[
                  styles.removeButton,
                  Platform.OS === 'web' && styles.webButton,
                ]}
              >
                <AppIcon
                  color={colors.secondaryText}
                  name="delete"
                  size="md"
                  weight="regular"
                />
              </AnimatedPressable>
            </FadeInView>
          ))
        )}
      </View>

      <View style={styles.inputRow}>
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
          ]}
        >
          <TextInput
            accessibilityLabel={`Nouvel argument ${title}`}
            accessibilityHint="Saisissez un argument puis validez-le avec la touche Terminé"
            onBlur={() => setIsFocused(false)}
            onChangeText={setValue}
            onFocus={() => setIsFocused(true)}
            onSubmitEditing={addArgument}
            placeholder="Ajouter un argument"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            selectionColor={colors.primary}
            style={styles.input}
            submitBehavior="blurAndSubmit"
            value={value}
          />
        </View>

        <AnimatedPressable
          accessibilityHint="Ajoute cet argument"
          accessibilityLabel={`Ajouter l’argument ${title}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canAdd }}
          disabled={!canAdd}
          haptic="light"
          onPress={addArgument}
          pressedStyle={canAdd && styles.addButtonPressed}
          style={[
            styles.addButton,
            Platform.OS === 'web' && styles.webButton,
            !canAdd && styles.addButtonDisabled,
          ]}
        >
          <AppIcon
            color={canAdd ? colors.white : colors.disabledText}
            name="add"
            size="lg"
            weight="medium"
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

export const ArgumentSection = memo(ArgumentSectionComponent);

const styles = StyleSheet.create({
  section: {
    padding: spacing.ml,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  heading: {
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 10,
  },
  emptyState: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.field,
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  argumentCard: {
    minHeight: layout.touchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 15,
    paddingRight: 10,
    borderRadius: radii.field,
    backgroundColor: colors.background,
  },
  argumentText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  removeButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  removeButtonPressed: {
    backgroundColor: colors.disabled,
  },
  inputRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.white,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  input: {
    padding: 0,
    color: colors.text,
    fontSize: 15,
  },
  addButton: {
    width: 52,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.field,
    backgroundColor: colors.primary,
  },
  addButtonDisabled: {
    backgroundColor: colors.disabled,
    cursor: 'auto',
  },
  addButtonPressed: {
    opacity: 0.88,
  },
  webButton: {
    cursor: 'pointer',
  },
});
