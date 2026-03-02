"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { nanoid } from "nanoid";
import { api } from "@/lib/trpc-client";
import { encryptData, decryptData } from "@switch-to-eu/db/crypto";
import { useFragment } from "@switch-to-eu/blocks/hooks/use-fragment";
import type { DecryptedBoardData, DecryptedColumnMeta, DecryptedCardData } from "@/lib/types";
import type { DecryptedBoard, DecryptedColumn } from "@/lib/board-helpers";

interface UseBoardOptions {
  boardId: string;
  adminToken?: string;
}

export function useBoard({ boardId, adminToken }: UseBoardOptions) {
  const fragment = useFragment();
  const [decryptedBoard, setDecryptedBoard] = useState<DecryptedBoard | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queryError, setQueryError] = useState(false);

  const encryptionKey = fragment.params.key || "";
  const missingKey = fragment.ready && !encryptionKey;

  // Track pending mutations to suppress SSE overwrites during optimistic updates
  const pendingMutations = useRef(0);

  // SSE subscription
  const { data: subscriptionData, error: subscriptionError } =
    api.board.subscribe.useSubscription(
      { id: boardId },
      {
        enabled: !!boardId,
        onError: () => {
          setQueryError(true);
        },
      },
    );

  useEffect(() => {
    if (subscriptionError) {
      setQueryError(true);
      setIsLoading(false);
    }
  }, [subscriptionError]);

  // Decrypt data when subscription data or key changes
  useEffect(() => {
    if (!subscriptionData || !encryptionKey) return;

    // Skip SSE updates while optimistic mutations are in-flight to prevent flicker
    if (pendingMutations.current > 0 && decryptedBoard) return;

    const decrypt = async () => {
      setIsDecrypting(true);
      setDecryptionError(null);
      setQueryError(false);

      try {
        const boardData = await decryptData<DecryptedBoardData>(
          subscriptionData.board.encryptedData,
          encryptionKey,
        );

        const columns: DecryptedColumn[] = [];
        for (const col of subscriptionData.columns) {
          try {
            const meta = await decryptData<DecryptedColumnMeta>(
              col.encryptedMeta,
              encryptionKey,
            );
            let cards: DecryptedCardData[] = [];
            if (col.encryptedCards) {
              try {
                cards = await decryptData<DecryptedCardData[]>(
                  col.encryptedCards,
                  encryptionKey,
                );
              } catch {
                // Empty or corrupt cards — treat as empty
              }
            }
            columns.push({
              id: col.id,
              title: meta.title,
              color: meta.color,
              cards,
              version: col.version,
              createdAt: col.createdAt,
              updatedAt: col.updatedAt,
            });
          } catch {
            // Skip columns that fail to decrypt
          }
        }

        setDecryptedBoard({
          id: subscriptionData.board.id,
          title: boardData.title,
          description: boardData.description,
          columnOrder: subscriptionData.board.columnOrder,
          createdAt: subscriptionData.board.createdAt,
          expiresAt: subscriptionData.board.expiresAt,
          version: subscriptionData.board.version,
          columns,
        });
      } catch {
        setDecryptionError("Failed to decrypt board data. The link may be invalid.");
      } finally {
        setIsDecrypting(false);
        setIsLoading(false);
      }
    };

    void decrypt();
  }, [subscriptionData, encryptionKey]);

  // --- Mutations ---
  const updateCardsMutation = api.board.updateCards.useMutation();
  const addColumnMutation = api.board.addColumn.useMutation();
  const updateColumnMutation = api.board.updateColumn.useMutation();
  const removeColumnMutation = api.board.removeColumn.useMutation();
  const reorderColumnsMutation = api.board.reorderColumns.useMutation();
  const deleteBoardMutation = api.board.delete.useMutation();

  // Helper: encrypt a column's cards and send updateCards mutation
  const sendCardUpdate = useCallback(
    async (columnUpdates: Array<{ columnId: string; cards: DecryptedCardData[]; expectedVersion: number }>) => {
      if (!encryptionKey) return;

      pendingMutations.current++;
      try {
        const columns = await Promise.all(
          columnUpdates.map(async (u) => ({
            columnId: u.columnId,
            encryptedCards: await encryptData(u.cards, encryptionKey),
            expectedVersion: u.expectedVersion,
          })),
        );
        return await updateCardsMutation.mutateAsync({ boardId, columns });
      } finally {
        pendingMutations.current--;
      }
    },
    [encryptionKey, boardId, updateCardsMutation],
  );

  // --- Card operations (anyone with link) ---

  const addCard = useCallback(
    async (columnId: string, cardData: Omit<DecryptedCardData, "id">) => {
      if (!encryptionKey || !decryptedBoard) return;
      const col = decryptedBoard.columns.find((c) => c.id === columnId);
      if (!col) return;

      const newCard: DecryptedCardData = { id: nanoid(8), ...cardData };
      const newCards = [...col.cards, newCard];

      // Optimistic update
      setDecryptedBoard((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((c) =>
                c.id === columnId ? { ...c, cards: newCards } : c,
              ),
            }
          : null,
      );

      try {
        await sendCardUpdate([{ columnId, cards: newCards, expectedVersion: col.version }]);
      } catch (error) {
        // Rollback
        setDecryptedBoard((prev) =>
          prev
            ? {
                ...prev,
                columns: prev.columns.map((c) =>
                  c.id === columnId ? { ...c, cards: col.cards } : c,
                ),
              }
            : null,
        );
        throw error;
      }
    },
    [encryptionKey, decryptedBoard, sendCardUpdate],
  );

  const updateCard = useCallback(
    async (columnId: string, cardId: string, cardData: Omit<DecryptedCardData, "id">) => {
      if (!encryptionKey || !decryptedBoard) return;
      const col = decryptedBoard.columns.find((c) => c.id === columnId);
      if (!col) return;

      const newCards = col.cards.map((c) =>
        c.id === cardId ? { ...c, ...cardData } : c,
      );

      // Optimistic update
      setDecryptedBoard((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((c) =>
                c.id === columnId ? { ...c, cards: newCards } : c,
              ),
            }
          : null,
      );

      try {
        await sendCardUpdate([{ columnId, cards: newCards, expectedVersion: col.version }]);
      } catch (error) {
        // Rollback
        setDecryptedBoard((prev) =>
          prev
            ? {
                ...prev,
                columns: prev.columns.map((c) =>
                  c.id === columnId ? { ...c, cards: col.cards } : c,
                ),
              }
            : null,
        );
        throw error;
      }
    },
    [encryptionKey, decryptedBoard, sendCardUpdate],
  );

  const removeCard = useCallback(
    async (columnId: string, cardId: string) => {
      if (!decryptedBoard) return;
      const col = decryptedBoard.columns.find((c) => c.id === columnId);
      if (!col) return;

      const newCards = col.cards.filter((c) => c.id !== cardId);

      // Optimistic update
      setDecryptedBoard((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((c) =>
                c.id === columnId ? { ...c, cards: newCards } : c,
              ),
            }
          : null,
      );

      try {
        await sendCardUpdate([{ columnId, cards: newCards, expectedVersion: col.version }]);
      } catch (error) {
        // Rollback
        setDecryptedBoard((prev) =>
          prev
            ? {
                ...prev,
                columns: prev.columns.map((c) =>
                  c.id === columnId ? { ...c, cards: col.cards } : c,
                ),
              }
            : null,
        );
        throw error;
      }
    },
    [decryptedBoard, sendCardUpdate],
  );

  const moveCard = useCallback(
    async (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
      if (!decryptedBoard) return;

      const fromCol = decryptedBoard.columns.find((c) => c.id === fromColumnId);
      const toCol = decryptedBoard.columns.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return;

      // Build new card arrays
      const card = fromCol.cards.find((c) => c.id === cardId);
      if (!card) return;

      let newFromCards: DecryptedCardData[];
      let newToCards: DecryptedCardData[];

      if (fromColumnId === toColumnId) {
        // Reorder within same column
        const filtered = fromCol.cards.filter((c) => c.id !== cardId);
        const clamped = Math.min(toIndex, filtered.length);
        filtered.splice(clamped, 0, card);
        newFromCards = filtered;
        newToCards = filtered; // same column
      } else {
        // Cross-column move
        newFromCards = fromCol.cards.filter((c) => c.id !== cardId);
        newToCards = [...toCol.cards];
        const clamped = Math.min(toIndex, newToCards.length);
        newToCards.splice(clamped, 0, card);
      }

      // Optimistic update
      setDecryptedBoard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map((c) => {
            if (c.id === fromColumnId && fromColumnId === toColumnId) {
              return { ...c, cards: newFromCards };
            }
            if (c.id === fromColumnId) return { ...c, cards: newFromCards };
            if (c.id === toColumnId) return { ...c, cards: newToCards };
            return c;
          }),
        };
      });

      try {
        if (fromColumnId === toColumnId) {
          await sendCardUpdate([
            { columnId: fromColumnId, cards: newFromCards, expectedVersion: fromCol.version },
          ]);
        } else {
          await sendCardUpdate([
            { columnId: fromColumnId, cards: newFromCards, expectedVersion: fromCol.version },
            { columnId: toColumnId, cards: newToCards, expectedVersion: toCol.version },
          ]);
        }
      } catch (error) {
        // Rollback
        setDecryptedBoard((prev) =>
          prev
            ? {
                ...prev,
                columns: prev.columns.map((c) => {
                  if (c.id === fromColumnId) return { ...c, cards: fromCol.cards };
                  if (c.id === toColumnId) return { ...c, cards: toCol.cards };
                  return c;
                }),
              }
            : null,
        );
        throw error;
      }
    },
    [decryptedBoard, sendCardUpdate],
  );

  // --- Column operations (admin only) ---

  const addColumn = useCallback(
    async (columnMeta: DecryptedColumnMeta) => {
      if (!encryptionKey || !adminToken) return;

      try {
        const encryptedMeta = await encryptData(columnMeta, encryptionKey);
        const encryptedCards = await encryptData([] as DecryptedCardData[], encryptionKey);
        return await addColumnMutation.mutateAsync({
          boardId,
          adminToken,
          encryptedMeta,
          encryptedCards,
        });
      } catch (error) {
        throw error;
      }
    },
    [encryptionKey, adminToken, boardId, addColumnMutation],
  );

  const updateColumn = useCallback(
    async (columnId: string, columnMeta: DecryptedColumnMeta) => {
      if (!encryptionKey || !adminToken) return;

      try {
        const encryptedMeta = await encryptData(columnMeta, encryptionKey);
        return await updateColumnMutation.mutateAsync({
          boardId,
          columnId,
          adminToken,
          encryptedMeta,
        });
      } catch (error) {
        throw error;
      }
    },
    [encryptionKey, adminToken, boardId, updateColumnMutation],
  );

  const removeColumn = useCallback(
    async (columnId: string) => {
      if (!adminToken) return;

      try {
        return await removeColumnMutation.mutateAsync({
          boardId,
          columnId,
          adminToken,
        });
      } catch (error) {
        throw error;
      }
    },
    [adminToken, boardId, removeColumnMutation],
  );

  const reorderColumns = useCallback(
    async (columnOrder: string[]) => {
      if (!adminToken) return;

      const prevOrder = decryptedBoard?.columnOrder;

      setDecryptedBoard((prev) =>
        prev ? { ...prev, columnOrder } : null,
      );

      try {
        return await reorderColumnsMutation.mutateAsync({
          boardId,
          adminToken,
          columnOrder,
        });
      } catch (error) {
        if (prevOrder) {
          setDecryptedBoard((prev) =>
            prev ? { ...prev, columnOrder: prevOrder } : null,
          );
        }
        throw error;
      }
    },
    [adminToken, boardId, decryptedBoard, reorderColumnsMutation],
  );

  const deleteBoard = useCallback(
    async (token: string) => {
      return deleteBoardMutation.mutateAsync({ id: boardId, adminToken: token });
    },
    [boardId, deleteBoardMutation],
  );

  const isMutating =
    updateCardsMutation.isPending ||
    addColumnMutation.isPending ||
    updateColumnMutation.isPending ||
    removeColumnMutation.isPending ||
    reorderColumnsMutation.isPending ||
    deleteBoardMutation.isPending;

  const error = useMemo(() => {
    if (queryError) return "Failed to load board.";
    if (decryptionError) return decryptionError;
    return null;
  }, [queryError, decryptionError]);

  return {
    board: decryptedBoard,
    isLoading: isLoading || isDecrypting,
    isMutating,
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
    reorderColumns,
    deleteBoard,
  };
}
