export const COMMIT_CIRCLE_SIZES = {
  compact: 176,
  regular: 200,
  spacious: 224,
} as const;

export function getCommitCircleSize(viewportHeight: number) {
  if (viewportHeight <= 700) {
    return COMMIT_CIRCLE_SIZES.compact;
  }

  if (viewportHeight <= 850) {
    return COMMIT_CIRCLE_SIZES.regular;
  }

  return COMMIT_CIRCLE_SIZES.spacious;
}
