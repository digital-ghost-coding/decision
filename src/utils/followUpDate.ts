export type LocalCalendarDate = {
  day: number;
  month: number;
  year: number;
};

export type CalendarMonth = Pick<LocalCalendarDate, 'month' | 'year'>;

function toComparableDay(value: LocalCalendarDate) {
  return value.year * 10_000 + (value.month + 1) * 100 + value.day;
}

export function getLocalCalendarDate(value = new Date()): LocalCalendarDate {
  return {
    day: value.getDate(),
    month: value.getMonth(),
    year: value.getFullYear(),
  };
}

export function isValidLocalCalendarDate(value: LocalCalendarDate) {
  const date = new Date(value.year, value.month, value.day, 12, 0, 0, 0);

  return (
    date.getFullYear() === value.year &&
    date.getMonth() === value.month &&
    date.getDate() === value.day
  );
}

export function isFutureLocalCalendarDate(
  value: LocalCalendarDate,
  now = new Date(),
) {
  return (
    isValidLocalCalendarDate(value) &&
    toComparableDay(value) > toComparableDay(getLocalCalendarDate(now))
  );
}

/**
 * Une date choisie dans le calendrier est construite en heure locale à midi.
 *
 * Éviter `new Date('AAAA-MM-JJ')` empêche l'analyse implicite en UTC de faire
 * apparaître la veille dans certains fuseaux. Midi laisse aussi une marge sûre
 * autour des changements d'heure tout en restant compatible avec le service
 * existant, qui compare des instants ISO.
 */
export function serializeLocalCalendarDate(value: LocalCalendarDate) {
  if (!isValidLocalCalendarDate(value)) {
    throw new Error('Date locale invalide');
  }

  return new Date(
    value.year,
    value.month,
    value.day,
    12,
    0,
    0,
    0,
  ).toISOString();
}

export function parseTrackingDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? undefined
    : getLocalCalendarDate(date);
}

export function areSameLocalCalendarDate(
  first?: LocalCalendarDate,
  second?: LocalCalendarDate,
) {
  return (
    Boolean(first) &&
    Boolean(second) &&
    first?.day === second?.day &&
    first?.month === second?.month &&
    first?.year === second?.year
  );
}

export function shiftCalendarMonth(
  value: CalendarMonth,
  offset: number,
): CalendarMonth {
  const date = new Date(value.year, value.month + offset, 1, 12, 0, 0, 0);

  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}

export function getCalendarMonthGrid(value: CalendarMonth) {
  const firstWeekday =
    (new Date(value.year, value.month, 1, 12, 0, 0, 0).getDay() + 6) % 7;
  const daysInMonth = new Date(
    value.year,
    value.month + 1,
    0,
    12,
    0,
    0,
    0,
  ).getDate();
  const cells: Array<LocalCalendarDate | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, month: value.month, year: value.year });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function resolveCalendarOffsetDate(
  from: Date,
  offset: { months?: number; weeks?: number },
) {
  const date = new Date(from);

  if (offset.weeks) {
    date.setDate(date.getDate() + offset.weeks * 7);
  }

  if (offset.months) {
    const originalDay = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + offset.months);
    const lastDayOfTargetMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    date.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  }

  return date.toISOString();
}
