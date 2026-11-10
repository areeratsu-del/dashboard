import { Question, SurveySubmission, SummaryStats, QuestionStat } from '../types';
import { getInterpretation } from '../constants';

export function calculateStats(
  questions: Question[],
  submissions: SurveySubmission[]
): SummaryStats {
  const totalResponses = submissions.length;

  if (totalResponses === 0) {
    const emptyQuestionStats: QuestionStat[] = questions.map((q) => ({
      id: q.id,
      text: q.text,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      count: 0,
    }));

    return {
      totalResponses: 0,
      overallAverage: 0,
      interpretation: getInterpretation(0),
      questionStats: emptyQuestionStats,
      recentComments: [],
    };
  }

  const questionStats: QuestionStat[] = questions.map((q) => {
    let sum = 0;
    let count = 0;
    const distribution: { [score: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    submissions.forEach((sub) => {
      const score = sub.scores[q.id];
      if (typeof score === 'number' && score >= 1 && score <= 5) {
        sum += score;
        count += 1;
        distribution[score] = (distribution[score] || 0) + 1;
      }
    });

    const average = count > 0 ? Number((sum / count).toFixed(2)) : 0;

    return {
      id: q.id,
      text: q.text,
      average,
      distribution,
      count,
    };
  });

  // Calculate overall average across all question scores
  let totalScoreSum = 0;
  let totalScoreCount = 0;

  questionStats.forEach((qs) => {
    Object.entries(qs.distribution).forEach(([scoreStr, count]) => {
      const score = Number(scoreStr);
      totalScoreSum += score * count;
      totalScoreCount += count;
    });
  });

  const overallAverage =
    totalScoreCount > 0 ? Number((totalScoreSum / totalScoreCount).toFixed(2)) : 0;

  // Extract comments
  const recentComments = submissions
    .filter((sub) => sub.comment && sub.comment.trim().length > 0)
    .slice(0, 50)
    .map((sub) => {
      const scoreValues = Object.values(sub.scores);
      const subAvg =
        scoreValues.length > 0
          ? Number(
              (
                scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
              ).toFixed(2)
            )
          : 0;

      return {
        id: sub.id,
        comment: sub.comment!,
        timestamp: sub.timestamp,
        averageScore: subAvg,
      };
    });

  return {
    totalResponses,
    overallAverage,
    interpretation: getInterpretation(overallAverage),
    questionStats,
    recentComments,
  };
}
