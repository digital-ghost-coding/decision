import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  getArgumentWeightLabel,
  normalizeArgumentWeight,
} from '../constants/argumentWeights';
import { colors, radii, shadows, spacing } from '../theme';
import type {
  Argument,
  Decision,
  DecisionOptionKey,
  DecisionOptionScore,
  DecisionScore,
} from '../types/decision';
import { ScoreBar } from './ScoreBar';

type Props = {
  decision: Decision;
  score: DecisionScore;
};

type ComparisonOptionProps = {
  argumentsList: Argument[];
  caution: boolean;
  label: string;
  optionKey: DecisionOptionKey;
  optionScore: DecisionOptionScore;
  state: 'leading' | 'behind' | 'tie';
};

function formatArgumentCount(count: number) {
  return `${count} argument${count > 1 ? 's' : ''}`;
}

function formatBalance(balance: number) {
  return balance > 0 ? `+${balance}` : String(balance);
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

function ImportantArguments({ items }: { items: Argument[] }) {
  const importantItems = [...items]
    .filter((argument) => normalizeArgumentWeight(argument.weight) >= 3)
    .sort(
      (first, second) =>
        normalizeArgumentWeight(second.weight) -
        normalizeArgumentWeight(first.weight),
    )
    .slice(0, 2);

  if (importantItems.length === 0) {
    return <Text style={styles.emptyHighlight}>Aucun élément important.</Text>;
  }

  return (
    <View style={styles.highlightList}>
      {importantItems.map((argument) => {
        const weightLabel = getArgumentWeightLabel(argument.weight);

        return (
          <View key={argument.id} style={styles.highlightRow}>
            <View style={styles.highlightDot} />
            <View style={styles.highlightContent}>
              <Text style={styles.highlightText}>{argument.text}</Text>
              <Text
                style={[
                  styles.highlightWeight,
                  weightLabel === 'Décisif' && styles.decisiveWeight,
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

function ComparisonOption({
  argumentsList,
  caution,
  label,
  optionKey,
  optionScore,
  state,
}: ComparisonOptionProps) {
  const pros = argumentsList.filter(
    (argument) =>
      argument.optionKey === optionKey && argument.side === 'pro',
  );
  const cons = argumentsList.filter(
    (argument) =>
      argument.optionKey === optionKey && argument.side === 'con',
  );
  const stateLabel =
    caution && state === 'leading'
      ? 'En tête, avec vigilance'
      : caution && state === 'behind'
        ? 'Davantage de freins actuellement'
        : caution && state === 'tie'
          ? 'Points de vigilance partagés'
          : state === 'leading'
      ? 'En tête actuellement'
      : state === 'behind'
        ? 'Balance plus basse actuellement'
        : 'Balance partagée';
  const accessibilityLabel = `${label}. ${stateLabel}. Balance ${formatAccessibleBalance(optionScore.balance)}. Atouts, ${optionScore.proCount}, poids ${optionScore.proWeight}. Freins, ${optionScore.conCount}, poids ${optionScore.conWeight}.`;

  return (
    <View
      style={[
        styles.comparisonOption,
        caution && styles.cautionOption,
        !caution && state === 'leading' && styles.leadingOption,
        !caution && state === 'behind' && styles.behindOption,
        !caution && state === 'tie' && styles.tieOption,
      ]}
    >
      <View
        accessibilityLabel={accessibilityLabel}
        accessible
        style={styles.comparisonHeader}
      >
        <View style={styles.comparisonNameArea}>
          <Text style={styles.comparisonName}>{label}</Text>
          <Text
            style={[
              styles.stateLabel,
              caution && styles.cautionText,
              !caution && state === 'leading' && styles.leadingText,
              !caution && state === 'behind' && styles.behindText,
            ]}
          >
            {stateLabel}
          </Text>
        </View>
        <View style={styles.balanceArea}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>
            {formatBalance(optionScore.balance)}
          </Text>
        </View>
      </View>

      <View style={styles.weightSummary}>
        <Text style={styles.weightSummaryText}>
          Atouts +{optionScore.proWeight}
        </Text>
        <Text style={styles.weightSummaryText}>
          Freins −{optionScore.conWeight}
        </Text>
      </View>

      <View style={styles.argumentSummary}>
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Atouts importants</Text>
          <ImportantArguments items={pros} />
        </View>
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Freins importants</Text>
          <ImportantArguments items={cons} />
        </View>
      </View>
    </View>
  );
}

function ComparisonResult({
  decision,
  score,
}: {
  decision: Decision;
  score: DecisionScore;
}) {
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Votre comparaison</Text>
      <Text style={styles.comparisonIntro}>
        La balance additionne les atouts et retire les freins selon leur
        importance.
      </Text>

      <View style={styles.comparisonOptions}>
        <ComparisonOption
          argumentsList={argumentsList}
          caution={caution}
          label={decision.options.optionA}
          optionKey="optionA"
          optionScore={comparison.optionA}
          state={
            isTie
              ? 'tie'
              : comparison.result === 'optionA'
                ? 'leading'
                : 'behind'
          }
        />
        <ComparisonOption
          argumentsList={argumentsList}
          caution={caution}
          label={decision.options.optionB}
          optionKey="optionB"
          optionScore={comparison.optionB}
          state={
            isTie
              ? 'tie'
              : comparison.result === 'optionB'
                ? 'leading'
                : 'behind'
          }
        />
      </View>

      <View
        accessibilityLabel={`${isTie ? 'Tendance partagée' : 'Tendance actuelle'}. ${score.message}`}
        accessibilityLiveRegion="polite"
        accessible
        style={[
          styles.tendencyCard,
          caution
            ? styles.cautionTendency
            : isTie
              ? styles.tieTendency
              : styles.leadingTendency,
        ]}
      >
        <Text style={styles.tendencyLabel}>
          {isTie ? 'Tendance partagée' : 'Tendance actuelle'}
        </Text>
        <Text style={styles.message}>{score.message}</Text>
      </View>

      <Text style={styles.detailsHint}>
        Les éléments secondaires restent disponibles dans la fiche de la
        décision et lorsque vous reprenez votre réflexion.
      </Text>
    </View>
  );
}

function EvaluationResult({ score }: { score: DecisionScore }) {
  const balanced = score.proWeight === score.conWeight;
  const isPositive = score.trend === 'positive';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Votre réflexion</Text>

      <View style={styles.counts}>
        <View style={styles.simpleOptionCard}>
          <Text style={styles.simpleOptionName}>Pour</Text>
          <Text style={styles.simpleOptionMeta}>
            {formatArgumentCount(score.proCount)} · poids {score.proWeight}
          </Text>
        </View>
        <View style={styles.simpleOptionCard}>
          <Text style={styles.simpleOptionName}>Contre</Text>
          <Text style={styles.simpleOptionMeta}>
            {formatArgumentCount(score.conCount)} · poids {score.conWeight}
          </Text>
        </View>
      </View>

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
      <Text style={styles.message}>{score.message}</Text>
    </View>
  );
}

function ResultCardComponent({ decision, score }: Props) {
  if (decision.format === 'compare' && score.comparison) {
    return <ComparisonResult decision={decision} score={score} />;
  }

  return <EvaluationResult score={score} />;
}

export const ResultCard = memo(ResultCardComponent);

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  comparisonIntro: {
    marginTop: spacing.sm,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
  },
  comparisonOptions: {
    marginTop: spacing.ml,
    gap: spacing.base,
  },
  comparisonOption: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  leadingOption: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  behindOption: {
    borderColor: colors.dangerMuted,
    backgroundColor: colors.dangerSoft,
  },
  tieOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  cautionOption: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  comparisonNameArea: {
    flex: 1,
  },
  comparisonName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  stateLabel: {
    marginTop: spacing.xs,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  leadingText: {
    color: colors.success,
  },
  behindText: {
    color: colors.dangerMuted,
  },
  cautionText: {
    color: colors.warning,
  },
  balanceArea: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    marginTop: 2,
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  weightSummary: {
    marginTop: spacing.base,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  weightSummaryText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  argumentSummary: {
    marginTop: spacing.md,
    gap: spacing.base,
  },
  summarySection: {
    gap: spacing.xs,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  highlightList: {
    gap: spacing.xs,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  highlightDot: {
    width: 6,
    height: 6,
    marginTop: 7,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  highlightContent: {
    flex: 1,
  },
  highlightText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  highlightWeight: {
    marginTop: 2,
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '700',
  },
  decisiveWeight: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  emptyHighlight: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  tendencyCard: {
    marginTop: spacing.ml,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  leadingTendency: {
    backgroundColor: colors.successSoft,
  },
  tieTendency: {
    backgroundColor: colors.primarySoft,
  },
  cautionTendency: {
    backgroundColor: colors.warningSoft,
  },
  tendencyLabel: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailsHint: {
    marginTop: spacing.md,
    color: colors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
  },
  counts: {
    marginTop: spacing.ml,
    gap: spacing.sm,
  },
  simpleOptionCard: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  simpleOptionName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  simpleOptionMeta: {
    marginTop: spacing.xs,
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  scoreHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.base,
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
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  percentagePositive: {
    color: colors.success,
  },
  message: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
});
