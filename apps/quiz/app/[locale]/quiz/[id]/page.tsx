"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2 } from "lucide-react";
import { decryptData, encryptData } from "@switch-to-eu/db/crypto";

import { api } from "@/lib/trpc-client";
import { useFragment } from "@switch-to-eu/blocks/hooks/use-fragment";
import { useCountdown } from "@hooks/use-countdown";
import { computeScoring, type ScoringResult } from "@hooks/use-scoring";
import { CountdownTimer } from "@components/countdown-timer";
import { AnswerButtons } from "@components/answer-buttons";
import { AnswerDistribution } from "@components/answer-distribution";
import { Leaderboard } from "@components/leaderboard";
import { Podium } from "@components/podium";
import { ParticipantList } from "@components/participant-list";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import type { DecryptedQuestion, DecryptedQuizData, DecryptedAnswer } from "@/lib/interfaces";
import { QUIZ_STATE_TITLES } from "@/server/db/types";
import type { QuizStateUpdate } from "@/server/db/types";

export default function QuizParticipantPage() {
  const t = useTranslations("quiz");
  const params = useParams<{ id: string }>();
  const fragment = useFragment();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<DecryptedQuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DecryptedQuestion | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [scoring, setScoring] = useState<ScoringResult | null>(null);
  const [latestUpdate, setLatestUpdate] = useState<QuizStateUpdate | null>(null);
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState<
    Array<{ index: number; encryptedQuestion: string; answers: NonNullable<QuizStateUpdate["answers"]>; timerSeconds: number; startedAt: string }>
  >([]);
  const lastQuestionIndexRef = useRef<number>(-1);

  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const encryptionKey = fragment.params.key || "";

  const joinMutation = api.quiz.join.useMutation();

  // Load session ID from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-session-${params.id}`);
    setSessionId(stored);
  }, [params.id]);

  // Set document title based on quiz state (also used by e2e tests to detect state)
  useEffect(() => {
    const state = latestUpdate?.quiz.state;
    if (state) {
      document.title = QUIZ_STATE_TITLES[state];
    }
  }, [latestUpdate?.quiz.state]);

  const submitAnswer = api.quiz.submitAnswer.useMutation();

  // SSE subscription
  api.quiz.subscribe.useSubscription(
    { quizId: params.id },
    {
      enabled: !!params.id,
      onData: (data: QuizStateUpdate) => {
        void (async () => {
        setLatestUpdate(data);

        // Detect stale session after quiz reset: our sessionId is no longer in the participants list
        if ((data.quiz.state === "draft" || data.quiz.state === "lobby") && sessionId && data.participants.length >= 0) {
          const stillParticipant = data.participants.some((p) => p.sessionId === sessionId);
          if (!stillParticipant) {
            sessionStorage.removeItem(`quiz-session-${params.id}`);
            setSessionId(null);
            setQuizData(null);
            setCurrentQuestion(null);
            setHasAnswered(false);
            setSelectedAnswer(null);
            setScoring(null);
            setAllAnsweredQuestions([]);
            lastQuestionIndexRef.current = -1;
          }
        }

        // Decrypt quiz title
        if (encryptionKey && data.quiz.encryptedData && !quizData) {
          try {
            const decrypted = await decryptData<DecryptedQuizData>(data.quiz.encryptedData, encryptionKey);
            setQuizData(decrypted);
          } catch { /* ignore decryption errors */ }
        }

        // Decrypt current question when active
        if (encryptionKey && data.quiz.state === "active" && data.currentQuestion) {
          try {
            const q = await decryptData<DecryptedQuestion>(data.currentQuestion.encryptedQuestion, encryptionKey);
            setCurrentQuestion(q);
            // Only reset answer state when the question index changes (new question)
            if (data.currentQuestion.index !== lastQuestionIndexRef.current) {
              lastQuestionIndexRef.current = data.currentQuestion.index;
              setHasAnswered(false);
              setSelectedAnswer(null);
            }
          } catch { /* ignore */ }
        }

        // When state transitions to results, accumulate answered questions
        if (data.quiz.state === "results" && data.currentQuestion && data.answers) {
          setAllAnsweredQuestions((prev) => {
            const exists = prev.some((q) => q.index === data.currentQuestion!.index);
            if (exists) return prev;
            return [
              ...prev,
              {
                index: data.currentQuestion!.index,
                encryptedQuestion: data.currentQuestion!.encryptedQuestion,
                answers: data.answers!,
                timerSeconds: data.currentQuestion!.timerSeconds,
                startedAt: data.currentQuestion!.startedAt,
              },
            ];
          });
        }

        // Compute scoring when results or finished
        if ((data.quiz.state === "results" || data.quiz.state === "finished") && encryptionKey) {
          // Use the accumulated questions plus current one
          const questionsForScoring = [...allAnsweredQuestions];
          if (data.currentQuestion && data.answers) {
            const exists = questionsForScoring.some((q) => q.index === data.currentQuestion!.index);
            if (!exists) {
              questionsForScoring.push({
                index: data.currentQuestion.index,
                encryptedQuestion: data.currentQuestion.encryptedQuestion,
                answers: data.answers,
                timerSeconds: data.currentQuestion.timerSeconds,
                startedAt: data.currentQuestion.startedAt,
              });
            }
          }

          try {
            const result = await computeScoring({
              encryptionKey,
              participants: data.participants,
              questionResults: questionsForScoring,
            });
            setScoring(result);
          } catch { /* ignore */ }
        }
        })();
      },
    }
  );

  const countdown = useCountdown({
    startedAt: latestUpdate?.currentQuestion?.startedAt ?? "",
    timerSeconds: latestUpdate?.currentQuestion?.timerSeconds ?? 20,
    enabled: latestUpdate?.quiz.state === "active" && !hasAnswered,
  });

  const handleSelectAnswer = useCallback(async (index: number) => {
    if (hasAnswered || !sessionId || !latestUpdate || !encryptionKey) return;

    setSelectedAnswer(index);
    setHasAnswered(true);

    try {
      const answerData: DecryptedAnswer = { selectedIndex: index };
      const encrypted = await encryptData(answerData, encryptionKey);

      await submitAnswer.mutateAsync({
        quizId: params.id,
        sessionId,
        questionIndex: latestUpdate.quiz.currentQuestion,
        encryptedAnswer: encrypted,
      });
    } catch {
      // Allow retry on failure
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  }, [hasAnswered, sessionId, latestUpdate, encryptionKey, params.id, submitAnswer]);

  // No encryption key
  if (fragment.ready && !encryptionKey) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-red-600 font-semibold">{t("missingEncryptionKey")}</p>
      </main>
    );
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || isJoining) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      const result = await joinMutation.mutateAsync({
        quizId: params.id,
        nickname: nickname.trim(),
      });
      sessionStorage.setItem(`quiz-session-${params.id}`, result.sessionId);
      setSessionId(result.sessionId);
    } catch {
      setJoinError(t("join.error"));
      setIsJoining(false);
    }
  };

  // No session ID — show state-dependent join UI
  if (!sessionId) {
    const quizState = latestUpdate?.quiz.state;

    // Still loading SSE
    if (!latestUpdate) {
      return (
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </main>
      );
    }

    // Draft — quiz not open yet
    if (quizState === "draft") {
      return (
        <main className="mx-auto max-w-md px-4 py-12 text-center space-y-4">
          <h1 className="font-bricolage text-2xl font-bold">{t("draft.notOpenYet")}</h1>
          <p className="text-muted-foreground">{t("draft.waitingForLobby")}</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </main>
      );
    }

    // Lobby — show inline join form
    if (quizState === "lobby") {
      return (
        <main className="mx-auto max-w-md px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="font-bricolage text-3xl font-bold mb-2">{t("join.title")}</h1>
            <p className="text-muted-foreground">{t("join.subtitle")}</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
                {t("join.nickname")}
              </label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("join.nicknamePlaceholder")}
                maxLength={30}
                required
                autoFocus
                disabled={isJoining}
              />
            </div>

            {joinError && <p className="text-sm text-red-600">{joinError}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full gradient-primary text-white"
              disabled={isJoining || !nickname.trim()}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("join.joining")}
                </>
              ) : (
                t("join.joinButton")
              )}
            </Button>
          </form>
        </main>
      );
    }

    // Active/results/finished — quiz already started
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="font-bricolage text-2xl font-bold mb-4">{t("join.quizAlreadyStarted")}</h1>
      </main>
    );
  }

  // Loading
  if (!latestUpdate) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </main>
    );
  }

  const state = latestUpdate.quiz.state;
  const { scoringEnabled, leaderboardEnabled } = latestUpdate.quiz;

  // Lobby state
  if (state === "lobby") {
    return (
      <main className="mx-auto max-w-lg px-4 py-12 text-center space-y-6">
        {quizData && (
          <h1 className="font-bricolage text-2xl font-bold">{quizData.title}</h1>
        )}
        <p className="text-muted-foreground">{t("lobby.waitingForHost")}</p>
        <ParticipantList participants={latestUpdate.participants} />
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
        </div>
      </main>
    );
  }

  // Active state - answer questions
  if (state === "active") {
    return (
      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {t("active.question", {
              current: latestUpdate.quiz.currentQuestion + 1,
              total: latestUpdate.quiz.questionCount,
            })}
          </span>
          {!countdown.noTimer && (
            <CountdownTimer
              secondsLeft={countdown.secondsLeft}
              progress={countdown.progress}
            />
          )}
        </div>

        {currentQuestion && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{currentQuestion.text}</h2>

            {hasAnswered ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                <p className="font-semibold text-green-700">{t("active.answered")}</p>
                <p className="text-sm text-muted-foreground">{t("active.waitingForResults")}</p>
              </div>
            ) : (
              <AnswerButtons
                options={currentQuestion.options}
                onSelect={handleSelectAnswer}
                disabled={countdown.isExpired}
                selectedIndex={selectedAnswer ?? undefined}
              />
            )}
          </div>
        )}
      </main>
    );
  }

  // Results state - show per-question results
  if (state === "results" && scoring) {
    const currentQIndex = latestUpdate.quiz.currentQuestion;
    const qResult = scoring.questionResults.find((q) => q.questionIndex === currentQIndex);
    const myEntry = qResult?.entries.find((e) => e.sessionId === sessionId);

    return (
      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <h2 className="font-bricolage text-xl font-bold">{t("results.title")}</h2>

        {myEntry && (
          <div className={`text-center py-4 rounded-lg ${myEntry.correct ? "bg-green-50" : "bg-red-50"}`}>
            <p className={`font-bold text-lg ${myEntry.correct ? "text-green-700" : "text-red-700"}`}>
              {myEntry.correct ? t("results.correct") : t("results.incorrect")}
            </p>
            {scoringEnabled && (
              <p className="text-sm text-muted-foreground">
                {t("results.points", { points: myEntry.score })}
                {" - "}
                {t("results.position", { position: myEntry.position })}
              </p>
            )}
          </div>
        )}

        {currentQuestion && qResult && (
          <AnswerDistribution
            options={currentQuestion.options}
            distribution={qResult.distribution}
            correctIndex={qResult.correctIndex}
          />
        )}

        {leaderboardEnabled && (
          <Leaderboard entries={scoring.leaderboard} currentSessionId={sessionId} />
        )}

        <p className="text-center text-sm text-muted-foreground">
          {t("results.waitingForNext")}
        </p>
      </main>
    );
  }

  // Finished state - show podium
  if (state === "finished" && scoring) {
    const myEntry = scoring.leaderboard.find((e) => e.sessionId === sessionId);

    return (
      <main className="mx-auto max-w-lg px-4 py-8 space-y-8">
        <h1 className="font-bricolage text-3xl font-bold text-center">
          {t("finished.title")}
        </h1>

        {leaderboardEnabled && <Podium entries={scoring.leaderboard} />}

        {scoringEnabled && myEntry && (
          <div className="text-center py-4 rounded-lg bg-rose-50">
            <p className="text-sm text-muted-foreground">{t("finished.yourScore")}</p>
            <p className="text-2xl font-black text-rose-700">
              {t("finished.totalPoints", { points: myEntry.totalScore })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("results.position", { position: myEntry.rank })}
            </p>
          </div>
        )}

        {leaderboardEnabled && (
          <Leaderboard entries={scoring.leaderboard} currentSessionId={sessionId} />
        )}
      </main>
    );
  }

  // Fallback loading
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
    </main>
  );
}
