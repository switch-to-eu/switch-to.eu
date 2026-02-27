"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Flame, Lock } from "lucide-react";
import { generateEncryptionKey, encryptData } from "@switch-to-eu/db/crypto";

import { api } from "@/lib/trpc-client";
import { hashPassword } from "@/lib/crypto";
import {
  createNoteSchema,
  EXPIRY_OPTIONS,
  type CreateNoteFormData,
} from "@/lib/schemas";
import { Button } from "@switch-to-eu/ui/components/button";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import { Input } from "@switch-to-eu/ui/components/input";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldDescription,
} from "@switch-to-eu/ui/components/field";

export function CreateNoteForm() {
  const t = useTranslations("CreatePage");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch } = useForm<CreateNoteFormData>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      content: "",
      expiry: "24h",
      burnAfterReading: true,
      password: "",
    },
  });

  const contentLength = watch("content").length;

  const createNote = api.note.create.useMutation({
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CreateNoteFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const encryptionKey = await generateEncryptionKey();
    const encryptedContent = await encryptData(data.content.trim(), encryptionKey);
    const passwordHash = data.password ? await hashPassword(data.password) : undefined;

    createNote.mutate(
      {
        encryptedContent,
        expiry: data.expiry,
        burnAfterReading: data.burnAfterReading,
        passwordHash,
      },
      {
        onSuccess: (result) => {
          const fragment = `key=${encodeURIComponent(encryptionKey)}&expires=${encodeURIComponent(result.expiresAt)}&burn=${result.burnAfterReading}`;
          window.location.href = `/${window.location.pathname.split("/")[1]}/note/${result.noteId}/share#${fragment}`;
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Note content */}
      <Controller
        name="content"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              {t("contentLabel")}
            </FieldLabel>
            <FieldContent>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t("contentPlaceholder")}
                rows={8}
                maxLength={50000}
                className="resize-y font-mono"
              />
              <div className="flex items-center justify-between">
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <span />
                )}
                <p className="text-right text-xs text-gray-400">
                  {contentLength.toLocaleString()} / 50,000
                </p>
              </div>
            </FieldContent>
          </Field>
        )}
      />

      {/* Expiry selector */}
      <Controller
        name="expiry"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>{t("expiryLabel")}</FieldLabel>
            <FieldContent>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => field.onChange(option)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      field.value === option
                        ? "border-amber-600 bg-amber-50 text-amber-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {t(`expiryOptions.${option}`)}
                  </button>
                ))}
              </div>
            </FieldContent>
          </Field>
        )}
      />

      {/* Burn after reading */}
      <Controller
        name="burnAfterReading"
        control={control}
        render={({ field }) => (
          <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-4">
            <div className="mt-0.5">
              <Flame className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <Field orientation="horizontal">
                <Checkbox
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldContent>
                  <FieldLabel htmlFor={field.name} className="text-sm font-medium text-gray-900">
                    {t("burnAfterReading")}
                  </FieldLabel>
                  <FieldDescription className="text-xs text-gray-500">
                    {t("burnAfterReadingDescription")}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>
          </div>
        )}
      />

      {/* Optional password */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t("passwordLabel")}
            </FieldLabel>
            <FieldContent>
              <Input
                {...field}
                id={field.name}
                type="password"
                placeholder={t("passwordPlaceholder")}
                autoComplete="off"
              />
            </FieldContent>
          </Field>
        )}
      />

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full gradient-primary text-white border-0"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("creatingButton") : t("createButton")}
      </Button>
    </form>
  );
}
