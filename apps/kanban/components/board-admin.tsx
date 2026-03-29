"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Copy, AlertTriangle, Lock } from "lucide-react";

import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-to-eu/ui/components/card";
import { useBoard } from "@hooks/use-board";
import { useFragment } from "@switch-to-eu/blocks/hooks/use-fragment";
import type { DecryptedColumnMeta } from "@/lib/types";

interface BoardAdminProps {
  boardId: string;
}

export function BoardAdmin({ boardId }: BoardAdminProps) {
  const t = useTranslations("AdminPage");
  const router = useRouter();
  const fragment = useFragment();

  const adminToken = fragment.params.token || "";
  const encryptionKey = fragment.params.key || "";
  const missingKey = fragment.ready && (!encryptionKey || !adminToken);

  const {
    board,
    isLoading,
    error,
    addColumn,
    updateColumn: _updateColumn,
    removeColumn,
    deleteBoard,
  } = useBoard({ boardId, adminToken });

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddColumn = useCallback(async () => {
    if (!newColumnTitle.trim()) return;

    const columnData: DecryptedColumnMeta = {
      title: newColumnTitle.trim(),
      color: "gray",
    };

    try {
      await addColumn(columnData);
      setNewColumnTitle("");
    } catch {
      toast.error(t("addColumnError"));
    }
  }, [newColumnTitle, addColumn, t]);

  const handleRemoveColumn = useCallback(
    async (columnId: string) => {
      if (!confirm(t("removeColumnConfirmDescription"))) return;

      try {
        await removeColumn(columnId);
      } catch {
        toast.error(t("removeColumnError"));
      }
    },
    [removeColumn, t],
  );

  const handleDeleteBoard = useCallback(async () => {
    if (!confirm(t("deleteBoardConfirmDescription"))) return;

    setIsDeleting(true);
    try {
      await deleteBoard(adminToken);
      toast.success(t("deleteSuccess"));
      router.push("/");
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  }, [adminToken, deleteBoard, router, t]);

  const copyAdminLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#token=${adminToken}&key=${encryptionKey}`;
    void navigator.clipboard.writeText(url);
    toast.success(t("adminLinkCopied"));
  }, [adminToken, encryptionKey, t]);

  const copyShareLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const boardPath = window.location.pathname.replace("/admin", "");
    const url = `${baseUrl}${boardPath}#key=${encryptionKey}`;
    void navigator.clipboard.writeText(url);
    toast.success(t("adminLinkCopied"));
  }, [encryptionKey, t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-tool-primary" />
      </div>
    );
  }

  if (missingKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Invalid Admin Link</h2>
        <p className="text-muted-foreground max-w-md">This link is missing credentials. Please use the admin link provided when the board was created.</p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{error || "Board not found"}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{board.title}</p>
        </div>

        {/* Share links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Share</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Board Link
            </Button>
            <Button variant="outline" size="sm" onClick={copyAdminLink}>
              <Copy className="mr-2 h-4 w-4" />
              {t("shareAdminLink")}
            </Button>
          </CardContent>
        </Card>

        {/* Manage columns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("manageColumns")}</CardTitle>
            <CardDescription>{t("reorderColumns")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {board.columns.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{col.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveColumn(col.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add new column */}
            <div className="flex items-center gap-2 pt-2">
              <Input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder={t("columnTitlePlaceholder")}
                maxLength={100}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleAddColumn();
                  }
                }}
              />
              <Button
                onClick={handleAddColumn}
                disabled={!newColumnTitle.trim()}
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                {t("addColumn")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">{t("deleteBoard")}</CardTitle>
            <CardDescription>{t("deleteBoardConfirmDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteBoard}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("deleteBoard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
