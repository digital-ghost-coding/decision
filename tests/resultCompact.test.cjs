const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const projectRoot = path.join(__dirname, '..');
const moduleCache = new Map();

function loadTypeScriptModule(relativePath) {
  const sourcePath = path.resolve(projectRoot, relativePath);

  if (moduleCache.has(sourcePath)) {
    return moduleCache.get(sourcePath).exports;
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
  moduleCache.set(sourcePath, loadedModule);

  function localRequire(request) {
    if (!request.startsWith('.')) {
      return require(request);
    }

    const resolvedPath = path.resolve(path.dirname(sourcePath), request);
    const typeScriptPath = resolvedPath.endsWith('.ts')
      ? resolvedPath
      : `${resolvedPath}.ts`;

    return loadTypeScriptModule(path.relative(projectRoot, typeScriptPath));
  }

  new Function('exports', 'module', 'require', compiled)(
    loadedModule.exports,
    loadedModule,
    localRequire,
  );

  return loadedModule.exports;
}

const { calculateDecisionScore } = loadTypeScriptModule(
  'src/utils/calculateDecisionScore.ts',
);
const { advanceCommitProgress, COMMIT_HOLD_DURATION_MS } =
  loadTypeScriptModule('src/interactions/commitAnimation.ts');
const { COMMIT_CIRCLE_SIZES, getCommitCircleSize } = loadTypeScriptModule(
  'src/utils/commitCircleSize.ts',
);

function argument(id, optionKey, side, weight = 3) {
  return {
    id,
    optionKey,
    side,
    text: `${side} ${optionKey} ${id}`,
    weight,
  };
}

function compareScore(argumentsList) {
  return calculateDecisionScore({
    argumentModelVersion: 2,
    cons: argumentsList.filter((item) => item.side === 'con'),
    format: 'compare',
    options: { optionA: 'Option A', optionB: 'Option B' },
    pros: argumentsList.filter((item) => item.side === 'pro'),
  });
}

function evaluationScore(pros, cons) {
  return calculateDecisionScore({
    cons,
    format: 'evaluate',
    pros,
  });
}

test('Option A peut être en tête favorable', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'pro', 5),
    argument('b1', 'optionB', 'pro', 1),
  ]);

  assert.equal(score.comparison.result, 'optionA');
  assert.equal(score.comparison.optionA.balance, 5);
  assert.equal(score.trend, 'positive');
});

test('Option B peut être en tête favorable', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'pro', 1),
    argument('b1', 'optionB', 'pro', 5),
  ]);

  assert.equal(score.comparison.result, 'optionB');
  assert.equal(score.comparison.optionB.balance, 5);
  assert.equal(score.trend, 'positive');
});

test('Option A peut être en tête avec vigilance', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'con', 1),
    argument('b1', 'optionB', 'con', 5),
  ]);

  assert.equal(score.comparison.result, 'optionA');
  assert.equal(score.comparison.optionA.balance, -1);
  assert.equal(score.trend, 'neutral');
});

test('Option B peut être en tête avec vigilance', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'con', 5),
    argument('b1', 'optionB', 'con', 1),
  ]);

  assert.equal(score.comparison.result, 'optionB');
  assert.equal(score.comparison.optionB.balance, -1);
  assert.equal(score.trend, 'neutral');
});

test('une égalité positive reste une tendance partagée', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'pro'),
    argument('b1', 'optionB', 'pro'),
  ]);

  assert.equal(score.comparison.result, 'tie');
  assert.equal(score.comparison.optionA.balance, 3);
  assert.equal(score.percentage, 50);
});

test('une égalité négative signale les vigilances', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'con'),
    argument('b1', 'optionB', 'con'),
  ]);

  assert.equal(score.comparison.result, 'tie');
  assert.equal(score.comparison.optionA.balance, -3);
  assert.match(score.message, /vigilance/i);
});

test('les comptes restent exacts lorsqu’une option n’a aucun atout ou frein', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'con'),
    argument('b1', 'optionB', 'pro'),
  ]);

  assert.equal(score.comparison.optionA.proCount, 0);
  assert.equal(score.comparison.optionA.conCount, 1);
  assert.equal(score.comparison.optionB.proCount, 1);
  assert.equal(score.comparison.optionB.conCount, 0);
});

test('plusieurs éléments décisifs conservent leur poids cumulé', () => {
  const score = compareScore([
    argument('a1', 'optionA', 'pro', 5),
    argument('a2', 'optionA', 'pro', 5),
    argument('b1', 'optionB', 'pro', 3),
  ]);

  assert.equal(score.comparison.optionA.proCount, 2);
  assert.equal(score.comparison.optionA.proWeight, 10);
  assert.equal(score.comparison.optionA.balance, 10);
});

test('le résultat simple couvre les tendances favorable, défavorable et neutre', () => {
  const positive = evaluationScore([argument('p1', undefined, 'pro', 5)], []);
  const negative = evaluationScore([], [argument('c1', undefined, 'con', 5)]);
  const neutral = evaluationScore(
    [argument('p1', undefined, 'pro', 3)],
    [argument('c1', undefined, 'con', 3)],
  );

  assert.equal(positive.trend, 'positive');
  assert.equal(negative.trend, 'negative');
  assert.equal(neutral.trend, 'neutral');
});

test('les trois tailles du cercle suivent les hauteurs cibles', () => {
  assert.equal(getCommitCircleSize(667), COMMIT_CIRCLE_SIZES.compact);
  assert.equal(getCommitCircleSize(700), COMMIT_CIRCLE_SIZES.compact);
  assert.equal(getCommitCircleSize(844), COMMIT_CIRCLE_SIZES.regular);
  assert.equal(getCommitCircleSize(850), COMMIT_CIRCLE_SIZES.regular);
  assert.equal(getCommitCircleSize(932), COMMIT_CIRCLE_SIZES.spacious);
});

test('un maintien incomplet ne termine pas la progression', () => {
  assert.equal(advanceCommitProgress(0, 800, 'holding'), 0.4);
});

test('deux secondes de maintien terminent exactement la progression', () => {
  assert.equal(
    advanceCommitProgress(0, COMMIT_HOLD_DURATION_MS, 'holding'),
    1,
  );
});

test('le résultat ne contient ni choix par leader ni message de section vide', () => {
  const screenSource = fs.readFileSync(
    path.join(projectRoot, 'src/screens/DecisionResultScreen.tsx'),
    'utf8',
  );
  const cardSource = fs.readFileSync(
    path.join(projectRoot, 'src/components/ResultCard.tsx'),
    'utf8',
  );

  assert.doesNotMatch(screenSource, /leader|winner/i);
  assert.match(screenSource, /chosenOption \?\? null/);
  assert.match(screenSource, /disabled=\{!selectedChoice\}/);
  assert.match(cardSource, /accessibilityState=\{\{ expanded: detailsExpanded \}\}/);
  assert.doesNotMatch(cardSource, /Aucun (élément|atout|frein) important/);
});
