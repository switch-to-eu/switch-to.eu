"use client";

import { api } from "@/lib/trpc-client";
import { encryptData } from "@/lib/crypto";
import type { EncryptedExpenseData } from "@/lib/interfaces";

export function useAddExpense() {
  const addExpenseMutation = api.group.addExpense.useMutation();

  const addExpense = async (
    groupId: string,
    encryptionKey: string,
    expense: EncryptedExpenseData,
  ) => {
    const encryptedExpense = await encryptData(expense, encryptionKey);

    return addExpenseMutation.mutateAsync({
      id: groupId,
      encryptedExpense,
    });
  };

  return {
    addExpense,
    isLoading: addExpenseMutation.isPending,
    error: addExpenseMutation.error,
  };
}
