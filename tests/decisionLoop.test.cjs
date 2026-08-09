const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const projectRoot = path.join(__dirname, '..');

function loadTypeScriptModule(relativePath, overrides = {}, cache = new Map()) {
  const sourcePath = path.resolve(projectRoot, relativePath);

  if (cache.has(sourcePath)) {
    return cache.get(sourcePath).exports;
  }

  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: sourcePath,
  }).outputText;
  const loadedModule = { exports: {} };
  cache.set(sourcePath, loadedModule);

  function localRequire(request) {
    if (Object.prototype.hasOwnProperty.call(overrides, request)) {
      return overrides[request];
    }

    if (!request.startsWith('.')) {
      return require(request);
    }

    const resolvedPath = path.resolve(path.dirname(sourcePath), request);
    const typeScriptPath = resolvedPath.endsWith('.ts')
      ? resolvedPath
      : `${resolvedPath}.ts`;

    return loadTypeScriptModule(
      path.relative(projectRoot, typeScriptPath),
      overrides,
      cache,
    );
  }

  new Function('exports', 'module', 'require', compiled)(
    loadedModule.exports,
    loadedModule,
    localRequire,
  );

  return loadedModule.exports;
}

const lifecycle = loadTypeScriptModule('src/utils/decisionLifecycle.ts');
const followUpDate = loadTypeScriptModule('src/utils/followUpDate.ts');
const statistics = loadTypeScriptModule('src/services/statisticsService.ts');

function createDecision(status = 'acted', format = 'evaluate') {
  return {
    actedAt: '2026-08-09T10:00:00.000Z',
    chosenOption: format === 'compare' ? 'Option A' : 'Oui — avancer',
    cons: [],
    createdAt: '2026-08-09T09:00:00.000Z',
    format,
    id: `decision-${format}`,
    options:
      format === 'compare'
        ? { optionA: 'Option A', optionB: 'Option B' }
        : undefined,
    pros: [],
    status,
    title: 'Tester la boucle complète',
    updatedAt: '2026-08-09T10:00:00.000Z',
  };
}

test('Pas maintenant conserve acted et actedAt sans trackingDate', () => {
  const decision = {
    ...createDecision('acted'),
    trackingDate: '2026-09-09T12:00:00.000Z',
  };
  const result = lifecycle.removeDecisionFollowUp(
    decision,
    new Date('2026-08-09T11:00:00.000Z'),
  );

  assert.equal(result.status, 'acted');
  assert.equal(result.trackingDate, undefined);
  assert.equal(result.actedAt, decision.actedAt);
  assert.equal(result.chosenOption, decision.chosenOption);
});

test('une semaine crée un suivi à sept jours et conserve l’acte', () => {
  const from = new Date(2026, 7, 9, 10, 0);
  const trackingDate = followUpDate.resolveCalendarOffsetDate(from, {
    weeks: 1,
  });
  const result = lifecycle.scheduleDecisionFollowUp(
    createDecision('acted'),
    trackingDate,
    from,
  );

  assert.equal(result.status, 'tracking');
  assert.equal(result.trackingDate, trackingDate);
  assert.equal(result.actedAt, '2026-08-09T10:00:00.000Z');
  assert.deepEqual(followUpDate.parseTrackingDate(trackingDate), {
    day: 16,
    month: 7,
    year: 2026,
  });
});

test('un suivi peut être modifié puis entièrement retiré', () => {
  const initial = {
    ...createDecision('tracking'),
    trackingDate: '2026-09-09T12:00:00.000Z',
  };
  const modified = lifecycle.scheduleDecisionFollowUp(
    initial,
    '2026-11-09T12:00:00.000Z',
    new Date('2026-08-10T10:00:00.000Z'),
  );
  const removed = lifecycle.removeDecisionFollowUp(
    modified,
    new Date('2026-08-11T10:00:00.000Z'),
  );

  assert.equal(modified.status, 'tracking');
  assert.equal(modified.trackingDate, '2026-11-09T12:00:00.000Z');
  assert.equal(modified.actedAt, initial.actedAt);
  assert.equal(removed.status, 'acted');
  assert.equal(removed.trackingDate, undefined);
  assert.equal(removed.actedAt, initial.actedAt);
});

test('les deux formats suivent exactement le même cycle métier', () => {
  for (const format of ['evaluate', 'compare']) {
    const decision = createDecision('acted', format);
    const tracking = lifecycle.scheduleDecisionFollowUp(
      decision,
      '2026-09-09T12:00:00.000Z',
    );
    const completed = lifecycle.completeDecisionFromReview(
      tracking,
      5,
      'Un apprentissage',
      new Date('2026-09-10T12:00:00.000Z'),
    );

    assert.equal(completed.format, format);
    assert.equal(completed.status, 'completed');
    assert.equal(completed.chosenOption, decision.chosenOption);
    assert.equal(completed.actedAt, decision.actedAt);
  }
});

