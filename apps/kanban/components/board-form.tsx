"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@switch-to-eu/ui/components/select";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@switch-to-eu/ui/components/field";

import { api } from "@/lib/trpc-client";
import { generateEncryptionKey, encryptData } from "@switch-to-eu/db/crypto";
import { generateAdminUrl } from "@switch-to-eu/db/admin";
import {
  createBoardFormSchema,
  type CreateBoardFormData,
} from "@/lib/schemas";
import type { DecryptedBoardData, DecryptedColumnMeta, DecryptedCardData } from "@/lib/types";

const EXPIRATION_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
  { value: 90, label: "3 months" },
];

const DEFAULT_COLUMNS: DecryptedColumnMeta[] = [
  { title: "To Do", color: "gray" },
  { title: "In Progress", color: "blue" },
  { title: "Done", color: "green" },
];

export function BoardForm() {
  const t = useTranslations("CreatePage");
  const v = useTranslations("validation");
  const locale = useLocale();
  const router = useRouter();

  const { control, handleSubmit, formState } = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardFormSchema({
      required: v("required"),
      maxLength: v("maxLength"),
      min: v("min"),
      max: v("max"),
    })),
    defaultValues: {
      title: "",
      description: "",
      expirationDays: 30,
      acceptTerms: undefined as unknown as true,
    },
    mode: "onTouched",
  });

  const createMutation = api.board.create.useMutation();

  const onSubmit = async (data: CreateBoardFormData) => {
    try {
      const encryptionKey = await generateEncryptionKey();

      const boardData: DecryptedBoardData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
      };
      const encryptedData = await encryptData(boardData, encryptionKey);

      // Encrypt default columns (meta + empty cards array)
      const emptyCards: DecryptedCardData[] = [];
      const columns = await Promise.all(
        DEFAULT_COLUMNS.map(async (col) => ({
          encryptedMeta: await encryptData(col, encryptionKey),
          encryptedCards: await encryptData(emptyCards, encryptionKey),
        })),
      );

      const result = await createMutation.mutateAsync({
        encryptedData,
        columns,
        expirationDays: data.expirationDays,
      });

      const adminUrl = generateAdminUrl(
        `/${locale}/board`,
        result.board.id,
        result.adminToken,
        encryptionKey,
      );

      toast.success(t("success"));
      window.scrollTo(0, 0);
      router.push(adminUrl);
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Title */}
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="text-base font-semibold">
              {t("titleLabel")}
            </FieldLabel>
            <FieldContent>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t("titlePlaceholder")}
                maxLength={200}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </FieldContent>
          </Field>
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="text-base font-semibold">
              {t("descriptionLabel")}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({t("optional")})
              </span>
            </FieldLabel>
            <FieldContent>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t("descriptionPlaceholder")}
                maxLength={500}
                rows={2}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </FieldContent>
          </Field>
        )}
      />

      {/* Expiration */}
      <Controller
        name="expirationDays"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-base font-semibold">
              {t("expirationLabel")}
            </FieldLabel>
            <FieldContent>
              <Select
                name={field.name}
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </FieldContent>
          </Field>
        )}
      />

      {/* Terms */}
      <Controller
        name="acceptTerms"
        control={control}
        render={({ field, fieldState }) => (
          <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <Checkbox
              id={field.name}
              checked={field.value === true}
              onCheckedChange={(checked) =>
                field.onChange(checked === true ? true : undefined)
              }
              aria-invalid={fieldState.invalid}
              className="mt-0.5"
            />
            <FieldContent>
              <FieldLabel
                htmlFor={field.name}
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer font-normal"
              >
                <span>
                  {t.rich("terms", {
                    terms: (chunks) => (
                      <a href="https://www.switch-to.eu/terms" target="_blank" rel="noopener noreferrer" className="underline text-foreground hover:text-tool-primary">
                        {chunks}
                      </a>
                    ),
                    privacy: (chunks) => (
                      <a href="https://www.switch-to.eu/privacy" target="_blank" rel="noopener noreferrer" className="underline text-foreground hover:text-tool-primary">
                        {chunks}
                      </a>
                    ),
                  })}
                </span>
              </FieldLabel>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </FieldContent>
          </Field>
        )}
      />

      {/* Submit */}
      <LoadingButton
        type="submit"
        loading={createMutation.isPending}
        loadingText={t("creating")}
        disabled={!formState.isValid}
        className="w-full rounded-full bg-tool-primary hover:bg-tool-primary/90 text-white"
        size="lg"
      >
        {t("submit")}
      </LoadingButton>
    </form>
  );
}
