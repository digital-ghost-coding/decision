const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const projectRoot = path.join(__dirname, '..');
const moduleCache = new Map();

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function loadTypeScriptModule(relativePath) {
  const sourcePath = path.resolve(projectRoot, relativePath);

  if (moduleCache.has(sourcePath)) {
    return moduleCache.get(sourcePath).exports;
  }

  const compiled = ts.transpileModule(read(relativePath), {
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

const {
  DEFAULT_ARGUMENT_WEIGHT,
  argumentWeightOptions,
  getArgumentWeightLabel,
  normalizeArgumentWeight,
} = loadTypeScriptModule('src/constants/argumentWeights.ts');
const { calculateDecisionScore } = loadTypeScriptModule(
  'src/utils/calculateDecisionScore.ts',
);

test('les trois choix conservent exactement les valeurs métier 1, 3 et 5', () => {
  assert.deepEqual(
    argumentWeightOptions.map(({ label, value }) => ({ label, value })),
    [
      { label: 'Secondaire', value: 1 },
      { label: 'Important', value: 3 },
      { label: 'Décisif', value: 5 },
    ],
  );
  assert.equal(DEFAULT_ARGUMENT_WEIGHT, 3);
});

test('les anciennes valeurs restent compatibles et correctement affichées', () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5, undefined].map(normalizeArgumentWeight),
    [1, 1, 3, 5, 5, 3],
  );
  assert.deepEqual(
    [1, 2, 3, 4, 5].map(getArgumentWeightLabel),
    ['Secondaire', 'Secondaire', 'Important', 'Décisif', 'Décisif'],
  );
});

test('le calcul conserve les poids et soustrait toujours les freins', () => {
  const score = calculateDecisionScore({
    argumentModelVersion: 2,
    format: 'evaluate',
    pros: [
      { id: 'p1', side: 'pro', text: 'utile', weight: 1 },
      { id: 'p2', side: 'pro', text: 'fort', weight: 5 },
    ],
    cons: [{ id: 'c1', side: 'con', text: 'frein', weight: 3 }],
  });

  assert.equal(score.proWeight, 6);
  assert.equal(score.conWeight, 3);
  assert.equal(score.percentage, 67);
  assert.equal(score.trend, 'positive');
});

test('un seul sélecteur centralisé sert à l’ajout et à la modification', () => {
  const section = read('src/components/ArgumentSection.tsx');

  assert.equal((section.match(/<ImportanceSelector/g) ?? []).length, 2);
  assert.doesNotMatch(section, /function WeightSelector/);
});

test('un ajout utilise la valeur choisie puis revient à Important', () => {
  const section = read('src/components/ArgumentSection.tsx');

  assert.match(section, /onAdd\(normalizedValue, side, weight\)/);
  assert.match(
    section,
    /onAdd\(normalizedValue, side, weight\);[\s\S]*setWeight\(DEFAULT_ARGUMENT_WEIGHT\)/,
  );
});

test('la modification charge et enregistre l’importance existante', () => {
  const section = read('src/components/ArgumentSection.tsx');

  assert.match(
    section,
    /setEditingWeight\(normalizeArgumentWeight\(argument\.weight\)\)/,
  );
  assert.match(section, /onUpdate\(editingId, normalizedText, editingWeight\)/);
});

test('annuler une modification ne sauvegarde aucune nouvelle valeur', () => {
  const section = read('src/components/ArgumentSection.tsx');
  const cancelBody = section.match(
    /const cancelEditing = \(\) => \{([\s\S]*?)\n  \};/,
  );

  assert.ok(cancelBody);
  assert.doesNotMatch(cancelBody[1], /onUpdate/);
});

test('Pour, Contre et les quatre groupes Atouts/Freins partagent ArgumentSection', () => {
  const screen = read('src/screens/DecisionArgumentsScreen.tsx');

  assert.equal((screen.match(/<ArgumentSection/g) ?? []).length, 6);
  assert.match(screen, /title="Pour"/);
  assert.match(screen, /title="Contre"/);
  assert.equal((screen.match(/title="Atouts"/g) ?? []).length, 2);
  assert.equal((screen.match(/title="Freins"/g) ?? []).length, 2);
});

test('le contrôle expose le groupe, les radios et leur état accessible', () => {
  const selector = read('src/components/ImportanceSelector.tsx');

  assert.match(selector, /accessibilityRole="radiogroup"/);
  assert.match(selector, /accessibilityRole="radio"/);
  assert.match(selector, /checked: isSelected/);
  assert.match(selector, /non sélectionnée/);
});

test('les zones tactiles et les textes répondent aux contraintes responsive', () => {
  const selector = read('src/components/ImportanceSelector.tsx');

  assert.match(selector, /minHeight: layout\.touchTarget/);
  assert.match(selector, /flex: 1/);
  assert.match(selector, /numberOfLines=\{2\}/);
  assert.match(selector, /maxFontSizeMultiplier=\{1\.35\}/);
});

test('le clavier Web, le focus et les haptics utilisent les systèmes existants', () => {
  const selector = read('src/components/ImportanceSelector.tsx');
  const pressable = read('src/components/AnimatedPressable.tsx');
  const haptics = read('src/interactions/hapticFeedback.ts');

  assert.match(selector, /ArrowRight/);
  assert.match(selector, /ArrowLeft/);
  assert.match(selector, /hapticPatterns\.selection/);
  assert.match(pressable, /outlineColor: colors\.focus/);
  assert.match(haptics, /Platform\.OS === 'web'/);
});

test('la transition est courte, interrompable et respecte Reduce Motion', () => {
  const selector = read('src/components/ImportanceSelector.tsx');

  assert.match(selector, /motion\.duration\.fast/);
  assert.match(selector, /animation\.stop\(\)/);
  assert.match(selector, /useReducedMotion/);
  assert.match(selector, /if \(reduceMotion\)/);
});

test('le clavier et le CTA conservent les protections de scroll existantes', () => {
  const screen = read('src/screens/DecisionArgumentsScreen.tsx');

  assert.match(screen, /KeyboardAvoidingView/);
  assert.match(screen, /keyboardShouldPersistTaps="handled"/);
  assert.match(screen, /scrollResponderScrollNativeHandleToKeyboard/);
  assert.match(screen, /isKeyboardVisible && styles\.scrollContentWithKeyboard/);
  assert.match(screen, /!isKeyboardVisible \? \(/);
});