test('les trois niveaux de satisfaction et la note sont enregistrés', () => {
  for (const satisfaction of [1, 3, 5]) {
    const result = lifecycle.completeDecisionFromReview(
      createDecision('acted'),
      satisfaction,
      '  Ce que je retiens  ',
      new Date('2026-09-10T12:00:00.000Z'),
    );

    assert.equal(result.status, 'completed');
    assert.equal(result.satisfaction, satisfaction);
    assert.equal(result.reviewNote, 'Ce que je retiens');
    assert.equal(result.completedAt, '2026-09-10T12:00:00.000Z');
    assert.equal(result.actedAt, '2026-08-09T10:00:00.000Z');
  }
});

test('une ancienne décision reste normalisée sans champs récents', () => {
  const asyncStorage = {
    getItem: async () => null,
    setItem: async () => undefined,
  };
  const decisionStorage = loadTypeScriptModule(
    'src/storage/decisionStorage.ts',
    {
      '@react-native-async-storage/async-storage': {
        default: asyncStorage,
      },
    },
  );
  const legacyDecision = {
    cons: [],
    createdAt: '2025-01-01T10:00:00.000Z',
    id: 'legacy-decision',
    pros: [],
    status: 'acted',
    title: 'Ancienne décision',
    updatedAt: '2025-01-02T10:00:00.000Z',
  };
  const normalized = decisionStorage.normalizeStoredDecision(legacyDecision);

  assert.equal(normalized.id, legacyDecision.id);
  assert.equal(normalized.format, 'evaluate');
  assert.equal(normalized.status, 'acted');
  assert.equal(normalized.actedAt, legacyDecision.updatedAt);
  assert.equal(normalized.trackingDate, undefined);
  assert.equal(normalized.completedAt, undefined);
  assert.equal(normalized.reviewNote, undefined);
  assert.equal(normalized.satisfaction, undefined);
});

test('une ancienne décision tracking sans date redevient acted', () => {
  const decisionStorage = loadTypeScriptModule(
    'src/storage/decisionStorage.ts',
    {
      '@react-native-async-storage/async-storage': {
        default: {
          getItem: async () => null,
          setItem: async () => undefined,
        },
      },
    },
  );
  const normalized = decisionStorage.normalizeStoredDecision({
    ...createDecision('tracking'),
    trackingDate: undefined,
  });

  assert.equal(normalized.status, 'acted');
  assert.equal(normalized.trackingDate, undefined);
});

test('une échéance future est ignorée et une échéance arrivée est détectée', () => {
  let storedDecisions = [];
  let storedNotifications = [];
  const followUpService = loadTypeScriptModule(
    'src/services/followUpService.ts',
    {
      '../storage/decisionStorage': {
        getDecisions: async () => [...storedDecisions],
      },
      '../storage/notificationStorage': {
        addNotifications: async (notifications) => {
          storedNotifications.push(...notifications);
        },
        getNotifications: async () => [...storedNotifications],
      },
    },
  );
  const now = new Date('2026-09-10T12:00:00.000Z');
  const past = {
    ...createDecision('tracking'),
    id: 'past-due',
    trackingDate: '2026-09-10T08:00:00.000Z',
  };
  const future = {
    ...createDecision('tracking'),
    id: 'future-due',
    trackingDate: '2026-09-11T08:00:00.000Z',
  };
  storedDecisions = [future, past];

  assert.deepEqual(
    followUpService.findDueFollowUps(storedDecisions, now).map(({ id }) => id),
    ['past-due'],
  );
});

test('le rappel arrivé est persistant et n’est créé qu’une fois', async () => {
  let storedDecisions = [
    {
      ...createDecision('tracking'),
      id: 'persistent-due',
      trackingDate: '2026-09-10T08:00:00.000Z',
    },
  ];
  let storedNotifications = [];
  const followUpService = loadTypeScriptModule(
    'src/services/followUpService.ts',
    {
      '../storage/decisionStorage': {
        getDecisions: async () => [...storedDecisions],
      },
      '../storage/notificationStorage': {
        addNotifications: async (notifications) => {
          storedNotifications.push(...notifications);
        },
        getNotifications: async () => [...storedNotifications],
      },
    },
  );
  const now = new Date('2026-09-10T12:00:00.000Z');

  const firstLaunch = await followUpService.syncDueFollowUpNotifications(now);
  const secondLaunch = await followUpService.syncDueFollowUpNotifications(now);

  assert.equal(storedNotifications.length, 1);
  assert.equal(firstLaunch.length, 1);
  assert.equal(secondLaunch.length, 1);
  assert.equal(firstLaunch[0].type, 'decision_followup_due');
  assert.equal(firstLaunch[0].title, 'Il est temps de faire le point');
  assert.equal(firstLaunch[0].relatedDecisionId, 'persistent-due');
  assert.equal(firstLaunch[0].action.type, 'review-decision');
  assert.equal(firstLaunch[0].action.label, 'Faire le bilan');
});

