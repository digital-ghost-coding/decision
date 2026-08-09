import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeArgumentWeight } from '../constants/argumentWeights';
import type {
  ActiveDecisionStatus,
  Argument,
  Decision,
  DecisionFormat,
  DecisionOptionKey,
  DecisionSatisfaction,
  DecisionStatus,
} from '../types/decision';
import {
  restoreArchivedDecision,
  transitionDecision,
} from '../utils/decisionLifecycle';

const DECISIONS_STORAGE_KEY = '@decisionly/decisions/v1';
const decisionStatuses: DecisionStatus[] = [
  'draft',
  'reflecting',
  'acted',
  'tracking',
  'completed',
  'cancelled',
  'archived',
];

function isDecisionStatus(value: unknown): value is DecisionStatus {
  return decisionStatuses.includes(value as DecisionStatus);
}

function isActiveDecisionStatus(value: unknown): value is ActiveDecisionStatus {
  return isDecisionStatus(value) && value !== 'archived';
}

function isArgument(value: unknown): value is Argument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const argument = value as Partial<Argument>;
  return (
    typeof argument.id === 'string' &&
    (argument.side === 'pro' || argument.side === 'con') &&
    typeof argument.text === 'string' &&
    (argument.optionKey === undefined ||
      argument.optionKey === 'optionA' ||
      argument.optionKey === 'optionB') &&
    (argument.weight === undefined ||
      [1, 2, 3, 4, 5].includes(argument.weight))
  );
}

function normalizeArgument(
  argument: Argument,
  format: DecisionFormat,
  optionKey: DecisionOptionKey,
  legacyComparison: boolean,
): Argument {
  return {
    ...argument,
    optionKey:
      format === 'compare'
        ? legacyComparison
          ? optionKey
          : argument.optionKey ?? optionKey
        : undefined,
    side:
      format === 'compare' && legacyComparison
        ? 'pro'
        : argument.side,
    weight: normalizeArgumentWeight(argument.weight),
  };
}

function normalizeOptionalDate(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? value
    : undefined;
}

function isDecisionSatisfaction(
  value: unknown,
): value is DecisionSatisfaction {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export function normalizeStoredDecision(value: unknown): Decision | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const decision = value as Partial<Decision>;
  if (
    typeof decision.id !== 'string' ||
    typeof decision.title !== 'string' ||
    typeof decision.createdAt !== 'string' ||
    !isDecisionStatus(decision.status) ||
    !Array.isArray(decision.pros) ||
    !decision.pros.every(isArgument) ||
    !Array.isArray(decision.cons) ||
    !decision.cons.every(isArgument)
  ) {
    return null;
  }

  const trackingDate = normalizeOptionalDate(decision.trackingDate);
  const storedArchivedFromStatus =
    decision.status === 'archived' &&
    isActiveDecisionStatus(decision.archivedFromStatus)
      ? decision.archivedFromStatus
      : undefined;
  const archivedFromStatus =
    storedArchivedFromStatus === 'tracking' && !trackingDate
      ? 'acted'
      : storedArchivedFromStatus;
  const status =
    decision.status === 'tracking' && !trackingDate
      ? 'acted'
      : decision.status;

  const options =
    decision.options &&
    typeof decision.options === 'object' &&
    typeof decision.options.optionA === 'string' &&
    decision.options.optionA.trim().length > 0 &&
    typeof decision.options.optionB === 'string' &&
    decision.options.optionB.trim().length > 0
      ? {
          optionA: decision.options.optionA.trim(),
          optionB: decision.options.optionB.trim(),
        }
      : undefined;
  const format: DecisionFormat =
    decision.format === 'compare' && options
      ? 'compare'
      : options
        ? 'compare'
        : 'evaluate';
  const legacyComparison =
    format === 'compare' && decision.argumentModelVersion !== 2;



return {
  id: decision.id,
  format,
  argumentModelVersion: 2,
  title: decision.title,
  options,
  chosenOption:
    typeof decision.chosenOption === 'string' &&
    decision.chosenOption.trim().length > 0
      ? decision.chosenOption.trim()
      : undefined,
  pros: decision.pros.map((argument) =>
    normalizeArgument(argument, format, 'optionA', legacyComparison),
  ),
  cons: decision.cons.map((argument) =>
    normalizeArgument(argument, format, 'optionB', legacyComparison),
  ),
    createdAt: decision.createdAt,
    updatedAt:
      typeof decision.updatedAt === 'string'
        ? decision.updatedAt
        : decision.createdAt,
    status,
    actedAt:
      normalizeOptionalDate(decision.actedAt) ??
      (['acted', 'tracking', 'completed'].includes(status) ||
      (status === 'archived' &&
        ['acted', 'tracking', 'completed'].includes(
          archivedFromStatus ?? '',
        ))
        ? typeof decision.updatedAt === 'string'
          ? decision.updatedAt
          : decision.createdAt
        : undefined),
    trackingDate,
    completedAt:
      normalizeOptionalDate(decision.completedAt) ??
      (status === 'completed' ||
      (status === 'archived' && archivedFromStatus === 'completed')
        ? typeof decision.updatedAt === 'string'
          ? decision.updatedAt
          : decision.createdAt
        : undefined),
    reviewNote:
      typeof decision.reviewNote === 'string'
        ? decision.reviewNote
        : undefined,
    satisfaction: isDecisionSatisfaction(decision.satisfaction)
      ? decision.satisfaction
      : undefined,
    archivedFromStatus,
  };
}

