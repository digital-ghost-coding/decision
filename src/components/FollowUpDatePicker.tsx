import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, layout, motion, radii, spacing } from '../theme';
import {
  areSameLocalCalendarDate,
  getCalendarMonthGrid,
  getLocalCalendarDate,
  isFutureLocalCalendarDate,
  parseTrackingDate,
  serializeLocalCalendarDate,
  shiftCalendarMonth,
  type CalendarMonth,
  type LocalCalendarDate,
} from '../utils/followUpDate';
import { AnimatedPressable } from './AnimatedPressable';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

const weekdayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Props = {
  initialValue?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

function formatMonth(value: CalendarMonth) {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value.year, value.month, 1, 12, 0, 0, 0));
}

export function FollowUpDatePicker({
  initialValue,
  onCancel,
  onConfirm,
}: Props) {
  const initialDate = parseTrackingDate(initialValue);
  const today = getLocalCalendarDate();
  const [selectedDate, setSelectedDate] =
    useState<LocalCalendarDate | undefined>(initialDate);
  const [visibleMonth, setVisibleMonth] = useState<CalendarMonth>(() => ({
    month: initialDate?.month ?? today.month,
    year: initialDate?.year ?? today.year,
  }));

  const monthCells = useMemo(
    () => getCalendarMonthGrid(visibleMonth),
    [visibleMonth],
  );
  const canGoToPreviousMonth =
    visibleMonth.year * 12 + visibleMonth.month >
    today.year * 12 + today.month;
  const canConfirm =
    Boolean(selectedDate) &&
    isFutureLocalCalendarDate(selectedDate as LocalCalendarDate);

  return (
    <View accessibilityLabel="Calendrier de suivi" style={styles.container}>
      <View style={styles.monthHeader}>
        <AnimatedPressable
          accessibilityLabel="Mois précédent"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canGoToPreviousMonth }}
          disabled={!canGoToPreviousMonth}
          onPress={() =>
            setVisibleMonth((current) => shiftCalendarMonth(current, -1))
          }
          pressedStyle={styles.monthButtonPressed}
          scaleTo={motion.subtlePressScale}
          style={styles.monthButton}
        >
          <Text
            style={[
              styles.monthButtonLabel,
              !canGoToPreviousMonth && styles.monthButtonLabelDisabled,
            ]}
          >
            ‹
          </Text>
        </AnimatedPressable>

        <Text accessibilityRole="header" style={styles.monthLabel}>
          {formatMonth(visibleMonth)}
        </Text>

        <AnimatedPressable
          accessibilityLabel="Mois suivant"
          accessibilityRole="button"
          onPress={() =>
            setVisibleMonth((current) => shiftCalendarMonth(current, 1))
          }
          pressedStyle={styles.monthButtonPressed}
          scaleTo={motion.subtlePressScale}
          style={styles.monthButton}
        >
          <Text style={styles.monthButtonLabel}>›</Text>
        </AnimatedPressable>
      </View>

      <View style={styles.weekdays}>
        {weekdayLabels.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthCells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.daySlot} />;
          }

          const isAvailable = isFutureLocalCalendarDate(date);
          const isSelected = areSameLocalCalendarDate(date, selectedDate);

          return (
            <View key={`${date.year}-${date.month}-${date.day}`} style={styles.daySlot}>
              <AnimatedPressable
                accessibilityLabel={new Intl.DateTimeFormat('fr-FR', {
                  dateStyle: 'full',
                }).format(
                  new Date(date.year, date.month, date.day, 12, 0, 0, 0),
                )}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: !isAvailable,
                  selected: isSelected,
                }}
                disabled={!isAvailable}
                haptic="selection"
                onPress={() => setSelectedDate(date)}
                pressedStyle={styles.dayPressed}
                scaleTo={motion.subtlePressScale}
                style={[
                  styles.day,
                  isSelected && styles.daySelected,
                  Platform.OS === 'web' && styles.webButton,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    !isAvailable && styles.dayLabelDisabled,
                    isSelected && styles.dayLabelSelected,
                  ]}
                >
                  {date.day}
                </Text>
              </AnimatedPressable>
            </View>
          );
        })}
      </View>

      <Text style={styles.helper}>Choisissez une date à partir de demain.</Text>

      <View style={styles.actions}>
        <PrimaryButton
          disabled={!canConfirm}
          label="Choisir cette date"
          onPress={() => {
            if (selectedDate && canConfirm) {
              onConfirm(serializeLocalCalendarDate(selectedDate));
            }
          }}
        />
        <SecondaryButton label="Annuler" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  monthButtonPressed: { backgroundColor: colors.primarySurface },
  monthButtonLabel: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
  },
  monthButtonLabelDisabled: { color: colors.disabledText },
  monthLabel: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  weekdays: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  daySlot: {
    width: `${100 / 7}%`,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  daySelected: { backgroundColor: colors.primary },
  dayPressed: { backgroundColor: colors.primarySoft },
  dayLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  dayLabelDisabled: { color: colors.disabledText },
  dayLabelSelected: { color: colors.white },
  helper: {
    marginTop: spacing.sm,
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: { marginTop: spacing.md, gap: spacing.sm },
  webButton: { cursor: 'pointer' },
});
