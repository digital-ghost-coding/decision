import { triggerHaptic } from './hapticFeedback';

export type CommitHapticEvent =
  | 'start'
  | 'milestone'
  | 'confirmation';

export async function triggerCommitHaptic(event: CommitHapticEvent) {
  await triggerHaptic(
    event === 'start'
      ? 'light'
      : event === 'milestone'
        ? 'selection'
        : 'success',
  );
}
