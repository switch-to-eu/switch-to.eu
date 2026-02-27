"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Play, SkipForward, BarChart3, Flag, Trash2, Users, RotateCcw } from "lucide-react";
import { decryptData } from "@switch-to-eu/db/crypto";

import { api } from "@/lib/trpc-client";
import { useFragment } from "@hooks/use-fragment";
import { useCountdown } from "@hooks/use-countdown";
import { computeScoring, type ScoringResult } from "@hooks/use-scoring";
import { JoinCodeDisplay } from "@components/join-code-display";
import { LobbyQuestionList } from "@components/lobby-question-list";
import { ParticipantList } from "@components/participant-list";
import { CountdownTimer } from "@components/countdown-timer";
import { AnswerDistribution } from "@components/answer-distribution";
import { Leaderboard } from "@components/leaderboard";
import { Podium } from "@components/podium";
import { Button } from "@switch-to-eu/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@switch-to-eu/ui/components/alert-dialog";
import type { DecryptedQuestion, DecryptedQuizData } from "@/lib/interfaces";
import type { QuizStateUpdate } from "@/server/db/types";

export default function QuizAdminPage() {
  const t = useTranslations("quiz");
  const tAdmin = useTranslations("admin");
  const params = useParams<{ id: string }>();
  const fragment = useFragment();

  const [quizData, setQuizData] = useState<DecryptedQuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DecryptedQuestion | null>(null);
  const [scoring, setScoring] = useState<ScoringResult | null>(null);
  const [latestUpdate, setLatestUpdate] = useState<QuizStateUpdate | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState<
    Array<{ index: number; encryptedQuestion: string; answers: NonNullable<QuizStateUpdate["answers"]>; timerSeconds: number; startedAt: string }>
  >([]);

  const encryptionKey = fragment.key || "";
  const adminToken = fragment.token || "";

  const startQuiz = api.quiz.startQuiz.useMutation();
  const showResults = api.quiz.showResults.useMutation();
  const nextQuestion = api.quiz.nextQuestion.useMutation();
  const finishQuiz = api.quiz.finishQuiz.useMutation();
  const deleteQuiz = api.quiz.delete.useMutation();
  const resetQuiz = api.quiz.resetQuiz.useMutation();

  // SSE subscription
  api.quiz.subscribe.useSubscription(
    { quizId: params.id },
    {
      enabled: !!params.id,
      onData: (data: QuizStateUpdate) => {
        void (async () => {
        setLatestUpdate(data);
        setIsTransitioning(false);

        // Decrypt quiz title
        if (encryptionKey && data.quiz.encryptedData && !quizData) {
          try {
            const decrypted = await decryptData<DecryptedQuizData>(data.quiz.encryptedData, encryptionKey);
            setQuizData(decrypted);
          } catch { /* ignore */ }
        }

        // Decrypt current question
        if (encryptionKey && data.currentQuestion) {
          try {
            const q = await decryptData<DecryptedQuestion>(data.currentQuestion.encryptedQuestion, encryptionKey);
            setCurrentQuestion(q);
          } catch { /* ignore */ }
        }

        // Accumulate answered questions for scoring
        if (data.quiz.state === "results" && data.currentQuestion && data.answers) {
          setAllAnsweredQuestions((prev) => {
            const exists = prev.some((q) => q.index === data.currentQuestion!.index);
            if (exists) {
              // Update existing with latest answers
              return prev.map((q) =>
                q.index === data.currentQuestion!.index
                  ? { ...q, answers: data.answers! }
                  : q
              );
            }
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

        // Compute scoring
        if ((data.quiz.state === "results" || data.quiz.state === "finished") && encryptionKey) {
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
    enabled: latestUpdate?.quiz.state === "active",
  });

  const handleStartQuiz = async () => {
    setIsTransitioning(true);
    try {
      await startQuiz.mutateAsync({ quizId: params.id, adminToken });
    } catch { setIsTransitioning(false); }
  };

  const handleShowResults = async () => {
    setIsTransitioning(true);
    try {
      await showResults.mutateAsync({ quizId: params.id, adminToken });
    } catch { setIsTransitioning(false); }
  };

  const handleNextQuestion = async () => {
    setIsTransitioning(true);
    try {
      await nextQuestion.mutateAsync({ quizId: params.id, adminToken });
    } catch { setIsTransitioning(false); }
  };

  const handleFinishQuiz = async () => {
    setIsTransitioning(true);
    try {
      await finishQuiz.mutateAsync({ quizId: params.id, adminToken });
    } catch { setIsTransitioning(false); }
  };

  const handleResetQuiz = async () => {
    setIsTransitioning(true);
    setScoring(null);
    setAllAnsweredQuestions([]);
    setCurrentQuestion(null);
    try {
      await resetQuiz.mutateAsync({ quizId: params.id, adminToken });
    } catch { setIsTransitioning(false); }
  };

  const handleDeleteQuiz = async () => {
    await deleteQuiz.mutateAsync({ quizId: params.id, adminToken });
    const locale = window.location.pathname.split("/")[1];
    window.location.href = `/${locale}`;
  };

  // No admin token
  if (!adminToken) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">Missing admin token. Use the admin URL from quiz creation.</p>
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
  const isLastQuestion = latestUpdate.quiz.currentQuestion >= latestUpdate.quiz.questionCount - 1;

  // Build share URL for join page
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${window.location.pathname.split("/")[1]}/join/${latestUpdate.quiz.joinCode}#key=${encodeURIComponent(encryptionKey)}`
    : "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {quizData && (
            <h1 className="font-bricolage text-2xl font-bold">{quizData.title}</h1>
          )}
          <p className="text-sm text-muted-foreground">{tAdmin("controlPanel")}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tAdmin("deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{tAdmin("deleteConfirm")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tAdmin("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDeleteQuiz()}
                className="bg-red-600 hover:bg-red-700"
              >
                {tAdmin("deleteQuiz")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Lobby */}
      {state === "lobby" && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <JoinCodeDisplay joinCode={latestUpdate.quiz.joinCode} shareUrl={shareUrl} />
          </div>

          <div className="rounded-lg border bg-white p-6">
            <LobbyQuestionList
              quizId={params.id}
              encryptionKey={encryptionKey}
              adminToken={adminToken}
              questionCount={latestUpdate.quiz.questionCount}
              version={latestUpdate.quiz.version}
              allQuestions={latestUpdate.allQuestions}
            />
          </div>

          <div className="rounded-lg border bg-white p-6">
            <ParticipantList participants={latestUpdate.participants} />
          </div>

          <Button
            size="lg"
            className="w-full gradient-primary text-white"
            onClick={handleStartQuiz}
            disabled={
              isTransitioning ||
              latestUpdate.quiz.questionCount === 0 ||
              latestUpdate.participants.length === 0
            }
          >
            {isTransitioning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {t("lobby.startQuiz")}
          </Button>

          {latestUpdate.quiz.questionCount === 0 && (
            <p className="text-sm text-amber-600 text-center">{t("lobby.needQuestions")}</p>
          )}
          {latestUpdate.participants.length === 0 && (
            <p className="text-sm text-amber-600 text-center">{t("lobby.needParticipants")}</p>
          )}
        </div>
      )}

      {/* Active - show question + live answer count */}
      {state === "active" && (
        <div className="space-y-6">
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
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-xl font-bold mb-4">{currentQuestion.text}</h2>
              <div className={`grid gap-2 ${currentQuestion.options.length >= 4 ? "grid-cols-2" : "grid-cols-1"}`}>
                {currentQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 text-sm ${
                      i === currentQuestion.correctIndex
                        ? "bg-green-100 border-2 border-green-300 font-semibold"
                        : "bg-gray-50 border"
                    }`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {latestUpdate.currentQuestion?.totalAnswers ?? 0} / {latestUpdate.participants.length} answered
              </span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            variant="outline"
            onClick={handleShowResults}
            disabled={isTransitioning}
          >
            {isTransitioning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="mr-2 h-4 w-4" />
            )}
            {t("results.showResults")}
          </Button>
        </div>
      )}

      {/* Results */}
      {state === "results" && (
        <div className="space-y-6">
          <h2 className="font-bricolage text-xl font-bold">{t("results.title")}</h2>

          {currentQuestion && scoring && (
            <div className="rounded-lg border bg-white p-6">
              <h3 className="font-semibold mb-4">{currentQuestion.text}</h3>
              {scoring.questionResults.find((q) => q.questionIndex === latestUpdate.quiz.currentQuestion) && (
                <AnswerDistribution
                  options={currentQuestion.options}
                  distribution={
                    scoring.questionResults.find((q) => q.questionIndex === latestUpdate.quiz.currentQuestion)!.distribution
                  }
                  correctIndex={
                    scoring.questionResults.find((q) => q.questionIndex === latestUpdate.quiz.currentQuestion)!.correctIndex
                  }
                />
              )}
            </div>
          )}

          {scoring && <Leaderboard entries={scoring.leaderboard} />}

          <div className="flex gap-3">
            {!isLastQuestion ? (
              <Button
                size="lg"
                className="flex-1 gradient-primary text-white"
                onClick={handleNextQuestion}
                disabled={isTransitioning}
              >
                {isTransitioning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SkipForward className="mr-2 h-4 w-4" />
                )}
                {t("results.nextQuestion")}
              </Button>
            ) : null}
            <Button
              size="lg"
              variant={isLastQuestion ? "default" : "outline"}
              className={`${isLastQuestion ? "flex-1 gradient-primary text-white" : ""}`}
              onClick={handleFinishQuiz}
              disabled={isTransitioning}
            >
              {isTransitioning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Flag className="mr-2 h-4 w-4" />
              )}
              {t("results.finishQuiz")}
            </Button>
          </div>
        </div>
      )}

      {/* Finished */}
      {state === "finished" && scoring && (
        <div className="space-y-8">
          <h1 className="font-bricolage text-3xl font-bold text-center">
            {t("finished.title")}
          </h1>
          <Podium entries={scoring.leaderboard} />
          <Leaderboard entries={scoring.leaderboard} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="lg"
                className="w-full gradient-primary text-white"
                disabled={isTransitioning}
              >
                {isTransitioning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                {tAdmin("resetQuiz")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{tAdmin("resetTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{tAdmin("resetConfirm")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tAdmin("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleResetQuiz()}>
                  {tAdmin("confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </main>
  );
}
