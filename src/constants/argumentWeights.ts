import type {
  ArgumentWeight,
  ArgumentWeightLevel,
} from '../types/decision';

export const DEFAULT_ARGUMENT_WEIGHT: ArgumentWeight = 3;

export const argumentWeightOptions = [
  {
    description: 'Compte comme 1 point',
    label: 'Secondaire',
    level: 'secondary',
    value: 1,
  },
  {
    description: 'Compte comme 3 points',
    label: 'Important',
    level: 'important',
    value: 3,
  },
  {
    description: 'Compte comme 5 points',
    label: 'Décisif',
    level: 'decisive',
    value: 5,
  },
] as const satisfies ReadonlyArray<{
  description: string;
  label: string;
  level: ArgumentWeightLevel;
  value: ArgumentWeight;
}>;

/**
 * Ramène les anciennes valeurs 1 à 5 vers les trois niveaux visibles.
 * Une importance absente ou invalide devient « Important ».
 */
export function normalizeArgumentWeight(value: unknown): ArgumentWeight {
  if (value === 1 || value === 2) {
    return 1;
  }

  if (value === 4 || value === 5) {
    return 5;
  }

  return DEFAULT_ARGUMENT_WEIGHT;
}

export function getArgumentWeightOption(value: unknown) {
  const normalizedWeight = normalizeArgumentWeight(value);

  return (
    argumentWeightOptions.find(
      (option) => option.value === normalizedWeight,
    ) ?? argumentWeightOptions[1]
  );
}

export function getArgumentWeightLabel(value: unknown) {
  return getArgumentWeightOption(value).label;
}
