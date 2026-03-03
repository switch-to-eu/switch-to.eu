"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  Plus,
  AlertTriangle,
  Lock,
  Trash2,
  X,
  Settings,
} from "lucide-react";
import { Kanban } from "react-kanban-kit";
import type { BoardItem } from "react-kanban-kit";

import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@switch-to-eu/ui/components/alert-dialog";
import { useBoard } from "@hooks/use-board";
import { useFragment } from "@switch-to-eu/blocks/hooks/use-fragment";
import { toBoardData } from "@/lib/board-helpers";
import { KanbanCard } from "@components/kanban-card";
import { CardDetailDialog } from "@components/card-detail-dialog";
import type { DecryptedCardData, DecryptedColumnMeta } from "@/lib/types";

interface BoardViewProps {
  boardId: string;
  isAdmin?: boolean;
}

/* ── Inline editable column title (admin only) ── */
function EditableColumnTitle({
  title,
  onSave,
}: {
  title: string;
  onSave: (newTitle: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== title) {
      onSave(trimmed);
    } else {
      setValue(title);
    }
  };

  if (!editing) {
    return (
      <h3
        className="font-semibold text-sm cursor-pointer hover:bg-muted rounded px-1 -mx-1"
        onClick={() => setEditing(true)}
      >
        {title}
      </h3>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setValue(title);
          setEditing(false);
        }
      }}
      className="h-6 text-sm font-semibold px-1 py-0 w-28"
      maxLength={100}
    />
  );
}

