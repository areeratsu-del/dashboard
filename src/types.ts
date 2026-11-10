export interface Question {
  id: string;
  text: string;
  category?: string;
}

export interface SurveySubmission {
  id: string;
  timestamp: number;
  scores: {
    [questionId: string]: number; // 1 to 5
  };
  comment?: string;
  deviceHash?: string;
}

export interface QuestionStat {
  id: string;
  text: string;
  average: number;
  distribution: { [score: number]: number }; // score 1-5 counts
  count: number;
}

export interface SummaryStats {
  totalResponses: number;
  overallAverage: number;
  interpretation: {
    label: string;
    description: string;
    color: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
  questionStats: QuestionStat[];
  recentComments: Array<{
    id: string;
    comment: string;
    timestamp: number;
    averageScore: number;
  }>;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
