"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/trpc-client";
import { encryptData, decryptData } from "@switch-to-eu/db/crypto";
import type { DecryptedListData, DecryptedItemData } from "@/lib/types";

export interface DecryptedItem {
  id: string;
  text: string;
  claimedBy?: string;
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

  const addItem = useCallback(
    async (text: string) => {
      if (!encryptionKey) return;
      const itemData: DecryptedItemData = { text };
      const encryptedItem = await encryptData(itemData, encryptionKey);
      return addItemMutation.mutateAsync({ listId, encryptedItem });
    },
    [encryptionKey, listId, addItemMutation],
  );

  const toggleItem = useCallback(
    async (itemId: string, completed: boolean) => {
      return toggleItemMutation.mutateAsync({ listId, itemId, completed });
    },
    [listId, toggleItemMutation],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      return removeItemMutation.mutateAsync({ listId, itemId });
    },
    [listId, removeItemMutation],
  );

  const claimItem = useCallback(
    async (itemId: string, claimedBy: string) => {
      if (!encryptionKey || !decryptedList) return;
      const item = decryptedList.items.find((i) => i.id === itemId);
      if (!item) return;
      const itemData: DecryptedItemData = { text: item.text, claimedBy };
      const encryptedItem = await encryptData(itemData, encryptionKey);
      return updateItemMutation.mutateAsync({
        listId,
        itemId,
        encryptedItem,
        expectedVersion: item.version,
      });
    },
    [encryptionKey, listId, decryptedList, updateItemMutation],
  );

  const unclaimItem = useCallback(
    async (itemId: string) => {
      if (!encryptionKey || !decryptedList) return;
      const item = decryptedList.items.find((i) => i.id === itemId);
      if (!item) return;
      const itemData: DecryptedItemData = { text: item.text };
      const encryptedItem = await encryptData(itemData, encryptionKey);
      return updateItemMutation.mutateAsync({
        listId,
        itemId,
        encryptedItem,
        expectedVersion: item.version,
      });
    },
    [encryptionKey, listId, decryptedList, updateItemMutation],
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
