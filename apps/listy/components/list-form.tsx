"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { List, ShoppingCart, Users } from "lucide-react";

import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-to-eu/ui/components/card";
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
import { cn } from "@switch-to-eu/ui/lib/utils";
import {
  LIST_PRESETS,
  createListFormSchema,
  type CreateListFormData,
} from "@/lib/schemas";
import type { DecryptedListData } from "@/lib/types";

const PRESET_ICONS = {
  plain: List,
  shopping: ShoppingCart,
  potluck: Users,
} as const;

const EXPIRATION_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
  { value: 90, label: "3 months" },
];

export function ListForm() {
  const t = useTranslations("CreatePage");
  const locale = useLocale();
  const router = useRouter();

  const { control, handleSubmit, formState } = useForm<CreateListFormData>({
    resolver: zodResolver(createListFormSchema),
    defaultValues: {
      preset: "plain",
      title: "",
      description: "",
      expirationDays: 30,
      acceptTerms: undefined as unknown as true,
    },
    mode: "onTouched",
  });

  const createMutation = api.list.create.useMutation();

  const onSubmit = async (data: CreateListFormData) => {
    try {
      const encryptionKey = await generateEncryptionKey();

      const listData: DecryptedListData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
      };
      const encryptedData = await encryptData(listData, encryptionKey);

      const result = await createMutation.mutateAsync({
        encryptedData,
        preset: data.preset,
        expirationDays: data.expirationDays,
      });

      const adminUrl = generateAdminUrl(
        `/${locale}/list`,
        result.list.id,
        result.adminToken,
        encryptionKey,
      );

      toast.success(t("success"));
      router.push(adminUrl);
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Preset Selection */}
      <Controller
        name="preset"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel className="text-base font-semibold">
              {t("presetLabel")}
            </FieldLabel>
            <FieldContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {LIST_PRESETS.map((p) => {
                  const Icon = PRESET_ICONS[p];
                  return (
                    <Card
                      key={p}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        field.value === p
                          ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                          : "border-neutral-200 hover:border-neutral-300",
                      )}
                      onClick={() => field.onChange(p)}
                    >
                      <CardHeader className="p-4 text-center">
                        <div
                          className={cn(
                            "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full",
                            field.value === p
                              ? "bg-teal-100 text-teal-600"
                              : "bg-neutral-100 text-neutral-500",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-sm">
                          {t(`presets.${p}.title`)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {t(`presets.${p}.description`)}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </FieldContent>
          </Field>
        )}
      />

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
              <span className="ml-1 text-sm font-normal text-neutral-400">
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
                className="text-sm text-neutral-600 leading-relaxed cursor-pointer font-normal"
              >
                {t("terms")}
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
        className="w-full"
        size="lg"
      >
        {t("submit")}
      </LoadingButton>
    </form>
  );
}
