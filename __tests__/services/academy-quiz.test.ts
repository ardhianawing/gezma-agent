import { describe, it, expect } from 'vitest';

// Quiz scoring logic (extracted from the attempt route pattern)
function calculateQuizScore(
  answers: number[],
  questions: { correctIndex: number }[]
): { score: number; correct: number; total: number; passed: boolean; passScore: number } {
  const total = questions.length;
  let correct = 0;
  for (let i = 0; i < total; i++) {
    if (answers[i] === questions[i].correctIndex) {
      correct++;
    }
  }
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passScore = 70;
  return { score, correct, total, passed: score >= passScore, passScore };
}

describe('Academy Quiz Scoring', () => {
  const questions = [
    { correctIndex: 0 },
    { correctIndex: 1 },
    { correctIndex: 2 },
    { correctIndex: 3 },
    { correctIndex: 0 },
  ];

  it('calculates 100% for all correct answers', () => {
    const result = calculateQuizScore([0, 1, 2, 3, 0], questions);
    expect(result.score).toBe(100);
    expect(result.correct).toBe(5);
    expect(result.total).toBe(5);
    expect(result.passed).toBe(true);
  });

  it('calculates 0% for all wrong answers', () => {
    const result = calculateQuizScore([3, 3, 3, 0, 3], questions);
    expect(result.score).toBe(0);
    expect(result.correct).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('calculates 60% for 3/5 correct (below pass)', () => {
    const result = calculateQuizScore([0, 1, 2, 0, 3], questions);
    expect(result.score).toBe(60);
    expect(result.correct).toBe(3);
    expect(result.passed).toBe(false);
  });

  it('calculates 80% for 4/5 correct (above pass)', () => {
    const result = calculateQuizScore([0, 1, 2, 3, 3], questions);
    expect(result.score).toBe(80);
    expect(result.correct).toBe(4);
    expect(result.passed).toBe(true);
  });

  it('handles exactly 70% as passing', () => {
    const sevenQuestions = [
      { correctIndex: 0 }, { correctIndex: 1 }, { correctIndex: 2 },
      { correctIndex: 3 }, { correctIndex: 0 }, { correctIndex: 1 },
      { correctIndex: 2 },
    ];
    // 5/7 ≈ 71% → pass
    const result = calculateQuizScore([0, 1, 2, 3, 0, 0, 0], sevenQuestions);
    expect(result.correct).toBe(5);
    expect(result.score).toBe(71);
    expect(result.passed).toBe(true);
  });

  it('handles empty questions array', () => {
    const result = calculateQuizScore([], []);
    expect(result.score).toBe(0);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('handles single question correct', () => {
    const result = calculateQuizScore([0], [{ correctIndex: 0 }]);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('handles single question wrong', () => {
    const result = calculateQuizScore([1], [{ correctIndex: 0 }]);
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('pass score threshold is 70', () => {
    const result = calculateQuizScore([0], [{ correctIndex: 0 }]);
    expect(result.passScore).toBe(70);
  });
});
