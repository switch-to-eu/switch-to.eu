"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { List, ShoppingCart, Users } from "lucide-react";

import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { Label } from "@switch-to-eu/ui/components/label";
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

import { api } from "@/lib/trpc-client";
import { generateEncryptionKey, encryptData } from "@switch-to-eu/db/crypto";
import { calculateExpirationDate } from "@switch-to-eu/db/expiration";
import { generateAdminUrl } from "@switch-to-eu/db/admin";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { LIST_PRESETS, type ListPreset } from "@/lib/schemas";
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

  const [preset, setPreset] = useState<ListPreset>("plain");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expirationDays, setExpirationDays] = useState(30);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const createMutation = api.list.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !acceptTerms) return;

    try {
      const encryptionKey = await generateEncryptionKey();

      const listData: DecryptedListData = {
        title: title.trim(),
        description: description.trim() || undefined,
      };
      const encryptedData = await encryptData(listData, encryptionKey);

      const expiresAt = calculateExpirationDate(new Date(), expirationDays);
      void expiresAt; // expiration is calculated server-side too

      const result = await createMutation.mutateAsync({
        encryptedData,
        preset,
        expirationDays,
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

  const isValid = title.trim().length > 0 && acceptTerms;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Preset Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t("presetLabel")}</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {LIST_PRESETS.map((p) => {
            const Icon = PRESET_ICONS[p];
            return (
              <Card
                key={p}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  preset === p
                    ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                    : "border-neutral-200 hover:border-neutral-300",
                )}
                onClick={() => setPreset(p)}
              >
                <CardHeader className="p-4 text-center">
                  <div
                    className={cn(
                      "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full",
                      preset === p
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
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-semibold">
          {t("titleLabel")}
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          maxLength={200}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold">
          {t("descriptionLabel")}
          <span className="ml-1 text-sm font-normal text-neutral-400">
            ({t("optional")})
          </span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          maxLength={500}
          rows={2}
        />
      </div>

      {/* Expiration */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">{t("expirationLabel")}</Label>
        <Select
          value={String(expirationDays)}
          onValueChange={(v) => setExpirationDays(Number(v))}
        >
          <SelectTrigger className="w-full">
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
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="terms" className="text-sm text-neutral-600 leading-relaxed cursor-pointer">
          {t("terms")}
        </Label>
      </div>

      {/* Submit */}
      <LoadingButton
        type="submit"
        loading={createMutation.isPending}
        loadingText={t("creating")}
        disabled={!isValid}
        className="w-full"
        size="lg"
      >
        {t("submit")}
      </LoadingButton>
    </form>
  );
}
