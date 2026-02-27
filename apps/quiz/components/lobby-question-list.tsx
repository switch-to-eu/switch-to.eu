"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Pencil, Check } from "lucide-react";
import { decryptData, encryptData } from "@switch-to-eu/db/crypto";

import { api } from "@/lib/trpc-client";
import { QuestionEditor } from "@components/question-editor";
import { Button } from "@switch-to-eu/ui/components/button";
import type { DecryptedQuestion } from "@/lib/interfaces";
import type { QuestionResponse } from "@/server/db/types";

interface LobbyQuestionListProps {
  quizId: string;
  encryptionKey: string;
  adminToken: string;
  questionCount: number;
  version: number;
  /** Encrypted questions pushed via SSE subscription */
  allQuestions?: QuestionResponse[];
}

export function LobbyQuestionList({
  quizId,
  encryptionKey,
  adminToken,
  questionCount,
  version,
  allQuestions,
}: LobbyQuestionListProps) {
  const tAdmin = useTranslations("admin");

  const [questions, setQuestions] = useState<DecryptedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateQuestionMutation = api.quiz.updateQuestion.useMutation();
  const addQuestionMutation = api.quiz.addQuestion.useMutation();
  const removeQuestionMutation = api.quiz.removeQuestion.useMutation();

  // Per-question debounce timers for saves
  const saveTimersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const prevVersionRef = useRef<number>(-1);

  // Decrypt questions from SSE subscription data — no extra HTTP fetches needed
  useEffect(() => {
    if (prevVersionRef.current === version) return;
    prevVersionRef.current = version;

    if (!encryptionKey || !allQuestions) {
      if (questionCount === 0) {
        setQuestions([]);
        setIsLoading(false);
      }
      return;
    }

    void (async () => {
      try {
        const decrypted: DecryptedQuestion[] = [];
        for (const q of allQuestions) {
          const d = await decryptData<DecryptedQuestion>(q.encryptedQuestion, encryptionKey);
          decrypted.push(d);
        }
        setQuestions(decrypted);
      } catch {
        // ignore decrypt errors
      } finally {
        setIsLoading(false);
      }
    })();
  }, [version, encryptionKey, allQuestions, questionCount]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = saveTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handleChange = (index: number, question: DecryptedQuestion) => {
    // Optimistic local update
    setQuestions(prev => prev.map((q, i) => (i === index ? question : q)));

    // Debounced save (per-question)
    const timers = saveTimersRef.current;
    const existing = timers.get(index);
    if (existing) clearTimeout(existing);

    setIsSaving(true);
    timers.set(index, setTimeout(() => {
      timers.delete(index);
      void (async () => {
        try {
          const encrypted = await encryptData(question, encryptionKey);
          await updateQuestionMutation.mutateAsync({
            quizId,
            adminToken,
            index,
            encryptedQuestion: encrypted,
          });
        } catch {
          // Next SSE push will correct the state
        } finally {
          if (timers.size === 0) setIsSaving(false);
        }
      })();
    }, 500));
  };

  const handleRemove = async (index: number) => {
    const prev = [...questions];
    setQuestions(prev.filter((_, i) => i !== index));

    try {
      await removeQuestionMutation.mutateAsync({ quizId, adminToken, index });
    } catch {
      setQuestions(prev);
    }
  };

  const handleDuplicate = async (index: number) => {
    const question = questions[index];
    if (!question) return;

    try {
      const encrypted = await encryptData(question, encryptionKey);
      const result = await addQuestionMutation.mutateAsync({
        quizId,
        adminToken,
        encryptedQuestion: encrypted,
      });
      if (result) {
        setQuestions(prev => [...prev, { ...question }]);
      }
    } catch {
      // ignore
    }
  };

  const handleAdd = async () => {
    const newQuestion: DecryptedQuestion = {
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    };

    try {
      const encrypted = await encryptData(newQuestion, encryptionKey);
      const result = await addQuestionMutation.mutateAsync({
        quizId,
        adminToken,
        encryptedQuestion: encrypted,
      });
      if (result) {
        setQuestions(prev => [...prev, newQuestion]);
      }
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  // Compact read-only view
  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {tAdmin("editQuestions")} ({questions.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {tAdmin("editButton")}
          </Button>
        </div>

        <div className="space-y-1.5">
          {questions.map((question, index) => (
            <div
              key={index}
              className="rounded-md border px-3 py-2 text-sm space-y-1"
            >
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground shrink-0">
                  {index + 1}.
                </span>
                <span className={question.text ? "font-medium" : "text-muted-foreground italic"}>
                  {question.text || "Empty question"}
                </span>
              </div>
              <div className="ml-5 grid grid-cols-2 gap-x-4 gap-y-0.5">
                {question.options.map((opt, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i === question.correctIndex ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                  >
                    {String.fromCharCode(65 + i)}) {opt || "—"}
                    {i === question.correctIndex ? " ✓" : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No questions yet
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full editor view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{tAdmin("editQuestions")}</h3>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {tAdmin("saving")}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            {tAdmin("doneButton")}
          </Button>
        </div>
      </div>

      {questions.map((question, index) => (
        <QuestionEditor
          key={index}
          index={index}
          question={question}
          onChange={(q) => handleChange(index, q)}
          onRemove={() => void handleRemove(index)}
          onDuplicate={() => void handleDuplicate(index)}
          canRemove={questions.length > 1}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => void handleAdd()}
        className="w-full"
        disabled={addQuestionMutation.isPending}
      >
        {addQuestionMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        {tAdmin("addQuestionLobby")}
      </Button>
    </div>
  );
}