function sortByMostRecent(decisions: Decision[]) {
  return [...decisions].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime(),
  );
}

export async function getDecisions(): Promise<Decision[]> {
  const storedValue = await AsyncStorage.getItem(DECISIONS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(storedValue);
  } catch {
    return [];
  }

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  const migratedDecisions = sortByMostRecent(
    parsedValue
      .map(normalizeStoredDecision)
      .filter((decision): decision is Decision => decision !== null),
  );

  // Migration progressive : les données historiques sont enrichies au
  // premier chargement sans changer de clé ni perdre leurs arguments.
  if (JSON.stringify(parsedValue) !== JSON.stringify(migratedDecisions)) {
    await AsyncStorage.setItem(
      DECISIONS_STORAGE_KEY,
      JSON.stringify(migratedDecisions),
    );
  }

  return migratedDecisions;
}

export async function getDecision(id: string): Promise<Decision | undefined> {
  const decisions = await getDecisions();
  return decisions.find((decision) => decision.id === id);
}

export async function saveDecision(decision: Decision): Promise<void> {
  const decisions = await getDecisions();
  const normalizedDecision = normalizeStoredDecision(decision);

  if (!normalizedDecision) {
    throw new Error('Décision invalide');
  }

  const existingIndex = decisions.findIndex(
    (storedDecision) => storedDecision.id === normalizedDecision.id,
  );
  const nextDecisions = [...decisions];

  if (existingIndex >= 0) {
    nextDecisions[existingIndex] = normalizedDecision;
  } else {
    nextDecisions.push(normalizedDecision);
  }

  await AsyncStorage.setItem(
    DECISIONS_STORAGE_KEY,
    JSON.stringify(sortByMostRecent(nextDecisions)),
  );
}

export async function getActiveDecisions(): Promise<Decision[]> {
  const decisions = await getDecisions();
  return decisions.filter((decision) => decision.status !== 'archived');
}

export async function getArchivedDecisions(): Promise<Decision[]> {
  const decisions = await getDecisions();
  return decisions.filter((decision) => decision.status === 'archived');
}

export async function archiveDecision(id: string): Promise<Decision> {
  const decisions = await getDecisions();
  const decision = decisions.find((item) => item.id === id);

  if (!decision) {
    throw new Error('Décision introuvable');
  }

  const archivedDecision = transitionDecision(decision, 'archived');
  await saveDecision(archivedDecision);
  return archivedDecision;
}

export async function restoreDecision(id: string): Promise<Decision> {
  const decisions = await getDecisions();
  const decision = decisions.find((item) => item.id === id);

  if (!decision) {
    throw new Error('Décision introuvable');
  }

  const restoredDecision = restoreArchivedDecision(decision);
  await saveDecision(restoredDecision);
  return restoredDecision;
}

export async function deleteDecision(id: string): Promise<void> {
  const decisions = await getDecisions();
  const nextDecisions = decisions.filter((decision) => decision.id !== id);

  await AsyncStorage.setItem(
    DECISIONS_STORAGE_KEY,
    JSON.stringify(sortByMostRecent(nextDecisions)),
  );
}
