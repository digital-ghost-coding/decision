import { memo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  DEFAULT_ARGUMENT_WEIGHT,
  argumentWeightOptions,
  getArgumentWeightLabel,
  normalizeArgumentWeight,
} from '../constants/argumentWeights';
import { colors, layout, radii, shadows, spacing } from '../theme';
import type {
  Argument,
  ArgumentSide,
  ArgumentWeight,
} from '../types/decision';
import { AppIcon } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';
import { FadeInView } from './FadeInView';

type Props = {
  argumentsList: Argument[];
  embedded?: boolean;
  onAdd: (
    text: string,
    side: ArgumentSide,
    weight: ArgumentWeight,
  ) => void;
  onFieldFocus?: (target: number) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string, weight: ArgumentWeight) => void;
  placeholder?: string;
  side: ArgumentSide;
  subtitle: string;
  title: string;
};

type WeightSelectorProps = {
  onChange: (weight: ArgumentWeight) => void;
  value: ArgumentWeight;
};

function WeightSelector({ onChange, value }: WeightSelectorProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      style={styles.weightOptions}
    >
      {argumentWeightOptions.map((option) => {
        const isSelected = option.value === value;

        return (
          <AnimatedPressable
            accessibilityHint={option.description}
            accessibilityLabel={`Importance ${option.label}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            haptic="selection"
            key={option.level}
            onPress={() => onChange(option.value)}
            pressedStyle={styles.weightButtonPressed}
            style={[
              styles.weightButton,
              isSelected && styles.weightButtonSelected,
              Platform.OS === 'web' && styles.webButton,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.weightButtonText,
                isSelected && styles.weightButtonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

function ArgumentSectionComponent({
  argumentsList,
  embedded = false,
  onAdd,
  onFieldFocus,
  onRemove,
  onUpdate,
  placeholder = 'Ajouter un argument',
  side,
  subtitle,
  title,
}: Props) {
  const [value, setValue] = useState('');
  const [weight, setWeight] = useState<ArgumentWeight>(
    DEFAULT_ARGUMENT_WEIGHT,
  );
  const [isFocused, setIsFocused] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingWeight, setEditingWeight] = useState<ArgumentWeight>(
    DEFAULT_ARGUMENT_WEIGHT,
  );
  const activeFieldTarget = useRef<number | null>(null);
  const canAdd = value.trim().length > 0;
  const canSaveEdit = editingText.trim().length > 0;

  const addArgument = () => {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (!normalizedValue) {
      return;
    }

    onAdd(normalizedValue, side, weight);
    setValue('');
    setWeight(DEFAULT_ARGUMENT_WEIGHT);
  };

  const startEditing = (argument: Argument) => {
    setEditingId(argument.id);
    setEditingText(argument.text);
    setEditingWeight(normalizeArgumentWeight(argument.weight));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
    setEditingWeight(DEFAULT_ARGUMENT_WEIGHT);
  };

  const saveEditing = () => {
    const normalizedText = editingText.trim().replace(/\s+/g, ' ');

    if (!editingId || !normalizedText) {
      return;
    }

    onUpdate(editingId, normalizedText, editingWeight);
    cancelEditing();
  };

  const revealActiveField = () => {
    if (activeFieldTarget.current !== null) {
      onFieldFocus?.(activeFieldTarget.current);
    }
  };

  return (
    <View style={[styles.section, embedded && styles.sectionEmbedded]}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.list}>
        {argumentsList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun élément pour l’instant.</Text>
          </View>
        ) : (
          argumentsList.map((argument, index) => {
            const isEditing = editingId === argument.id;

            return (
              <FadeInView
                delay={Math.min(index, 4) * 35}
                key={argument.id}
                style={styles.argumentCard}
              >
                {isEditing ? (
                  <View style={styles.editArea}>
                    <TextInput
                      accessibilityLabel={`Modifier ${argument.text}`}
                      autoFocus
                      multiline
                      onBlur={() => {
                        activeFieldTarget.current = null;
                      }}
                      onChangeText={setEditingText}
                      onContentSizeChange={revealActiveField}
                      onFocus={(event) => {
                        activeFieldTarget.current = event.nativeEvent.target;
                        onFieldFocus?.(event.nativeEvent.target);
                      }}
                      onSubmitEditing={saveEditing}
                      returnKeyType="done"
                      selectionColor={colors.primary}
                      style={styles.editInput}
                      submitBehavior="blurAndSubmit"
                      value={editingText}
                    />
                    <Text style={styles.weightLabel}>Importance</Text>
                    <WeightSelector
                      onChange={setEditingWeight}
                      value={editingWeight}
                    />
                    <View style={styles.editActions}>
                      <AnimatedPressable
                        accessibilityRole="button"
                        onPress={cancelEditing}
                        pressedStyle={styles.textActionPressed}
                        style={styles.textAction}
                      >
                        <Text style={styles.cancelText}>Annuler</Text>
                      </AnimatedPressable>
                      <AnimatedPressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !canSaveEdit }}
                        disabled={!canSaveEdit}
                        haptic="light"
                        onPress={saveEditing}
                        pressedStyle={styles.textActionPressed}
                        style={styles.textAction}
                      >
                        <Text
                          style={[
                            styles.saveText,
                            !canSaveEdit && styles.disabledActionText,
                          ]}
                        >
                          Enregistrer
                        </Text>
                      </AnimatedPressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.argumentContent}>
                      <Text style={styles.argumentText}>{argument.text}</Text>
                      <Text style={styles.weightBadge}>
                        {getArgumentWeightLabel(argument.weight)}
                      </Text>
                    </View>
                    <View style={styles.argumentActions}>
                      <AnimatedPressable
                        accessibilityLabel={`Modifier l’argument ${argument.text}`}
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => startEditing(argument)}
                        pressedStyle={styles.removeButtonPressed}
                        style={styles.editButton}
                      >
                        <Text style={styles.editButtonText}>Modifier</Text>
                      </AnimatedPressable>
                      <AnimatedPressable
                        accessibilityLabel={`Supprimer l’argument ${argument.text}`}
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => onRemove(argument.id)}
                        pressedStyle={styles.removeButtonPressed}
                        style={styles.removeButton}
                      >
                        <AppIcon
                          color={colors.secondaryText}
                          name="delete"
                          size="sm"
                          weight="regular"
                        />
                      </AnimatedPressable>
                    </View>
                  </>
                )}
              </FadeInView>
            );
          })
        )}
      </View>

      <View style={styles.addArea}>
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              accessibilityLabel={`Nouvel élément ${title}`}
              multiline
              onBlur={() => {
                setIsFocused(false);
                activeFieldTarget.current = null;
              }}
              onChangeText={setValue}
              onContentSizeChange={revealActiveField}
              onFocus={(event) => {
                setIsFocused(true);
                activeFieldTarget.current = event.nativeEvent.target;
                onFieldFocus?.(event.nativeEvent.target);
              }}
              onSubmitEditing={addArgument}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              selectionColor={colors.primary}
              style={styles.input}
              submitBehavior="blurAndSubmit"
              value={value}
            />
          </View>

          <AnimatedPressable
            accessibilityHint="Ajoute cet élément"
            accessibilityLabel={`Ajouter dans ${title}`}
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

        <Text style={styles.weightLabel}>Importance</Text>
        <WeightSelector onChange={setWeight} value={weight} />
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
  sectionEmbedded: {
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  heading: {
    marginBottom: spacing.base,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
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
    paddingVertical: spacing.base,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radii.field,
    backgroundColor: colors.background,
  },
  argumentContent: {
    flex: 1,
  },
  argumentText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  weightBadge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  argumentActions: {
    marginLeft: spacing.sm,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  editButton: {
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radii.xs,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  removeButtonPressed: {
    backgroundColor: colors.disabled,
  },
  addArea: {
    marginTop: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.white,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  input: {
    minHeight: 32,
    maxHeight: 96,
    padding: 0,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  addButton: {
    width: 54,
    minHeight: 54,
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
  weightLabel: {
    marginTop: spacing.base,
    marginBottom: spacing.xs,
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  weightOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  weightButton: {
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
  },
  weightButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  weightButtonPressed: {
    opacity: 0.82,
  },
  weightButtonText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  weightButtonTextSelected: {
    color: colors.primaryDark,
  },
  editArea: {
    flex: 1,
  },
  editInput: {
    minHeight: 54,
    maxHeight: 120,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  editActions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  textAction: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  textActionPressed: {
    opacity: 0.7,
  },
  cancelText: {
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  saveText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  disabledActionText: {
    color: colors.disabledText,
  },
  webButton: {
    cursor: 'pointer',
  },
});
