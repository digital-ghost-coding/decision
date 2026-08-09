import { useCallback, useEffect, useRef, useState } from 'react';

import {
  advanceCommitProgress,
  type CommitMotion,
} from '../interactions/commitAnimation';
import { triggerCommitHaptic } from '../interactions/commitHaptics';

const HAPTIC_MILESTONES = [0.25, 0.5, 0.75] as const;

type Options = {
  disabled?: boolean;
  onComplete: () => Promise<void> | void;
};

type CommitPhase = 'idle' | CommitMotion | 'completed';

export function useCommitInteraction({
  disabled = false,
  onComplete,
}: Options) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const progressRef = useRef(0);
  const phaseRef = useRef<CommitPhase>('idle');
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const completedMilestonesRef = useRef(new Set<number>());
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const resetInteraction = useCallback(() => {
    progressRef.current = 0;
    phaseRef.current = 'idle';
    lastTimestampRef.current = null;
    completedMilestonesRef.current.clear();
    setProgress(0);
    setIsHolding(false);
    setIsComplete(false);
  }, []);

  const completeInteraction = useCallback(() => {
    progressRef.current = 1;
    phaseRef.current = 'completed';
    setProgress(1);
    setIsHolding(false);
    setIsComplete(true);
    void triggerCommitHaptic('confirmation');

    void Promise.resolve(onCompleteRef.current()).catch(() => {
      resetInteraction();
    });
  }, [resetInteraction]);

  const tick = useCallback(
    (timestamp: number) => {
      frameRef.current = null;
      const phase = phaseRef.current;

      if (phase !== 'holding' && phase !== 'decaying') {
        lastTimestampRef.current = null;
        return;
      }

      const lastTimestamp = lastTimestampRef.current ?? timestamp;
      const elapsedMs = Math.min(64, Math.max(0, timestamp - lastTimestamp));
      lastTimestampRef.current = timestamp;
      const previousProgress = progressRef.current;
      const nextProgress = advanceCommitProgress(
        previousProgress,
        elapsedMs,
        phase,
      );

      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (phase === 'holding') {
        HAPTIC_MILESTONES.forEach((milestone) => {
          if (
            previousProgress < milestone &&
            nextProgress >= milestone &&
            !completedMilestonesRef.current.has(milestone)
          ) {
            completedMilestonesRef.current.add(milestone);
            void triggerCommitHaptic('milestone');
          }
        });

        if (nextProgress >= 1) {
          completeInteraction();
          return;
        }
      }

      if (phase === 'decaying' && nextProgress <= 0) {
        resetInteraction();
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    },
    [completeInteraction, resetInteraction],
  );

  const ensureFrame = useCallback(() => {
    if (frameRef.current === null) {
      lastTimestampRef.current = null;
      frameRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const startHolding = useCallback(() => {
    if (disabled || phaseRef.current === 'completed') {
      return;
    }

    phaseRef.current = 'holding';
    setIsHolding(true);
    void triggerCommitHaptic('start');
    ensureFrame();
  }, [disabled, ensureFrame]);

  const stopHolding = useCallback(() => {
    if (phaseRef.current !== 'holding') {
      return;
    }

    phaseRef.current = 'decaying';
    setIsHolding(false);
    ensureFrame();
  }, [ensureFrame]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  return {
    isComplete,
    isHolding,
    progress,
    startHolding,
    stopHolding,
  };
}
