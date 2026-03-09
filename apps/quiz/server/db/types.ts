/** Redis hash for quiz:{id} */
export interface RedisQuizHash {
  encryptedData: string;       // Encrypted JSON: { title, description }
  adminToken: string;          // SHA-256 hash
  state: QuizState;            // draft | lobby | active | results | finished
  currentQuestion: string;     // 0-based index as string
  questionStartedAt: string;   // ISO 8601 (empty when not active)
  timerSeconds: string;        // Default timer per question
  questionCount: string;       // Number of questions
  scoringEnabled: string;      // "1" or "0"
  leaderboardEnabled: string;  // "1" or "0"
  version: string;             // Monotonic counter
  createdAt: string;           // ISO 8601
  expiresAt: string;           // ISO 8601
}

/** Redis hash for quiz:{id}:q:{index} */
export interface RedisQuestionHash {
  encryptedQuestion: string;   // Encrypted JSON: { text, options: string[4], correctIndex: number }
  timerOverride: string;       // Optional per-question timer (empty string if not set)
}

/** Redis hash for quiz:{id}:p:{sessionId} */
export interface RedisParticipantHash {
  nickname: string;            // Plaintext display name
  joinedAt: string;            // ISO 8601
}

/** Redis hash for quiz:{id}:a:{index}:{sessionId} */
export interface RedisAnswerHash {
  encryptedAnswer: string;     // Encrypted JSON: { selectedIndex: number }
  answeredAt: string;          // ISO 8601
}

/** Quiz states */
export type QuizState = "draft" | "lobby" | "active" | "results" | "finished";

/**
 * Document title prefixes per quiz state.
 * Used by the player page to set document.title and by e2e tests to detect state.
 */
export const QUIZ_STATE_TITLES: Record<QuizState, string> = {
  draft: "[draft]",
  lobby: "[lobby]",
  active: "[active]",
  results: "[results]",
  finished: "[finished]",
};

/** Valid state transitions */
export const VALID_TRANSITIONS: Record<QuizState, QuizState[]> = {
  draft: ["lobby"],
  lobby: ["active", "draft"],
  active: ["results"],
  results: ["active", "finished"],
  finished: ["draft"],
};

/** tRPC response types */
export interface QuizResponse {
  id: string;
  state: QuizState;
  currentQuestion: number;
  questionStartedAt: string;
  timerSeconds: number;
  questionCount: number;
  scoringEnabled: boolean;
  leaderboardEnabled: boolean;
  version: number;
  encryptedData: string;
  createdAt: string;
  expiresAt: string;
}

export interface ParticipantInfo {
  sessionId: string;
  nickname: string;
  joinedAt: string;
}

export interface QuestionResponse {
  index: number;
  encryptedQuestion: string;
  timerOverride: number | null;
}

export interface AnswerInfo {
  sessionId: string;
  encryptedAnswer: string;
  position: number;
  answeredAt: string;
}

export interface QuizStateUpdate {
  quiz: QuizResponse;
  participants: ParticipantInfo[];
  currentQuestion?: {
    index: number;
    encryptedQuestion: string;
    totalAnswers: number;
    timerSeconds: number;
    startedAt: string;
  };
  answers?: AnswerInfo[];
  /** All questions — included in draft/lobby state so the admin UI updates via SSE without extra fetches */
  allQuestions?: QuestionResponse[];
}
