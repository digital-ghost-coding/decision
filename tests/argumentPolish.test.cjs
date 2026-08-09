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
  normalizeArgumentWeight,
} = loadTypeScriptModule('src/constants/argumentWeights.ts');
const { calculateDecisionScore } = loadTypeScriptModule(
  'src/utils/calculateDecisionScore.ts',
);

test('le sélecteur standard mesure 50 points et garde des segments de 44 points', () => {
  const selector = read('src/components/ImportanceSelector.tsx');

  assert.match(selector, /minHeight: 50/);
  assert.match(selector, /minHeight: layout\.touchTarget/);
  assert.match(selector, /paddingVertical: 0/);
});

test('les trois niveaux et leurs poids métier restent inchangés', () => {
  assert.equal(DEFAULT_ARGUMENT_WEIGHT, 3);
  assert.deepEqual(
    argumentWeightOptions.map(({ value }) => value),
    [1, 3, 5],
  );
  assert.deepEqual(
    [1, 2, 3, 4, 5].map(normalizeArgumentWeight),
    [1, 1, 3, 5, 5],
  );
});

test('la carte d’argument grandit avec son contenu sans hauteur minimale', () => {
  const section = read('src/components/ArgumentSection.tsx');
  const cardStyle = section.match(
    /argumentCard: \{([\s\S]*?)\n  \},\n  argumentContent:/,
  );

  assert.ok(cardStyle);
  assert.doesNotMatch(cardStyle[1], /minHeight/);
  assert.match(cardStyle[1], /alignItems: 'flex-start'/);
  assert.match(cardStyle[1], /paddingVertical: spacing\.sm/);
});

test('le badge reste directement sous le texte de chaque argument', () => {
  const section = read('src/components/ArgumentSection.tsx');

  assert.match(
    section,
    /styles\.argumentText[\s\S]*styles\.weightBadge[\s\S]*getArgumentWeightLabel/,
  );
  assert.match(section, /backgroundColor: colors\.primarySoft/);
  assert.match(section, /borderRadius: radii\.pill/);
});

test('Modifier et Supprimer sont deux boutons d’icône regroupés', () => {
  const section = read('src/components/ArgumentSection.tsx');

  assert.match(section, /icon="edit"/);
  assert.match(section, /icon="delete"/);
  assert.match(section, /label="Modifier cet argument"/);
  assert.match(section, /label="Supprimer cet argument"/);
  assert.match(
    section,
    /argumentActions: \{[\s\S]*flexDirection: 'row'/,
  );
});

test('les boutons d’icône ont une zone 44 × 44, un focus et une infobulle Web', () => {
  const iconButton = read('src/components/IconButton.tsx');
  const pressable = read('src/components/AnimatedPressable.tsx');

  assert.match(iconButton, /width: layout\.touchTarget/);
  assert.match(iconButton, /height: layout\.touchTarget/);
  assert.match(iconButton, /title: label/);
  assert.match(iconButton, /destructivePressed/);
  assert.match(pressable, /outlineColor: colors\.focus/);
});

test('la modification inline charge, sauvegarde ou annule la bonne importance', () => {
  const section = read('src/components/ArgumentSection.tsx');

  assert.match(
    section,
    /setEditingWeight\(normalizeArgumentWeight\(argument\.weight\)\)/,
  );
  assert.match(section, /onUpdate\(editingId, normalizedText, editingWeight\)/);
  assert.match(
    section,
    /const cancelEditing = \(\) => \{[\s\S]*setEditingId\(null\)/,
  );
});

test('la frappe dans un argument ne redéclenche plus l’autoscroll', () => {
  const section = read('src/components/ArgumentSection.tsx');
  const screen = read('src/screens/DecisionArgumentsScreen.tsx');

  assert.doesNotMatch(section, /onContentSizeChange/);
  assert.doesNotMatch(screen, /revealTimeout/);
  assert.doesNotMatch(screen, /setTimeout\(reveal/);
  assert.match(screen, /onScrollBeginDrag=\{handleManualScroll\}/);
  assert.match(screen, /cancelAnimationFrame/);
});

test('la question laisse le scroll naturel prioritaire avec le clavier ouvert', () => {
  const screen = read('src/screens/NewDecisionScreen.tsx');

  assert.match(screen, /KeyboardAvoidingView/);
  assert.match(screen, /<ScrollView/);
  assert.match(screen, /keyboardShouldPersistTaps="handled"/);
  assert.match(screen, /onFocus=\{\(\) => setIsFocused\(true\)\}/);
  assert.doesNotMatch(screen, /scrollResponderScrollNativeHandleToKeyboard/);
  assert.doesNotMatch(screen, /requestAnimationFrame/);
  assert.doesNotMatch(screen, /cancelAnimationFrame/);
  assert.doesNotMatch(screen, /questionReveal/);
  assert.doesNotMatch(screen, /onScrollBeginDrag/);
  assert.doesNotMatch(screen, /keyboardDismissMode/);
  assert.match(screen, /height: 90/);
  assert.doesNotMatch(screen, /input: \{\s*minHeight: 90/);
});

test('le scroll contient les champs attendus dans les deux formats', () => {
  const screen = read('src/screens/NewDecisionScreen.tsx');
  const scrollView = screen.match(/<ScrollView[\s\S]*<\/ScrollView>/);

  assert.ok(scrollView);
  assert.match(scrollView[0], /accessibilityLabel="Évaluer une option"/);
  assert.match(scrollView[0], /accessibilityLabel="Comparer deux options"/);
  assert.match(scrollView[0], /format === 'compare' \? \(/);
  assert.match(scrollView[0], /accessibilityLabel="Nom de l’option A"/);
  assert.match(scrollView[0], /accessibilityLabel="Nom de l’option B"/);
});

test('le calcul pondéré conserve le même résultat', () => {
  const score = calculateDecisionScore({
    argumentModelVersion: 2,
    format: 'evaluate',
    pros: [
      { id: 'p1', side: 'pro', text: 'secondaire', weight: 1 },
      { id: 'p2', side: 'pro', text: 'décisif', weight: 5 },
    ],
    cons: [{ id: 'c1', side: 'con', text: 'important', weight: 3 }],
  });

  assert.equal(score.proWeight, 6);
  assert.equal(score.conWeight, 3);
  assert.equal(score.percentage, 67);
  assert.equal(score.trend, 'positive');
});
