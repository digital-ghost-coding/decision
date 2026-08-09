const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadTypeScriptModule(relativePath) {
  const sourcePath = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: sourcePath,
  }).outputText;
  const loadedModule = { exports: {} };

  new Function('exports', 'module', 'require', compiled)(
    loadedModule.exports,
    loadedModule,
    require,
  );

  return loadedModule.exports;
}

const followUpDate = loadTypeScriptModule('src/utils/followUpDate.ts');
const decisionLifecycle = loadTypeScriptModule(
  'src/utils/decisionLifecycle.ts',
);

const {
  areSameLocalCalendarDate,
  getCalendarMonthGrid,
  isFutureLocalCalendarDate,
  parseTrackingDate,
  resolveCalendarOffsetDate,
  serializeLocalCalendarDate,
  shiftCalendarMonth,
} = followUpDate;
const {
  completeDecisionFromReview,
  removeDecisionFollowUp,
  scheduleDecisionFollowUp,
} = decisionLifecycle;

function createDecision(status) {
  return {
    actedAt: '2026-08-01T10:00:00.000Z',
    chosenOption: 'Avancer',
    cons: [],
    createdAt: '2026-08-01T09:00:00.000Z',
    format: 'evaluate',
    id: 'decision-1',
    pros: [],
    status,
    title: 'Tester la boucle',
    updatedAt: '2026-08-01T10:00:00.000Z',
  };
}

test('aujourd’hui et les dates passées sont refusés', () => {
  const now = new Date(2026, 7, 9, 9, 30);

  assert.equal(
    isFutureLocalCalendarDate({ day: 9, month: 7, year: 2026 }, now),
    false,
  );
  assert.equal(
    isFutureLocalCalendarDate({ day: 8, month: 7, year: 2026 }, now),
    false,
  );
});

test('demain est accepté', () => {
  const now = new Date(2026, 7, 9, 23, 59);

  assert.equal(
    isFutureLocalCalendarDate({ day: 10, month: 7, year: 2026 }, now),
    true,
  );
});

test('une date locale garde le même jour après sérialisation ISO', () => {
  const selectedDate = { day: 31, month: 11, year: 2026 };
  const storedValue = serializeLocalCalendarDate(selectedDate);

  assert.equal(
    areSameLocalCalendarDate(parseTrackingDate(storedValue), selectedDate),
    true,
  );
});

test('un mois ajouté à une fin de mois est borné au dernier jour disponible', () => {
  const result = resolveCalendarOffsetDate(
    new Date(2024, 0, 31, 10, 0),
    { months: 1 },
  );

  assert.deepEqual(parseTrackingDate(result), {
    day: 29,
    month: 1,
    year: 2024,
  });
});

test('les quatre raccourcis produisent les échéances attendues', () => {
  const from = new Date(2026, 7, 9, 10, 0);
  const expectations = [
    [{ weeks: 1 }, { day: 16, month: 7, year: 2026 }],
    [{ months: 1 }, { day: 9, month: 8, year: 2026 }],
    [{ months: 3 }, { day: 9, month: 10, year: 2026 }],
    [{ months: 6 }, { day: 9, month: 1, year: 2027 }],
  ];

  for (const [offset, expectedDate] of expectations) {
    assert.deepEqual(
      parseTrackingDate(resolveCalendarOffsetDate(from, offset)),
      expectedDate,
    );
  }
});

test('le passage décembre vers janvier change correctement d’année', () => {
  assert.deepEqual(shiftCalendarMonth({ month: 11, year: 2026 }, 1), {
    month: 0,
    year: 2027,
  });
});

test('la grille mensuelle couvre chaque jour une seule fois', () => {
  const dates = getCalendarMonthGrid({ month: 7, year: 2026 }).filter(Boolean);

  assert.equal(dates.length, 31);
  assert.equal(dates[0].day, 1);
  assert.equal(dates.at(-1).day, 31);
});

test('une date impossible ne peut pas être validée', () => {
  assert.equal(
    isFutureLocalCalendarDate(
      { day: 31, month: 1, year: 2027 },
      new Date(2026, 7, 9),
    ),
    false,
  );
});

test('le bilan est le chemin qui renseigne completed et ses apprentissages', () => {
  const completedOn = new Date('2026-09-10T12:00:00.000Z');
  const result = completeDecisionFromReview(
    createDecision('tracking'),
    5,
    '  À retenir  ',
    completedOn,
  );

  assert.equal(result.status, 'completed');
  assert.equal(result.satisfaction, 5);
  assert.equal(result.reviewNote, 'À retenir');
  assert.equal(result.completedAt, completedOn.toISOString());
});

test('une ancienne décision terminée conserve sa date en ajoutant un bilan', () => {
  const legacyCompletedAt = '2026-08-02T12:00:00.000Z';
  const result = completeDecisionFromReview(
    { ...createDecision('completed'), completedAt: legacyCompletedAt },
    3,
    '',
    new Date('2026-09-10T12:00:00.000Z'),
  );

  assert.equal(result.status, 'completed');
  assert.equal(result.completedAt, legacyCompletedAt);
  assert.equal(result.satisfaction, 3);
  assert.equal(result.reviewNote, undefined);
});

test('une réflexion ne peut pas être terminée par le bilan', () => {
  assert.throws(
    () => completeDecisionFromReview(createDecision('reflecting'), 5),
    /Bilan impossible/,
  );
});

test('Pas maintenant conserve l’acte et supprime toute échéance', () => {
  const decision = {
    ...createDecision('acted'),
    trackingDate: undefined,
  };
  const result = removeDecisionFollowUp(
    decision,
    new Date('2026-08-09T12:00:00.000Z'),
  );

  assert.equal(result.status, 'acted');
  assert.equal(result.trackingDate, undefined);
  assert.equal(result.actedAt, decision.actedAt);
  assert.equal(result.chosenOption, decision.chosenOption);
});

test('planifier un suivi passe acted à tracking sans perdre le choix', () => {
  const decision = createDecision('acted');
  const trackingDate = '2026-09-09T10:00:00.000Z';
  const result = scheduleDecisionFollowUp(
    decision,
    trackingDate,
    new Date('2026-08-09T12:00:00.000Z'),
  );

  assert.equal(result.status, 'tracking');
  assert.equal(result.trackingDate, trackingDate);
  assert.equal(result.actedAt, decision.actedAt);
  assert.equal(result.chosenOption, decision.chosenOption);
});

test('modifier un suivi remplace uniquement son échéance métier', () => {
  const decision = {
    ...createDecision('tracking'),
    trackingDate: '2026-09-09T10:00:00.000Z',
  };
  const nextTrackingDate = '2026-11-09T10:00:00.000Z';
  const result = scheduleDecisionFollowUp(
    decision,
    nextTrackingDate,
    new Date('2026-08-09T12:00:00.000Z'),
  );

  assert.equal(result.status, 'tracking');
  assert.equal(result.trackingDate, nextTrackingDate);
  assert.equal(result.actedAt, decision.actedAt);
});

test('supprimer un suivi revient à acted sans supprimer la décision', () => {
  const decision = {
    ...createDecision('tracking'),
    trackingDate: '2026-09-09T10:00:00.000Z',
  };
  const result = removeDecisionFollowUp(
    decision,
    new Date('2026-08-09T12:00:00.000Z'),
  );

  assert.equal(result.id, decision.id);
  assert.equal(result.status, 'acted');
  assert.equal(result.trackingDate, undefined);
  assert.equal(result.actedAt, decision.actedAt);
  assert.equal(result.chosenOption, decision.chosenOption);
});
