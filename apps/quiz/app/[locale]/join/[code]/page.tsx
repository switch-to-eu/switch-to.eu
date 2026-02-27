"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/trpc-client";
import { useFragment } from "@hooks/use-fragment";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";

export default function JoinQuizPage() {
  const t = useTranslations("join");
  const params = useParams<{ code: string }>();
  const fragment = useFragment();

  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveCode = api.quiz.resolveJoinCode.useQuery(
    { joinCode: params.code.toUpperCase() },
    { retry: false }
  );

  const joinMutation = api.quiz.join.useMutation();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !resolveCode.data || isJoining) return;

    setIsJoining(true);
    setError(null);

    try {
      const result = await joinMutation.mutateAsync({
        quizId: resolveCode.data.quizId,
        nickname: nickname.trim(),
      });

      if (result.quiz.state === "finished") {
        setError(t("quizAlreadyFinished"));
        setIsJoining(false);
        return;
      }

      // Store session ID in sessionStorage
      sessionStorage.setItem(`quiz-session-${resolveCode.data.quizId}`, result.sessionId);

      // Redirect to quiz page with encryption key from fragment
      const locale = window.location.pathname.split("/")[1];
      const keyParam = fragment.key ? `key=${encodeURIComponent(fragment.key)}` : "";
      window.location.href = `/${locale}/quiz/${resolveCode.data.quizId}#${keyParam}`;
    } catch {
      setError("Failed to join quiz. Please try again.");
      setIsJoining(false);
    }
  };

  if (resolveCode.isLoading) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </main>
    );
  }

  if (resolveCode.error) {
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="font-bricolage text-2xl font-bold mb-4 text-red-600">
          {t("quizNotFound")}
        </h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="font-bricolage text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
            {t("nickname")}
          </label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t("nicknamePlaceholder")}
            maxLength={30}
            required
            autoFocus
            disabled={isJoining}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full gradient-primary text-white"
          disabled={isJoining || !nickname.trim()}
        >
          {isJoining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("joining")}
            </>
          ) : (
            t("joinButton")
          )}
        </Button>
      </form>
    </main>
  );
}
