"use client";

import { decryptData } from "@switch-to-eu/db/crypto";
import { calculateScore, isLateAnswer } from "@/lib/scoring";
import type { DecryptedQuestion, DecryptedAnswer, LeaderboardEntry, QuestionResult } from "@/lib/interfaces";
import type { AnswerInfo, ParticipantInfo } from "@/server/db/types";

interface ScoringInput {
  encryptionKey: string;
  participants: ParticipantInfo[];
  /** Map of questionIndex -> { encryptedQuestion, answers, timerSeconds, startedAt } */
  questionResults: Array<{
    index: number;
    encryptedQuestion: string;
    answers: AnswerInfo[];
    timerSeconds: number;
    startedAt: string;
  }>;
}

export interface ScoringResult {
  leaderboard: LeaderboardEntry[];
  questionResults: QuestionResult[];
}

/** Decrypt and compute scores for all completed questions */
export async function computeScoring(input: ScoringInput): Promise<ScoringResult> {
  const { encryptionKey, participants, questionResults } = input;

  const participantScores = new Map<string, number>();
  for (const p of participants) {
    participantScores.set(p.sessionId, 0);
  }

  const results: QuestionResult[] = [];

  for (const qr of questionResults) {
    const question = await decryptData<DecryptedQuestion>(qr.encryptedQuestion, encryptionKey);
    const distribution: number[] = new Array<number>(question.options.length).fill(0);
    const entries: QuestionResult["entries"] = [];

    for (const answer of qr.answers) {
      const decrypted = await decryptData<DecryptedAnswer>(answer.encryptedAnswer, encryptionKey);
      const selectedIndex = decrypted.selectedIndex;

      if (selectedIndex >= 0 && selectedIndex < distribution.length) {
        distribution[selectedIndex] = (distribution[selectedIndex] ?? 0) + 1;
      }

      const late = isLateAnswer(answer.answeredAt, qr.startedAt, qr.timerSeconds);
      const correct = !late && selectedIndex === question.correctIndex;
      const score = calculateScore(correct, answer.position);

      const currentTotal = participantScores.get(answer.sessionId) ?? 0;
      participantScores.set(answer.sessionId, currentTotal + score);

      const participant = participants.find((p) => p.sessionId === answer.sessionId);
      entries.push({
        sessionId: answer.sessionId,
        nickname: participant?.nickname ?? "Unknown",
        selectedIndex,
        correct,
        score,
        position: answer.position,
      });
    }

    results.push({
      questionIndex: qr.index,
      distribution,
      correctIndex: question.correctIndex,
      entries: entries.sort((a, b) => a.position - b.position),
    });
  }

  // Build leaderboard sorted by total score
  const leaderboard: LeaderboardEntry[] = participants
    .map((p) => ({
      sessionId: p.sessionId,
      nickname: p.nickname,
      totalScore: participantScores.get(p.sessionId) ?? 0,
      rank: 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  return { leaderboard, questionResults: results };
}