test('une date modifiée rend l’ancien rappel obsolète', async () => {
  const decision = {
    ...createDecision('tracking'),
    id: 'modified-date',
    trackingDate: '2026-10-10T08:00:00.000Z',
  };
  let storedNotifications = [
    {
      action: {
        label: 'Faire le bilan',
        relatedDecisionId: decision.id,
        type: 'review-decision',
      },
      createdAt: '2026-09-10T08:00:00.000Z',
      dedupeKey: `decision_followup_due:${decision.id}:2026-09-10T08:00:00.000Z`,
      id: 1,
      message: 'Ancienne échéance',
      read: false,
      relatedDecisionId: decision.id,
      title: 'Ancien rappel',
      type: 'decision_followup_due',
    },
  ];
  const followUpService = loadTypeScriptModule(
    'src/services/followUpService.ts',
    {
      '../storage/decisionStorage': {
        getDecisions: async () => [decision],
      },
      '../storage/notificationStorage': {
        addNotifications: async (notifications) => {
          storedNotifications.push(...notifications);
        },
        getNotifications: async () => [...storedNotifications],
      },
    },
  );
  const visibleNotifications =
    await followUpService.syncDueFollowUpNotifications(
      new Date('2026-09-10T12:00:00.000Z'),
    );

  assert.deepEqual(visibleNotifications, []);
  assert.equal(storedNotifications.length, 1);
});

test('les statistiques utilisent les décisions stockées sans valeur simulée', () => {
  const acted = { ...createDecision('acted'), id: 'acted' };
  const tracking = {
    ...createDecision('tracking'),
    id: 'tracking',
    trackingDate: '2026-09-10T08:00:00.000Z',
  };
  const completed = {
    ...createDecision('completed'),
    completedAt: '2026-09-11T08:00:00.000Z',
    id: 'completed',
    satisfaction: 5,
  };
  const archived = {
    ...createDecision('archived'),
    archivedFromStatus: 'completed',
    id: 'archived',
    satisfaction: 3,
  };
  const result = statistics.calculateDecisionStatistics([
    acted,
    tracking,
    completed,
    archived,
  ]);

  assert.equal(result.decisionsCreated, 4);
  assert.equal(result.decisionsActed, 4);
  assert.equal(result.decisionsTracking, 1);
  assert.equal(result.decisionsReviewed, 2);
  assert.equal(result.decisionsCompleted, 2);
  assert.equal(result.decisionsArchived, 1);
});

test('les contrats de navigation, Safe Area et clavier restent présents', () => {
  const commitment = fs.readFileSync(
    path.join(projectRoot, 'src/screens/DecisionCommitmentScreen.tsx'),
    'utf8',
  );
  const notificationHost = fs.readFileSync(
    path.join(projectRoot, 'src/components/FollowUpNotificationHost.tsx'),
    'utf8',
  );
  const notification = fs.readFileSync(
    path.join(projectRoot, 'src/components/InAppNotification.tsx'),
    'utf8',
  );
  const review = fs.readFileSync(
    path.join(projectRoot, 'src/screens/DecisionReviewScreen.tsx'),
    'utf8',
  );
  const journey = fs.readFileSync(
    path.join(projectRoot, 'src/services/journeyService.ts'),
    'utf8',
  );

  assert.match(commitment, /navigation\.reset\(/);
  assert.match(commitment, /name: 'DecisionFollowUp'/);
  assert.match(notificationHost, /AppState\.addEventListener/);
  assert.match(notificationHost, /navigate\('DecisionReview'/);
  assert.match(notification, /useSafeAreaInsets\(\)/);
  assert.match(review, /KeyboardAvoidingView/);
  assert.match(review, /screen: 'DecisionList'/);
  assert.match(review, /filter: 'completed'/);
  assert.match(journey, /title: 'Première décision terminée'/);
  assert.match(journey, /metric: 'decisionsCompleted'/);
});
