export const COMMIT_HOLD_DURATION_MS = 2000;
export const COMMIT_DECAY_DURATION_MS = 5000;
export const COMMIT_COMPLETION_SETTLE_MS = 360;

export type CommitMotion = 'holding' | 'decaying';

export function clampCommitProgress(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function advanceCommitProgress(
  currentProgress: number,
  elapsedMs: number,
  motion: CommitMotion,
) {
  const duration =
    motion === 'holding'
      ? COMMIT_HOLD_DURATION_MS
      : COMMIT_DECAY_DURATION_MS;
  const direction = motion === 'holding' ? 1 : -1;

  return clampCommitProgress(
    currentProgress + direction * (Math.max(0, elapsedMs) / duration),
  );
}
