/** Decrypted quiz metadata (client-side only) */
export interface DecryptedQuizData {
  title: string;
  description: string;
}

/** Decrypted question data (client-side only) */
export interface DecryptedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

/** Decrypted answer data (client-side only) */
export interface DecryptedAnswer {
  selectedIndex: number;
}

/** Client-side leaderboard entry (computed from decrypted data) */
export interface LeaderboardEntry {
  sessionId: string;
  nickname: string;
  totalScore: number;
  rank: number;
}

/** Client-side per-question result (computed from decrypted data) */
export interface QuestionResult {
  questionIndex: number;
  distribution: number[];
  correctIndex: number;
  entries: Array<{
    sessionId: string;
    nickname: string;
    selectedIndex: number;
    correct: boolean;
    score: number;
    position: number;
  }>;
}
