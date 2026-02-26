"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, AlertTriangle, LinkIcon, Pencil } from "lucide-react";

import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-to-eu/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@switch-to-eu/ui/components/dialog";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import { Badge } from "@switch-to-eu/ui/components/badge";

import { useList } from "@hooks/use-list";
import { ListItem } from "@components/list-item";
import { CategorySections } from "@components/category-sections";
import { parseAdminFragment } from "@switch-to-eu/db/admin";

interface ListViewProps {
  listId: string;
  isAdmin: boolean;
}

export function ListView({ listId, isAdmin }: ListViewProps) {
  const t = useTranslations("ListPage");
  const router = useRouter();

  const [adminToken, setAdminToken] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [claimName, setClaimName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(false);
  const pendingClaimItemId = useRef<string | null>(null);

  // Load claim name from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`list-${listId}-claim-name`);
    if (stored) setClaimName(stored);
  }, [listId]);

  // Parse admin token from fragment on mount
  useEffect(() => {
    if (!isAdmin) return;
    const fragment = window.location.hash.substring(1);
    if (fragment.includes("token=")) {
      const { token } = parseAdminFragment(window.location.hash);
      setAdminToken(token);
    }
  }, [isAdmin]);

  const {
    list,
    isLoading,
    isMutating,
    error,
    missingKey,
    encryptionKey,
    addItem,
    toggleItem,
    removeItem,
    claimItem,
    unclaimItem,
    deleteList,
  } = useList({ listId });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    try {
      await addItem(newItemText.trim());
      setNewItemText("");
    } catch {
      toast.error(t("addItemError"));
    }
  };

  const handleAddShoppingItem = async (text: string, category: string) => {
    try {
      await addItem(text, category);
    } catch {
      toast.error(t("addItemError"));
    }
  };

  const handleToggle = async (itemId: string, completed: boolean) => {
    try {
      await toggleItem(itemId, completed);
    } catch {
      toast.error(t("toggleError"));
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch {
      toast.error(t("removeError"));
    }
  };

  const handleClaim = useCallback(
    (itemId: string) => {
      if (claimName) {
        claimItem(itemId, claimName).catch(() => toast.error(t("claimError")));
      } else {
        pendingClaimItemId.current = itemId;
        setNameInput("");
        setShowNameDialog(true);
      }
    },
    [claimName, claimItem, t],
  );

  const handleNameSubmit = async () => {
    const name = nameInput.trim();
    if (!name) return;
    setClaimName(name);
    localStorage.setItem(`list-${listId}-claim-name`, name);
    setShowNameDialog(false);
    if (pendingClaimItemId.current) {
      try {
        await claimItem(pendingClaimItemId.current, name);
      } catch {
        toast.error(t("claimError"));
      }
      pendingClaimItemId.current = null;
    }
  };

  const handleEditName = () => {
    setNameInput(claimName);
    pendingClaimItemId.current = null;
    setShowNameDialog(true);
  };

  const handleUnclaim = async (itemId: string) => {
    try {
      await unclaimItem(itemId);
    } catch {
      toast.error(t("unclaimError"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteList(adminToken);
      toast.success(t("deleteSuccess"));
      setShowDeleteDialog(false);
      router.push("/");
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname.replace("/admin", "")}#${encryptionKey}`;
    navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
  };

  // --- States ---

  if (missingKey) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <CardTitle>{t("missingKey")}</CardTitle>
            <CardDescription>{t("missingKeyDescription")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>{t("errorTitle")}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!list) return null;

  const completedCount = list.items.filter((i) => i.completed).length;
  const totalCount = list.items.length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{list.title}</h1>
              {list.description && (
                <p className="mt-1 text-neutral-500">{list.description}</p>
              )}
            </div>
            <Badge variant="outline" className="shrink-0">
              {t(`presets.${list.preset}` as Parameters<typeof t>[0])}
            </Badge>
          </div>

          {totalCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
              <span>
                {t("progress", { completed: completedCount, total: totalCount })}
              </span>
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
              <LinkIcon className="mr-2 h-4 w-4" />
              {t("copyShareLink")}
            </Button>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("deleteList")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
                  <DialogDescription>{t("deleteConfirmDescription")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    {t("cancel")}
                  </Button>
                  <LoadingButton
                    variant="destructive"
                    onClick={handleDelete}
                    loading={isMutating}
                  >
                    {t("confirmDelete")}
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Claim name indicator for potluck lists */}
        {list.preset === "potluck" && claimName && (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>{t("claimingAs", { name: claimName })}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditName}
              className="h-6 px-1.5 text-neutral-400 hover:text-neutral-600"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Add item (non-shopping only — shopping has inline add per category) */}
        {list.preset !== "shopping" && (
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={t("addItemPlaceholder")}
              maxLength={500}
              className="flex-1"
            />
            <Button type="submit" disabled={!newItemText.trim() || isMutating}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Item list */}
        {list.preset === "shopping" ? (
          <CategorySections
            items={list.items}
            preset={list.preset}
            onToggle={handleToggle}
            onRemove={handleRemove}
            onAdd={handleAddShoppingItem}
            isMutating={isMutating}
          />
        ) : list.items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-400">{t("emptyList")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {list.items.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                preset={list.preset}
                onToggle={handleToggle}
                onRemove={handleRemove}
                onClaim={handleClaim}
                onUnclaim={handleUnclaim}
              />
            ))}
          </div>
        )}

        {/* Name dialog for potluck claims */}
        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("nameDialogTitle")}</DialogTitle>
              <DialogDescription>{t("nameDialogDescription")}</DialogDescription>
            </DialogHeader>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              placeholder={t("claimPlaceholder")}
              maxLength={100}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNameDialog(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleNameSubmit} disabled={!nameInput.trim()}>
                {t("nameDialogConfirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
