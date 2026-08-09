const SWIPE_ACTIVATION_DISTANCE = 12;
const HORIZONTAL_INTENT_RATIO = 1.35;
const SWIPE_VELOCITY_THRESHOLD = 0.45;

export function shouldCaptureDecisionSwipe(
  dx: number,
  dy: number,
  isOpen: boolean,
) {
  return (
    Math.abs(dx) > SWIPE_ACTIVATION_DISTANCE &&
    Math.abs(dx) > Math.abs(dy) * HORIZONTAL_INTENT_RATIO &&
    (dx < 0 || isOpen)
  );
}

export function getDecisionSwipeTarget(
  currentPosition: number,
  horizontalVelocity: number,
  actionsWidth: number,
) {
  if (horizontalVelocity <= -SWIPE_VELOCITY_THRESHOLD) {
    return -actionsWidth;
  }

  if (horizontalVelocity >= SWIPE_VELOCITY_THRESHOLD) {
    return 0;
  }

  return currentPosition < -(actionsWidth / 2)
    ? -actionsWidth
    : 0;
}
