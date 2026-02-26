"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import {
  Flame,
  Eye,
  Lock,
  FileX,
  Plus,
  Check,
  Copy,
  AlertTriangle,
} from "lucide-react";

import { api } from "@/lib/trpc-client";
import { hashPassword } from "@/lib/crypto";

type NoteState =
  | { type: "loading" }
  | { type: "ready"; hasPassword: boolean; burnAfterReading: boolean }
  | { type: "revealed"; content: string; destroyed: boolean }
  | { type: "not_found" };

export default function ViewNotePage() {
  const t = useTranslations("ViewNote");
  const params = useParams<{ id: string }>();
  const noteId = params.id;

  const [state, setState] = useState<NoteState>({ type: "loading" });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if note exists
  const existsQuery = api.note.exists.useQuery(
    { id: noteId },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: state.type === "loading",
    },
  );

  // Update state based on query
  if (state.type === "loading" && existsQuery.data) {
    if (existsQuery.data.exists) {
      setState({
        type: "ready",
        hasPassword: existsQuery.data.hasPassword,
        burnAfterReading: existsQuery.data.burnAfterReading,
      });
    } else {
      setState({ type: "not_found" });
    }
  }

  if (state.type === "loading" && existsQuery.error) {
    setState({ type: "not_found" });
  }

  const readNote = api.note.read.useMutation({
    onSuccess: (data) => {
      setState({
        type: "revealed",
        content: data.content,
        destroyed: data.destroyed,
      });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        setPasswordError(true);
      } else {
        setState({ type: "not_found" });
      }
    },
  });

  const handleReveal = async () => {
    if (state.type !== "ready") return;

    const passwordHash =
      state.hasPassword && password
        ? await hashPassword(password)
        : undefined;

    readNote.mutate({
      id: noteId,
      passwordHash,
    });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (state.type === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        </div>
      </main>
    );
  }

  // Not found
  if (state.type === "not_found") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileX className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("notFound")}
          </h1>
          <p className="mt-3 text-gray-600">
            {t("notFoundDescription")}
          </p>
          <div className="mt-8">
            <Link href="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("returnHome")}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Revealed note
  if (state.type === "revealed") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Eye className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("noteContent")}
          </h1>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-800 leading-relaxed">
            {state.content}
          </pre>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(state.content)}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("copiedContent")}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t("copyContent")}
                </>
              )}
            </Button>
          </div>
        </div>

        {state.destroyed && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-4">
            <Flame className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{t("noteDestroyed")}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/create">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {t("returnHome")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // Ready to reveal (with optional password)
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <FileX className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        {/* Burn warning */}
        {state.burnAfterReading && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700">{t("revealWarning")}</p>
          </div>
        )}

        {/* Password input */}
        {state.hasPassword && (
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4" />
              {t("passwordRequired")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder={t("passwordPlaceholder")}
              autoComplete="off"
            />
            {passwordError && (
              <p className="mt-2 text-sm text-red-600">{t("wrongPassword")}</p>
            )}
          </div>
        )}

        <Button
          onClick={handleReveal}
          size="lg"
          className="w-full gradient-primary text-white border-0"
          disabled={readNote.isPending || (state.hasPassword && !password)}
        >
          {readNote.isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <Eye className="mr-2 h-5 w-5" />
              {state.hasPassword ? t("unlockButton") : t("revealButton")}
            </>
          )}
        </Button>
      </div>
    </main>
  );
}
