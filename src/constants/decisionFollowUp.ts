export type DecisionFollowUpOptionId =
  | 'one-week'
  | 'one-month'
  | 'three-months'
  | 'six-months'
  | 'choose-later';

export type DecisionFollowUpOption = {
  id: DecisionFollowUpOptionId;
  label: string;
  months?: number;
  weeks?: number;
};

export const decisionFollowUpOptions: DecisionFollowUpOption[] = [
  { id: 'one-week', label: 'Dans 1 semaine', weeks: 1 },
  { id: 'one-month', label: 'Dans 1 mois', months: 1 },
  { id: 'three-months', label: 'Dans 3 mois', months: 3 },
  { id: 'six-months', label: 'Dans 6 mois', months: 6 },
  { id: 'choose-later', label: 'Je choisirai plus tard' },
];

export function resolveFollowUpDate(
  option: DecisionFollowUpOption,
  from = new Date(),
) {
  if (!option.months && !option.weeks) {
    return undefined;
  }

  const date = new Date(from);

  if (option.weeks) {
    date.setDate(date.getDate() + option.weeks * 7);
  }

  if (option.months) {
    const originalDay = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + option.months);
    const lastDayOfTargetMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    date.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  }

  return date.toISOString();
}
