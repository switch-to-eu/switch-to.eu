"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { parseAdminFragment } from "@switch-to-eu/db/admin";
import { encryptData } from "@switch-to-eu/db/crypto";
import type { EncryptedGroupStructure } from "@/lib/interfaces";
import { useLoadGroup } from "@hooks/useLoadGroup";
import { useDeleteGroup } from "@hooks/useDeleteGroup";
import { api } from "@/lib/trpc-client";
import { calculateBalances, calculateSettlements } from "@/lib/settle";

import { MissingKeyError, GroupNotFoundError, DecryptionError } from "@components/error-states";
import { GroupLoading } from "@components/group-loading";
import { ExpenseList } from "@components/expense-list";
import { Balances } from "@components/balances";
import { Settlements } from "@components/settlements";
import { AddExpenseDialog } from "@components/add-expense-dialog";

import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-to-eu/ui/components/card";
import { Copy, Check, Trash2, Users, Plus, Link as LinkIcon } from "lucide-react";
import { useRouter } from "@switch-to-eu/i18n/navigation";

export default function AdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("AdminPage");

  const [adminToken, setAdminToken] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [newMember, setNewMember] = useState("");

  useEffect(() => {
    const { token, key } = parseAdminFragment(window.location.hash);
    setAdminToken(token);
    setEncryptionKey(key);
  }, []);

  const { group, state, error } = useLoadGroup(id);
  const { deleteGroup, isLoading: isDeleting } = useDeleteGroup();
  const updateGroupMutation = api.group.update.useMutation();

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/group/${id}#${encryptionKey}`
    : "";
  const adminUrl = typeof window !== "undefined"
    ? `${window.location.origin}/group/${id}/admin#token=${adminToken}&key=${encryptionKey}`
    : "";

  const handleCopy = useCallback(async (text: string, type: "share" | "admin") => {
    await navigator.clipboard.writeText(text);
    if (type === "share") {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    }
  }, []);

  const handleDelete = async () => {
    try {
      await deleteGroup(id, adminToken);
      toast.success(t("deleteSuccess"));
      router.push("/");
    } catch {
      toast.error("Failed to delete group");
    }
  };

  const handleAddMember = async () => {
    if (!group || !newMember.trim()) return;
    if (group.members.includes(newMember.trim())) return;

    const updatedMembers = [...group.members, newMember.trim()];
    const groupData: EncryptedGroupStructure = {
      name: group.name,
      currency: group.currency,
      members: updatedMembers,
    };

    try {
      const encrypted = await encryptData(groupData, encryptionKey);
      await updateGroupMutation.mutateAsync({
        id,
        adminToken,
        encryptedData: encrypted,
        expectedVersion: group.version,
      });
      setNewMember("");
      toast.success(t("updateSuccess"));
    } catch {
      toast.error("Failed to add member");
    }
  };

  if (!adminToken || !encryptionKey) return <MissingKeyError />;
  if (state === "loading") return <GroupLoading />;
  if (state === "not-found") return <GroupNotFoundError isAdmin />;
  if (state === "decryption-error") return <DecryptionError message={error} />;
  if (!group) return <GroupLoading />;

  const balances = calculateBalances(group.expenses, group.members);
  const settlements = calculateSettlements(balances);

  return (
    <div className="container mx-auto max-w-4xl py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            {group.name}
          </h1>
          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
            <Users className="h-3.5 w-3.5" />
            {group.members.length} members · {group.currency}
          </p>
        </div>
        <AddExpenseDialog
          groupId={id}
          encryptionKey={encryptionKey}
          members={group.members}
          currency={group.currency}
        />
      </div>

      {/* Share Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {t("shareLink")}
          </CardTitle>
          <CardDescription>{t("shareLinkDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-xs" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(shareUrl, "share")}
            >
              {copiedShare ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1">{copiedShare ? t("copied") : t("copyLink")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {t("adminLink")}
          </CardTitle>
          <CardDescription>{t("adminLinkDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={adminUrl} readOnly className="font-mono text-xs" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(adminUrl, "admin")}
            >
              {copiedAdmin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1">{copiedAdmin ? t("copied") : t("copyLink")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Members */}
      <Card>
        <CardHeader>
          <CardTitle>{t("addMembers")}</CardTitle>
          <CardDescription>{t("addMembersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {group.members.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium"
              >
                {m}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder={t("newMemberPlaceholder")}
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddMember();
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handleAddMember}>
              <Plus className="h-4 w-4 mr-1" />
              {t("addMemberButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settlements */}
      {group.expenses.length > 0 && (
        <Settlements settlements={settlements} currency={group.currency} />
      )}

      {/* Balances */}
      {group.expenses.length > 0 && (
        <Balances balances={balances} currency={group.currency} />
      )}

      {/* Expenses */}
      <ExpenseList expenses={group.expenses} currency={group.currency} />

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">{t("dangerZone")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!deleteConfirm ? (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("deleteGroup")}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{t("deleteConfirm")}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <LoadingButton
                  variant="destructive"
                  size="sm"
                  loading={isDeleting}
                  loadingText={t("deleting")}
                  onClick={handleDelete}
                >
                  {t("deleteButton")}
                </LoadingButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
