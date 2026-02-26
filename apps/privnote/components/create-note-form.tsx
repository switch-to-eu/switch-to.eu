"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@switch-to-eu/i18n/navigation";
import { Flame, Lock } from "lucide-react";

import { api } from "@/lib/trpc-client";
import { hashPassword } from "@/lib/crypto";
import { Button } from "@switch-to-eu/ui/components/button";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import { Input } from "@switch-to-eu/ui/components/input";

const EXPIRY_OPTIONS = ["5m", "30m", "1h", "24h", "7d"] as const;

export function CreateNoteForm() {
  const t = useTranslations("CreatePage");
  const router = useRouter();

  const [content, setContent] = useState("");
  const [expiry, setExpiry] = useState<(typeof EXPIRY_OPTIONS)[number]>("24h");
  const [burnAfterReading, setBurnAfterReading] = useState(true);
  const [password, setPassword] = useState("");

  const createNote = api.note.create.useMutation({
    onSuccess: (data) => {
      router.push(`/note/${data.noteId}/share?expires=${data.expiresAt}&burn=${data.burnAfterReading}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const passwordHash = password ? await hashPassword(password) : undefined;

    createNote.mutate({
      content: content.trim(),
      expiry,
      burnAfterReading,
      passwordHash,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Note content */}
      <div>
        <label
          htmlFor="note-content"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {t("contentLabel")}
        </label>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("contentPlaceholder")}
          rows={8}
          maxLength={50000}
          className="resize-y font-mono"
          required
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {content.length.toLocaleString()} / 50,000
        </p>
      </div>

      {/* Expiry selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t("expiryLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          {EXPIRY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setExpiry(option)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                expiry === option
                  ? "border-amber-600 bg-amber-50 text-amber-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {t(`expiryOptions.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Burn after reading */}
      <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-4">
        <div className="mt-0.5">
          <Flame className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex-1">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={burnAfterReading}
              onChange={(e) => setBurnAfterReading(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-900">
              {t("burnAfterReading")}
            </span>
          </label>
          <p className="mt-1 ml-7 text-xs text-gray-500">
            {t("burnAfterReadingDescription")}
          </p>
        </div>
      </div>

      {/* Optional password */}
      <div>
        <label
          htmlFor="note-password"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <Lock className="h-4 w-4" />
          {t("passwordLabel")}
        </label>
        <Input
          id="note-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("passwordPlaceholder")}
          autoComplete="off"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full gradient-primary text-white border-0"
        disabled={!content.trim() || createNote.isPending}
      >
        {createNote.isPending ? t("creatingButton") : t("createButton")}
      </Button>
    </form>
  );
}
