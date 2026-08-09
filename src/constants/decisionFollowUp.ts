import { resolveCalendarOffsetDate } from '../utils/followUpDate';

export type DecisionFollowUpOptionId =
  | 'one-week'
  | 'one-month'
  | 'three-months'
  | 'six-months'
  | 'custom';

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
  { id: 'custom', label: 'Choisir une date' },
];

export function resolveFollowUpDate(
  option: DecisionFollowUpOption,
  from = new Date(),
) {
  if (!option.months && !option.weeks) {
    return undefined;
  }

  return resolveCalendarOffsetDate(from, option);
}