/* ── Inline quick-add card input (bottom of each column) ── */
function QuickAddCard({
  onAdd,
  placeholder,
}: {
  onAdd: (title: string) => void;
  placeholder: string;
}) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
      // Keep input active for rapid entry
    }
  };

  const cancel = () => {
    setValue("");
    setActive(false);
  };

  if (!active) {
    return (
      <button
        type="button"
        className="flex items-center gap-1 w-full rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        onClick={() => setActive(true)}
      >
        <Plus className="h-4 w-4" />
        {placeholder}
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") cancel();
        }}
        onBlur={() => {
          // Delay so button click can fire
          setTimeout(() => {
            if (!value.trim()) cancel();
          }, 150);
        }}
        placeholder={placeholder}
        maxLength={200}
        className="h-8 text-sm"
      />
      <div className="flex items-center gap-1">
        <Button size="sm" className="h-7 text-xs" onClick={submit} disabled={!value.trim()}>
          {placeholder}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={cancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ── Main board view ── */
export function BoardView({ boardId, isAdmin = false }: BoardViewProps) {
  const t = useTranslations("BoardPage");
  const tAdmin = useTranslations("AdminPage");
  const router = useRouter();
  const fragment = useFragment();

  const adminToken = isAdmin ? (fragment.params.token || "") : "";

  const {
    board,
    isLoading,
    error,
    missingKey,
    encryptionKey,
    addCard,
    updateCard,
    removeCard,
    moveCard,
    addColumn,
    updateColumn,
    removeColumn,
    deleteBoard,
  } = useBoard({ boardId, adminToken });

  const [editingCard, setEditingCard] = useState<{
    id: string;
    columnId: string;
    data: DecryptedCardData;
  } | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteColumn, setConfirmDeleteColumn] = useState<string | null>(null);
  const [confirmDeleteBoard, setConfirmDeleteBoard] = useState(false);
  const addColumnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingColumn) addColumnInputRef.current?.focus();
  }, [addingColumn]);

  // Convert decrypted board to react-kanban-kit format
  const boardData = useMemo(() => {
    if (!board) return null;
    return toBoardData(board);
  }, [board]);

  const handleCardMove = useCallback(
    async ({
      cardId,
      fromColumnId,
      toColumnId,
      position,
    }: {
      cardId: string;
      fromColumnId: string;
      toColumnId: string;
      taskAbove: string | null;
      taskBelow: string | null;
      position: number;
    }) => {
      try {
        await moveCard(cardId, fromColumnId, toColumnId, position);
      } catch {
        toast.error(t("moveCardError"));
      }
    },
    [moveCard, t],
  );

  const handleQuickAdd = useCallback(
    async (columnId: string, title: string) => {
      try {
        await addCard(columnId, { title });
      } catch {
        toast.error(t("addCardError"));
      }
    },
    [addCard, t],
  );

  const handleUpdateCard = useCallback(
    async (columnId: string, cardId: string, data: Omit<DecryptedCardData, "id">) => {
      setEditingCard(null);
      try {
        await updateCard(columnId, cardId, data);
      } catch {
        toast.error(t("updateCardError"));
      }
    },
    [updateCard, t],
  );

  const handleRemoveCard = useCallback(
    async (columnId: string, cardId: string) => {
      setEditingCard(null);
      try {
        await removeCard(columnId, cardId);
      } catch {
        toast.error(t("removeCardError"));
      }
    },
    [removeCard, t],
  );

  const handleRenameColumn = useCallback(
    async (columnId: string, newTitle: string) => {
      const col = board?.columns.find((c) => c.id === columnId);
      if (!col) return;

      const columnMeta: DecryptedColumnMeta = {
        title: newTitle,
        color: col.color,
      };

      try {
        await updateColumn(columnId, columnMeta);
      } catch {
        toast.error(tAdmin("updateError"));
      }
    },
    [board, updateColumn, tAdmin],
  );

  const handleAddColumn = useCallback(async () => {
    if (!newColumnTitle.trim()) return;

    const columnMeta: DecryptedColumnMeta = {
      title: newColumnTitle.trim(),
      color: "gray",
    };

    try {
      await addColumn(columnMeta);
      setNewColumnTitle("");
      setAddingColumn(false);
    } catch {
      toast.error(tAdmin("addColumnError"));
    }
  }, [newColumnTitle, addColumn, tAdmin]);

  const handleRemoveColumn = useCallback(
    async (columnId: string) => {
      try {
        await removeColumn(columnId);
      } catch {
        toast.error(tAdmin("removeColumnError"));
      }
    },
    [removeColumn, tAdmin],
  );

  const handleDeleteBoard = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteBoard(adminToken);
      toast.success(tAdmin("deleteSuccess"));
      router.push("/");
    } catch {
      toast.error(tAdmin("deleteError"));
    } finally {
      setIsDeleting(false);
      setConfirmDeleteBoard(false);
    }
  }, [adminToken, deleteBoard, router, tAdmin]);

  const copyShareLink = useCallback(() => {
    const boardPath = window.location.pathname.replace("/admin", "");
    const url = `${window.location.origin}${boardPath}#key=${encryptionKey}`;
    navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
  }, [encryptionKey, t]);

  const copyAdminLink = useCallback(() => {
    const boardPath = window.location.pathname.replace("/admin", "");
    const url = `${window.location.origin}${boardPath}/admin#token=${adminToken}&key=${encryptionKey}`;
    navigator.clipboard.writeText(url);
    toast.success(tAdmin("adminLinkCopied"));
  }, [adminToken, encryptionKey, tAdmin]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-tool-primary" />
      </div>
    );
  }

  // Missing encryption key
  if (missingKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("missingKey")}</h2>
        <p className="text-muted-foreground max-w-md">
          {t("missingKeyDescription")}
        </p>
      </div>
    );
  }

  // Error state
  if (error || !board || !boardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("errorTitle")}</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const configMap = {
    card: {
      render: ({ data: item }: { data: BoardItem }) => {
        const col = board.columns.find((c) => c.id === item.parentId);
        const card = col?.cards.find((c) => c.id === item.id);
        if (!col || !card) return null;

        return (
          <KanbanCard
            cardId={card.id}
            data={{
              title: card.title,
              description: card.description,
              labels: card.labels,
              dueDate: card.dueDate,
            }}
            onClick={() =>
              setEditingCard({
                id: card.id,
                columnId: col.id,
                data: card,
              })
            }
          />
        );
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      {/* Board header */}
      <div className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-muted-foreground">{board.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={copyAdminLink}>
                <Settings className="mr-2 h-4 w-4" />
                {tAdmin("shareAdminLink")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Copy className="mr-2 h-4 w-4" />
              {t("copyShareLink")}
            </Button>
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDeleteBoard(true)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {tAdmin("deleteBoard")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex overflow-x-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 gap-0 items-start">
        <Kanban
          dataSource={boardData}
          configMap={configMap}
          onCardMove={handleCardMove}
          renderColumnHeader={(column) => {
            const col = board.columns.find((c) => c.id === column.id);
            return (
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <EditableColumnTitle
                      title={col?.title || column.title}
                      onSave={(newTitle) =>
                        handleRenameColumn(column.id, newTitle)
                      }
                    />
                  ) : (
                    <h3 className="font-semibold text-sm">
                      {col?.title || column.title}
                    </h3>
                  )}
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {column.children.length}
                  </span>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmDeleteColumn(column.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          }}
          renderListFooter={(column) => (
            <div className="px-2 pb-2 pt-1">
              <QuickAddCard
                onAdd={(title) => handleQuickAdd(column.id, title)}
                placeholder={t("addCard")}
              />
            </div>
          )}
        />

        {/* Add list — right side, Trello-style (admin only) */}
        {isAdmin && (
          <div className="shrink-0 w-[272px] ml-2">
            {addingColumn ? (
              <div className="rounded-xl border bg-card p-2 space-y-1.5">
                <Input
                  ref={addColumnInputRef}
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder={tAdmin("columnTitlePlaceholder")}
                  maxLength={100}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddColumn();
                    }
                    if (e.key === "Escape") {
                      setNewColumnTitle("");
                      setAddingColumn(false);
                    }
                  }}
                  className="h-8 text-sm"
                />
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAddColumn}
                    disabled={!newColumnTitle.trim()}
                  >
                    {tAdmin("addColumn")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setNewColumnTitle("");
                      setAddingColumn(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="flex items-center gap-2 w-full rounded-xl border border-dashed border-border bg-muted hover:bg-muted px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setAddingColumn(true)}
              >
                <Plus className="h-4 w-4" />
                {tAdmin("addColumn")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card detail modal (edit/view) — only when clicking an existing card */}
      {editingCard && (
        <CardDetailDialog
          data={editingCard.data}
          onSave={(data) => handleUpdateCard(editingCard.columnId, editingCard.id, data)}
          onClose={() => setEditingCard(null)}
          onDelete={() => handleRemoveCard(editingCard.columnId, editingCard.id)}
        />
      )}

      {/* Confirm remove column */}
      <AlertDialog open={!!confirmDeleteColumn} onOpenChange={(open) => { if (!open) setConfirmDeleteColumn(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tAdmin("removeColumnConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tAdmin("removeColumnConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tAdmin("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteColumn) handleRemoveColumn(confirmDeleteColumn);
                setConfirmDeleteColumn(null);
              }}
            >
              {tAdmin("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete board */}
      <AlertDialog open={confirmDeleteBoard} onOpenChange={setConfirmDeleteBoard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tAdmin("deleteBoardConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tAdmin("deleteBoardConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tAdmin("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteBoard}
            >
              {tAdmin("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
