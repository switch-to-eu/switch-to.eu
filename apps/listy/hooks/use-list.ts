"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/trpc-client";
import { encryptData, decryptData } from "@switch-to-eu/db/crypto";
import type { DecryptedListData, DecryptedItemData } from "@/lib/types";

export interface DecryptedItem {
  id: string;
  text: string;
  claimedBy?: string;
  category?: string;
  completed: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedList {
  id: string;
  title: string;
  description?: string;
  preset: string;
  createdAt: string;
  expiresAt: string;
  version: number;
  items: DecryptedItem[];
}

interface UseListOptions {
  listId: string;
}

export function useList({ listId }: UseListOptions) {
  const [encryptionKey, setEncryptionKey] = useState("");
  const [missingKey, setMissingKey] = useState(false);
  const [decryptedList, setDecryptedList] = useState<DecryptedList | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queryError, setQueryError] = useState(false);

  // Extract encryption key from URL fragment
  useEffect(() => {
    const fragment = window.location.hash.substring(1);
    if (fragment) {
      if (fragment.includes("key=")) {
        const params = new URLSearchParams(fragment);
        const key = params.get("key") ?? "";
        setEncryptionKey(key);
        setMissingKey(!key);
      } else {
        setEncryptionKey(fragment);
        setMissingKey(false);
      }
    } else {
      setMissingKey(true);
    }
  }, []);

  // Use SSE subscription for real-time updates
  const { data: subscriptionData, error: subscriptionError } =
    api.list.subscribe.useSubscription(
      { id: listId },
      {
        enabled: !!listId,
        onError: () => {
          setQueryError(true);
        },
      },
    );

  // Handle subscription errors
  useEffect(() => {
    if (subscriptionError) {
      setQueryError(true);
      setIsLoading(false);
    }
  }, [subscriptionError]);

  // Decrypt data when subscription data or key changes
  useEffect(() => {
    if (!subscriptionData || !encryptionKey) return;

    const decrypt = async () => {
      setIsDecrypting(true);
      setDecryptionError(null);
      setQueryError(false);

      try {
        const listData = await decryptData<DecryptedListData>(
          subscriptionData.list.encryptedData,
          encryptionKey,
        );

        const items: DecryptedItem[] = [];
        for (const item of subscriptionData.items) {
          try {
            const itemData = await decryptData<DecryptedItemData>(
              item.encryptedItem,
              encryptionKey,
            );
            items.push({
              id: item.id,
              text: itemData.text,
              claimedBy: itemData.claimedBy,
              category: itemData.category,
              completed: item.completed,
              version: item.version,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            });
          } catch {
            // Skip items that fail to decrypt
          }
        }

        setDecryptedList({
          id: subscriptionData.list.id,
          title: listData.title,
          description: listData.description,
          preset: subscriptionData.list.preset,
          createdAt: subscriptionData.list.createdAt,
          expiresAt: subscriptionData.list.expiresAt,
          version: subscriptionData.list.version,
          items,
        });
      } catch {
        setDecryptionError("Failed to decrypt list data. The link may be invalid.");
      } finally {
        setIsDecrypting(false);
        setIsLoading(false);
      }
    };

    void decrypt();
  }, [subscriptionData, encryptionKey]);

  const addItemMutation = api.list.addItem.useMutation();
  const toggleItemMutation = api.list.toggleItem.useMutation();
  const removeItemMutation = api.list.removeItem.useMutation();
  const updateItemMutation = api.list.updateItem.useMutation();
  const deleteListMutation = api.list.delete.useMutation();

  // --- Optimistic update helpers ---
  // Pattern: update local decrypted state immediately, fire mutation in background,
  // SSE subscription naturally replaces local state with server truth on confirmation.
  // On error: rollback local state and re-throw so the UI can show a toast.

  const updateItem = useCallback(
    (itemId: string, updater: (item: DecryptedItem) => DecryptedItem) => {
      setDecryptedList((prev) =>
        prev
          ? { ...prev, items: prev.items.map((i) => (i.id === itemId ? updater(i) : i)) }
          : null,
      );
    },
    [],
  );

