import { memo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import {
  getArgumentWeightLabel,
  normalizeArgumentWeight,
} from '../constants/argumentWeights';
import { colors, motion, radii, shadows, spacing } from '../theme';
import type {
  Argument,
  Decision,
  DecisionOptionKey,
  DecisionOptionScore,
  DecisionScore,
} from '../types/decision';
import { AnimatedPressable } from './AnimatedPressable';
import { AppIcon } from './AppIcon';
import { FadeInView } from './FadeInView';
import { ScoreBar } from './ScoreBar';

export type ResultChoice = {
  label: string;
  value: string;
};

type Props = {
  choices: ResultChoice[];
  decision: Decision;
  onSelectChoice: (choice: string) => void;
  score: DecisionScore;
  selectedChoice: string | null;
};

type OptionState = 'behind' | 'leading' | 'tie';
type OptionTone = 'caution' | 'negative' | 'neutral' | 'positive';

type ComparisonOptionProps = {
  argumentsList: Argument[];
  choice: ResultChoice;
  onSelect: (choice: string) => void;
  optionKey: DecisionOptionKey;
  optionScore: DecisionOptionScore;
  selected: boolean;
  state: OptionState;
  tone: OptionTone;
};

function formatBalance(balance: number) {
  return balance > 0 ? `+${balance}` : String(balance).replace('-', '−');
}

function formatAccessibleBalance(balance: number) {
  if (balance > 0) {
    return `plus ${balance}`;
  }

  if (balance < 0) {
    return `moins ${Math.abs(balance)}`;
  }

  return 'zéro';
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function sortByImportance(items: Argument[]) {
  return [...items].sort(
    (first, second) =>
      normalizeArgumentWeight(second.weight) -
      normalizeArgumentWeight(first.weight),
  );
}

function getOptionArguments(
  argumentsList: Argument[],
  optionKey: DecisionOptionKey,
  side?: 'pro' | 'con',
) {
  return argumentsList.filter(
    (argument) =>
      argument.optionKey === optionKey &&
      (side === undefined || argument.side === side),
  );
}

function getStateLabel(state: OptionState, tone: OptionTone) {
  if (state === 'tie') {
    return tone === 'caution'
      ? 'Points de vigilance partagés'
      : 'Tendance partagée';
  }

  if (state === 'leading') {
    return tone === 'caution'
      ? 'En tête, avec vigilance'
      : 'En tête actuellement';
  }

  return tone === 'negative'
    ? 'Davantage de freins actuellement'
    : 'Balance plus basse actuellement';
}

function FeaturedArgument({ item }: { item?: Argument }) {
  if (!item) {
    return null;
  }

  const weightLabel = getArgumentWeightLabel(item.weight);

  return (
    <View style={styles.featuredArgument}>
      <Text
        style={[
          styles.featuredArgumentLabel,
          weightLabel === 'Décisif' && styles.decisiveLabel,
        ]}
      >
        {weightLabel} · {item.side === 'pro' ? 'Atout' : 'Frein'}
      </Text>
      <Text numberOfLines={2} style={styles.featuredArgumentText}>
        {item.text}
      </Text>
    </View>
  );
}

function ComparisonOption({
  argumentsList,
  choice,
  onSelect,
  optionKey,
  optionScore,
  selected,
  state,
  tone,
}: ComparisonOptionProps) {
  const optionArguments = getOptionArguments(argumentsList, optionKey);
  const featuredArgument = sortByImportance(optionArguments)[0];
  const stateLabel = getStateLabel(state, tone);
  const accessibilityLabel = `${choice.label}. ${stateLabel}. Balance ${formatAccessibleBalance(optionScore.balance)}. ${formatCount(optionScore.proCount, 'atout', 'atouts')}. ${formatCount(optionScore.conCount, 'frein', 'freins')}.`;

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      haptic="selection"
      onPress={() => onSelect(choice.value)}
      pressedStyle={styles.optionPressed}
      scaleTo={motion.subtlePressScale}
      style={[
        styles.option,
        selected && styles.optionSelected,
        Platform.OS === 'web' && styles.webButton,
      ]}
    >
      <View style={styles.optionTopRow}>
        <View style={styles.optionNameArea}>
          <Text style={styles.optionName}>{choice.label}</Text>
          <View
            style={[
              styles.stateBadge,
              tone === 'positive' && styles.positiveBadge,
              tone === 'caution' && styles.cautionBadge,
              tone === 'negative' && styles.negativeBadge,
              tone === 'neutral' && styles.neutralBadge,
            ]}
          >
            <Text
              style={[
                styles.stateLabel,
                tone === 'positive' && styles.positiveText,
                tone === 'caution' && styles.cautionText,
                tone === 'negative' && styles.negativeText,
              ]}
            >
              {stateLabel}
            </Text>
          </View>
        </View>

        <View style={styles.balanceArea}>
          <Text style={styles.balanceValue}>
            {formatBalance(optionScore.balance)}
          </Text>
          <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected ? (
              <AppIcon
                color={colors.white}
                name="check"
                size="xs"
                weight="medium"
              />
            ) : null}
          </View>
        </View>
      </View>

      <Text style={styles.countSummary}>
        {formatCount(optionScore.proCount, 'atout', 'atouts')} ·{' '}
        {formatCount(optionScore.conCount, 'frein', 'freins')}
      </Text>

      <FeaturedArgument item={featuredArgument} />
    </AnimatedPressable>
  );
}

