/**
 * Calculate score for a quiz answer based on position.
 *
 * Scoring: first correct = 1000pts, second = 975, third = 950, etc.
 * Minimum for a correct answer: 100pts. Wrong answer: 0pts.
 *
 * @param correct - Whether the answer was correct
 * @param position - 1-based position in answer order
 * @returns Points awarded
 */
export function calculateScore(correct: boolean, position: number): number {
  if (!correct) return 0;
  return Math.max(100, 1000 - (position - 1) * 25);
}

/**
 * Check if an answer was submitted after the timer expired.
 *
 * @param answeredAt - ISO 8601 timestamp of answer submission
 * @param questionStartedAt - ISO 8601 timestamp of when the question started
 * @param timerSeconds - Timer duration in seconds
 * @returns true if the answer was late
 */
export function isLateAnswer(
  answeredAt: string,
  questionStartedAt: string,
  timerSeconds: number,
): boolean {
  if (timerSeconds === 0) return false; // No timer = never late
  const answered = new Date(answeredAt).getTime();
  const started = new Date(questionStartedAt).getTime();
  const deadline = started + timerSeconds * 1000;
  return answered > deadline;
}