  const addItem = useCallback(
    async (text: string, category?: string) => {
      if (!encryptionKey) return;

      // Optimistic: add item with temporary ID
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      setDecryptedList((prev) =>
        prev
          ? {
              ...prev,
              items: [
                ...prev.items,
                { id: tempId, text, category, completed: false, version: 0, createdAt: now, updatedAt: now },
              ],
            }
          : null,
      );

      try {
        const itemData: DecryptedItemData = { text, category };
        const encryptedItem = await encryptData(itemData, encryptionKey);
        return await addItemMutation.mutateAsync({ listId, encryptedItem });
      } catch (error) {
        // Rollback: remove the temp item
        setDecryptedList((prev) =>
          prev ? { ...prev, items: prev.items.filter((i) => i.id !== tempId) } : null,
        );
        throw error;
      }
    },
    [encryptionKey, listId, addItemMutation],
  );

  const toggleItem = useCallback(
    async (itemId: string, completed: boolean) => {
      // Optimistic: flip the checkbox immediately
      updateItem(itemId, (i) => ({ ...i, completed }));

      try {
        return await toggleItemMutation.mutateAsync({ listId, itemId, completed });
      } catch (error) {
        // Rollback: flip it back
        updateItem(itemId, (i) => ({ ...i, completed: !completed }));
        throw error;
      }
    },
    [listId, toggleItemMutation, updateItem],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      // Stash the item for rollback
      const removedItem = decryptedList?.items.find((i) => i.id === itemId);

      // Optimistic: remove immediately
      setDecryptedList((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : null,
      );

      try {
        return await removeItemMutation.mutateAsync({ listId, itemId });
      } catch (error) {
        // Rollback: restore the item
        if (removedItem) {
          setDecryptedList((prev) =>
            prev ? { ...prev, items: [...prev.items, removedItem] } : null,
          );
        }
        throw error;
      }
    },
    [listId, decryptedList, removeItemMutation],
  );

  const claimItem = useCallback(
    async (itemId: string, claimedBy: string) => {
      if (!encryptionKey || !decryptedList) return;
      const item = decryptedList.items.find((i) => i.id === itemId);
      if (!item) return;

      // Optimistic: show claimed name immediately
      const previousClaimedBy = item.claimedBy;
      updateItem(itemId, (i) => ({ ...i, claimedBy }));

      try {
        const itemData: DecryptedItemData = { text: item.text, claimedBy, category: item.category };
        const encryptedItem = await encryptData(itemData, encryptionKey);
        return await updateItemMutation.mutateAsync({
          listId,
          itemId,
          encryptedItem,
          expectedVersion: item.version,
        });
      } catch (error) {
        // Rollback
        updateItem(itemId, (i) => ({ ...i, claimedBy: previousClaimedBy }));
        throw error;
      }
    },
    [encryptionKey, listId, decryptedList, updateItemMutation, updateItem],
  );

  const unclaimItem = useCallback(
    async (itemId: string) => {
      if (!encryptionKey || !decryptedList) return;
      const item = decryptedList.items.find((i) => i.id === itemId);
      if (!item) return;

      // Optimistic: remove claimed name immediately
      const previousClaimedBy = item.claimedBy;
      updateItem(itemId, (i) => ({ ...i, claimedBy: undefined }));

      try {
        const itemData: DecryptedItemData = { text: item.text, category: item.category };
        const encryptedItem = await encryptData(itemData, encryptionKey);
        return await updateItemMutation.mutateAsync({
          listId,
          itemId,
          encryptedItem,
          expectedVersion: item.version,
        });
      } catch (error) {
        // Rollback
        updateItem(itemId, (i) => ({ ...i, claimedBy: previousClaimedBy }));
        throw error;
      }
    },
    [encryptionKey, listId, decryptedList, updateItemMutation, updateItem],
  );

  const deleteList = useCallback(
    async (adminToken: string) => {
      return deleteListMutation.mutateAsync({ id: listId, adminToken });
    },
    [listId, deleteListMutation],
  );

  const isMutating =
    addItemMutation.isPending ||
    toggleItemMutation.isPending ||
    removeItemMutation.isPending ||
    updateItemMutation.isPending ||
    deleteListMutation.isPending;

  const error = useMemo(() => {
    if (queryError) return "Failed to load list.";
    if (decryptionError) return decryptionError;
    return null;
  }, [queryError, decryptionError]);

  return {
    list: decryptedList,
    isLoading: isLoading || isDecrypting,
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
  };
}
