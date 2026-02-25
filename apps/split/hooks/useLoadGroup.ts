"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/trpc-client";
import { decryptData } from "@/lib/crypto";
import type {
  DecryptedGroup,
  DecryptedExpense,
  EncryptedGroupStructure,
  EncryptedExpenseData,
} from "@/lib/interfaces";
import type { GroupWithExpensesResponse } from "@/server/db/types";

type LoadState = "loading" | "missing-key" | "not-found" | "decryption-error" | "ready";

export function useLoadGroup(groupId: string) {
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [group, setGroup] = useState<DecryptedGroup | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string>("");

  // Extract encryption key from URL fragment
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") {
      setState("missing-key");
      return;
    }
    const fragment = hash.startsWith("#") ? hash.substring(1) : hash;
    // Could be just the key, or key=xxx
    const params = new URLSearchParams(fragment);
    const key = params.get("key") ?? fragment;
    if (!key) {
      setState("missing-key");
      return;
    }
    setEncryptionKey(key);
  }, []);

  const decryptFullState = useCallback(
    async (data: GroupWithExpensesResponse, key: string) => {
      const groupStructure = await decryptData<EncryptedGroupStructure>(
        data.group.encryptedData,
        key,
      );

      const decryptedExpenses: DecryptedExpense[] = [];
      for (const exp of data.expenses) {
        try {
          const expData = await decryptData<EncryptedExpenseData>(
            exp.encryptedExpense,
            key,
          );
          decryptedExpenses.push({
            expenseId: exp.expenseId,
            description: expData.description,
            amount: expData.amount,
            paidBy: expData.paidBy,
            splitType: expData.splitType,
            splits: expData.splits,
            date: expData.date,
            createdAt: exp.createdAt,
            version: exp.version,
          });
        } catch {
          // Skip expenses that can't be decrypted
        }
      }

      // Sort expenses by date, newest first
      decryptedExpenses.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return {
        id: data.group.id,
        name: groupStructure.name,
        currency: groupStructure.currency,
        members: groupStructure.members,
        expenses: decryptedExpenses,
        createdAt: data.group.createdAt,
        expiresAt: data.group.expiresAt,
        version: data.group.version,
      } satisfies DecryptedGroup;
    },
    [],
  );

  // Subscribe to real-time updates
  api.group.subscribe.useSubscription(
    { id: groupId },
    {
      enabled: !!encryptionKey,
      onData: (data) => {
        void (async () => {
          try {
            const decrypted = await decryptFullState(data, encryptionKey);
            setGroup(decrypted);
            setState("ready");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Decryption failed");
            setState("decryption-error");
          }
        })();
      },
      onError: (err) => {
        if (err.data?.code === "NOT_FOUND") {
          setState("not-found");
        } else {
          setError(err.message);
          setState("not-found");
        }
      },
    },
  );

  return { group, state, error, encryptionKey };
}
