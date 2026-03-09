"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { decryptData } from "@switch-to-eu/db/crypto";
import { useFragment } from "@switch-to-eu/blocks/hooks/use-fragment";
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

import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";
import { api } from "@/lib/trpc-client";
import { hashPassword } from "@/lib/crypto";

type NoteState =
  | { type: "loading" }
  | { type: "ready"; hasPassword: boolean; burnAfterReading: boolean }
  | { type: "revealed"; content: string; destroyed: boolean }
  | { type: "not_found" }
  | { type: "decrypt_error" };

export default function ViewNotePage() {
  const t = useTranslations("ViewNote");
  const params = useParams<{ id: string }>();
  const noteId = params.id;

  const fragment = useFragment();
  const encryptionKey = fragment.params.key || null;

  const [state, setState] = useState<NoteState>({ type: "loading" });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Show not_found when fragment is parsed but key is missing
  if (fragment.ready && !encryptionKey && state.type === "loading") {
    setState({ type: "not_found" });
  }

  // Check if note exists
  const existsQuery = api.note.exists.useQuery(
    { id: noteId },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: state.type === "loading" && encryptionKey !== null,
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
    onSuccess: async (data) => {
      if (!encryptionKey) {
        setState({ type: "decrypt_error" });
        return;
      }
      try {
        const decryptedContent = await decryptData<string>(
          data.encryptedContent,
          encryptionKey,
        );
        setState({
          type: "revealed",
          content: decryptedContent,
          destroyed: data.destroyed,
        });
      } catch {
        setState({ type: "decrypt_error" });
      }
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
      <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-tool-accent/20 border-t-tool-primary" />
        </div>
      </Container>
    </PageLayout>
    );
  }

  // Not found or decrypt error
  if (state.type === "not_found" || state.type === "decrypt_error") {
    return (
      <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl uppercase text-foreground">
            {t("notFound")}
          </h1>
          <p className="mt-3 text-muted-foreground">
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
      </Container>
    </PageLayout>
    );
  }

  // Revealed note
  if (state.type === "revealed") {
    return (
      <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-tool-surface/10">
            <Eye className="h-8 w-8 text-tool-primary" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl uppercase text-foreground">
            {t("noteContent")}
          </h1>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground leading-relaxed">
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
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <Flame className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{t("noteDestroyed")}</p>
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
      </Container>
    </PageLayout>
    );
  }

  // Ready to reveal (with optional password)
  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-tool-surface/10">
          <FileX className="h-8 w-8 text-tool-primary" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl uppercase text-foreground">{t("title")}</h1>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Burn warning */}
        {state.burnAfterReading && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-tool-accent/20 bg-tool-surface/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-tool-accent" />
            <p className="text-sm text-tool-primary">{t("revealWarning")}</p>
          </div>
        )}

        {/* Password input */}
        {state.hasPassword && (
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
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
              <p className="mt-2 text-sm text-destructive">{t("wrongPassword")}</p>
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
    </Container>
    </PageLayout>
  );
}