function ArgumentDetailList({
  items,
  title,
}: {
  items: Argument[];
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.detailGroup}>
      <Text style={styles.detailGroupTitle}>{title}</Text>
      {sortByImportance(items).map((argument) => {
        const weightLabel = getArgumentWeightLabel(argument.weight);

        return (
          <View key={argument.id} style={styles.detailArgument}>
            <View style={styles.detailDot} />
            <View style={styles.detailArgumentContent}>
              <Text style={styles.detailArgumentText}>{argument.text}</Text>
              <Text
                style={[
                  styles.detailWeight,
                  weightLabel === 'Décisif' && styles.decisiveLabel,
                ]}
              >
                {weightLabel}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ComparisonDetails({
  argumentsList,
  choices,
}: {
  argumentsList: Argument[];
  choices: ResultChoice[];
}) {
  return (
    <FadeInView style={styles.details}>
      {choices.map((choice, index) => {
        const optionKey: DecisionOptionKey =
          index === 0 ? 'optionA' : 'optionB';
        const pros = getOptionArguments(argumentsList, optionKey, 'pro');
        const cons = getOptionArguments(argumentsList, optionKey, 'con');

        if (pros.length === 0 && cons.length === 0) {
          return null;
        }

        return (
          <View key={choice.value} style={styles.detailOption}>
            <Text style={styles.detailOptionName}>{choice.label}</Text>
            <ArgumentDetailList items={pros} title="Atouts" />
            <ArgumentDetailList items={cons} title="Freins" />
          </View>
        );
      })}
    </FadeInView>
  );
}

function ComparisonResult({
  choices,
  decision,
  onSelectChoice,
  score,
  selectedChoice,
}: Props) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const comparison = score.comparison;

  if (!comparison || !decision.options) {
    return null;
  }

  const argumentsList = [...decision.pros, ...decision.cons];
  const isTie = comparison.result === 'tie';
  const highestBalance = Math.max(
    comparison.optionA.balance,
    comparison.optionB.balance,
  );
  const caution = highestBalance <= 0;
  const hasDetails = argumentsList.length > 0;

  const getOptionState = (optionKey: DecisionOptionKey): OptionState =>
    isTie
      ? 'tie'
      : comparison.result === optionKey
        ? 'leading'
        : 'behind';
  const getOptionTone = (
    optionKey: DecisionOptionKey,
    optionScore: DecisionOptionScore,
  ): OptionTone => {
    const state = getOptionState(optionKey);

    if (state === 'tie') {
      return caution ? 'caution' : 'neutral';
    }

    if (state === 'leading') {
      return caution ? 'caution' : 'positive';
    }

    return optionScore.balance < 0 ? 'negative' : 'neutral';
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>
        {isTie ? 'Tendance partagée' : 'Tendance actuelle'}
      </Text>

      <View accessibilityRole="radiogroup" style={styles.options}>
        <ComparisonOption
          argumentsList={argumentsList}
          choice={choices[0]}
          onSelect={onSelectChoice}
          optionKey="optionA"
          optionScore={comparison.optionA}
          selected={selectedChoice === choices[0].value}
          state={getOptionState('optionA')}
          tone={getOptionTone('optionA', comparison.optionA)}
        />
        <ComparisonOption
          argumentsList={argumentsList}
          choice={choices[1]}
          onSelect={onSelectChoice}
          optionKey="optionB"
          optionScore={comparison.optionB}
          selected={selectedChoice === choices[1].value}
          state={getOptionState('optionB')}
          tone={getOptionTone('optionB', comparison.optionB)}
        />
      </View>

      <Text style={styles.analysisNotice}>
        Cette tendance vous aide à choisir, sans décider à votre place.
      </Text>

      {hasDetails ? (
        <AnimatedPressable
          accessibilityLabel={
            detailsExpanded
              ? 'Réduire le détail de la comparaison'
              : 'Voir le détail de la comparaison'
          }
          accessibilityRole="button"
          accessibilityState={{ expanded: detailsExpanded }}
          onPress={() => setDetailsExpanded((current) => !current)}
          pressedStyle={styles.detailsButtonPressed}
          style={styles.detailsButton}
        >
          <Text style={styles.detailsButtonLabel}>
            {detailsExpanded
              ? 'Réduire le détail'
              : 'Voir le détail de la comparaison'}
          </Text>
          <AppIcon
            color={colors.primary}
            name="chevron-right"
            size="sm"
            style={detailsExpanded ? styles.expandedIcon : undefined}
          />
        </AnimatedPressable>
      ) : null}

      {detailsExpanded ? (
        <ComparisonDetails argumentsList={argumentsList} choices={choices} />
      ) : null}
    </View>
  );
}

function EvaluationChoice({
  choice,
  onSelect,
  selected,
}: {
  choice: ResultChoice;
  onSelect: (choice: string) => void;
  selected: boolean;
}) {
  return (
    <AnimatedPressable
      accessibilityLabel={choice.label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      haptic="selection"
      onPress={() => onSelect(choice.value)}
      pressedStyle={styles.optionPressed}
      style={[
        styles.evaluationChoice,
        selected && styles.optionSelected,
        Platform.OS === 'web' && styles.webButton,
      ]}
    >
      <Text style={styles.evaluationChoiceLabel}>{choice.label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? (
          <AppIcon
            color={colors.white}
            name="check"
            size="xs"
            weight="medium"
          />
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

function EvaluationResult({
  choices,
  onSelectChoice,
  score,
  selectedChoice,
}: Props) {
  const balanced = score.proWeight === score.conWeight;
  const isPositive = score.trend === 'positive';

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Tendance actuelle</Text>

      <View style={styles.evaluationSummary}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreLabel}>
            {balanced ? 'Équilibre actuel' : 'Part favorable pondérée'}
          </Text>
          <Text
            style={[
              styles.percentage,
              isPositive && styles.percentagePositive,
            ]}
          >
            {score.percentage}%
          </Text>
        </View>
        <ScoreBar percentage={score.percentage} positive={isPositive} />
        <Text style={styles.evaluationCounts}>
          {formatCount(score.proCount, 'argument pour', 'arguments pour')} ·{' '}
          {formatCount(score.conCount, 'argument contre', 'arguments contre')}
        </Text>
        <Text style={styles.evaluationMessage}>{score.message}</Text>
      </View>

      <Text style={styles.analysisNotice}>
        Cette tendance vous aide à choisir, sans décider à votre place.
      </Text>

      <View accessibilityRole="radiogroup" style={styles.evaluationChoices}>
        {choices.map((choice) => (
          <EvaluationChoice
            choice={choice}
            key={choice.value}
            onSelect={onSelectChoice}
            selected={selectedChoice === choice.value}
          />
        ))}
      </View>
    </View>
  );
}

function ResultCardComponent(props: Props) {
  if (props.decision.format === 'compare' && props.score.comparison) {
    return <ComparisonResult {...props} />;
  }

  return <EvaluationResult {...props} />;
}

export const ResultCard = memo(ResultCardComponent);

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  sectionLabel: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  options: { marginTop: spacing.base, gap: spacing.sm },
  option: {
    minHeight: 132,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  optionPressed: { borderColor: colors.focus },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  optionNameArea: { flex: 1 },
  optionName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  stateBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  positiveBadge: { backgroundColor: colors.successSoft },
  cautionBadge: { backgroundColor: colors.warningSoft },
  negativeBadge: { backgroundColor: colors.dangerSoft },
  neutralBadge: { backgroundColor: colors.surfaceMuted },
  stateLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  positiveText: { color: colors.success },
  cautionText: { color: colors.warning },
  negativeText: { color: colors.dangerMuted },
  balanceArea: { alignItems: 'flex-end', gap: spacing.xs },
  balanceValue: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 31,
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  countSummary: {
    marginTop: spacing.sm,
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  featuredArgument: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  featuredArgumentLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '800',
  },
  featuredArgumentText: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  decisiveLabel: { color: colors.primaryDark },
  analysisNotice: {
    marginTop: spacing.md,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  detailsButton: {
    minHeight: 44,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderRadius: radii.base,
  },
  detailsButtonPressed: { backgroundColor: colors.primarySoft },
  detailsButtonLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  expandedIcon: { transform: [{ rotate: '90deg' }] },
  details: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  detailOption: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    gap: spacing.base,
  },
  detailOptionName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  detailGroup: { gap: spacing.xs },
  detailGroupTitle: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailArgument: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailDot: {
    width: 6,
    height: 6,
    marginTop: 7,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  detailArgumentContent: { flex: 1 },
  detailArgumentText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  detailWeight: {
    marginTop: 2,
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '700',
  },
  evaluationSummary: { marginTop: spacing.base },
  scoreHeader: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  scoreLabel: {
    flex: 1,
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  percentage: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  percentagePositive: { color: colors.success },
  evaluationCounts: {
    marginTop: spacing.sm,
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  evaluationMessage: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  evaluationChoices: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  evaluationChoice: {
    minHeight: 58,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  evaluationChoiceLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  webButton: { cursor: 'pointer' },
});
