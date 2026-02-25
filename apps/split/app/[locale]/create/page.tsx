"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { generateEncryptionKey, encryptData } from "@/lib/crypto";
import type { EncryptedGroupStructure } from "@/lib/interfaces";
import { toast } from "sonner";
import { api } from "@/lib/trpc-client";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import { Link, useRouter } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { Label } from "@switch-to-eu/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-to-eu/ui/components/card";
import { Plus, X, Users } from "lucide-react";

const CURRENCIES = [
  { code: "EUR", label: "EUR (€)" },
  { code: "USD", label: "USD ($)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "CHF", label: "CHF" },
  { code: "SEK", label: "SEK (kr)" },
  { code: "NOK", label: "NOK (kr)" },
  { code: "DKK", label: "DKK (kr)" },
  { code: "PLN", label: "PLN (zł)" },
  { code: "CZK", label: "CZK (Kč)" },
];

export default function CreateGroup() {
  const router = useRouter();
  const t = useTranslations("CreatePage");
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [members, setMembers] = useState<string[]>(["", ""]);
  const [newMemberInput, setNewMemberInput] = useState("");

  const createGroupMutation = api.group.create.useMutation();

  const handleAddMember = () => {
    const name = newMemberInput.trim();
    if (name && !members.includes(name)) {
      setMembers([...members, name]);
      setNewMemberInput("");
    }
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const validMembers = members.filter((m) => m.trim() !== "");
  const canSubmit =
    termsAccepted &&
    groupName.trim() !== "" &&
    validMembers.length >= 2 &&
    new Set(validMembers).size === validMembers.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);

    try {
      const encryptionKey = generateEncryptionKey();

      const groupData: EncryptedGroupStructure = {
        name: groupName.trim(),
        currency,
        members: validMembers,
      };

      const encryptedData = await encryptData(groupData, encryptionKey);

      const response = await createGroupMutation.mutateAsync({
        encryptedData,
      });

      const { group, adminToken } = response;

      const adminUrl = `/group/${group.id}/admin#token=${adminToken}&key=${encryptionKey}`;

      toast.success(t("successMessage"));
      router.push(adminUrl);
    } catch {
      toast.error(t("errorMessage"));
      setIsLoading(false);
    }
  };

  return (
    <div className="py-4 sm:py-8 lg:py-12">
      <div className="container mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <Card>
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">{t("groupName")}</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={t("groupNamePlaceholder")}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t("currency")}</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>{t("members")}</CardTitle>
              <CardDescription>{t("membersDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    placeholder={t("memberPlaceholder")}
                    maxLength={50}
                  />
                  {members.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(index)}
                      className="shrink-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  placeholder={t("memberPlaceholder")}
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMember}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("addMember")}
                </Button>
              </div>

              {validMembers.length < 2 && (
                <p className="text-sm text-amber-600">{t("minMembers")}</p>
              )}
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-neutral-600 leading-tight cursor-pointer"
            >
              {t.rich("termsLabel", {
                link: (chunks) => (
                  <Link
                    href="/privacy"
                    className="text-emerald-600 hover:text-emerald-500 underline"
                    target="_blank"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </label>
          </div>

          {/* Submit */}
          <LoadingButton
            type="submit"
            loading={isLoading}
            disabled={!canSubmit}
            loadingText={t("loadingText")}
            className="w-full"
          >
            <Users className="mr-2 h-5 w-5" />
            {t("submitText")}
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
