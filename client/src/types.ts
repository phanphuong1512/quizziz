export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit?: number; // seconds, default 20
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  bannerColor?: string;
  icon?: string;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  isBot?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  isBot?: boolean;
  answersCount: number;
  correctCount: number;
}

export interface AnswerFeedback {
  isCorrect: boolean;
  pointsEarned: number;
  speedBonus: number;
  streakBonus: number;
  streak: number;
  correctIndex: number;
  explanation: string;
  currentScore: number;
  currentRank: number;
  timedOut?: boolean;
}

export interface QuestionBreakdown {
  questionIndex: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  optionCounts: number[];
  totalResponses: number;
  accuracy: number;
  avgTime: string;
}

export interface StudentReport {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestionsAnswered: number;
  accuracy: number;
  totalTime: number;
  answers: Array<{
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
    points: number;
    timeTaken: number;
  }>;
}

export interface GameStats {
  quizTitle: string;
  totalPlayers: number;
  overallAccuracy: number;
  toughestQuestion: QuestionBreakdown | null;
  easiestQuestion: QuestionBreakdown | null;
  questionBreakdown: QuestionBreakdown[];
  studentReports: StudentReport[];
  finalLeaderboard: LeaderboardEntry[];
}
