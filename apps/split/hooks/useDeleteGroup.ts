"use client";

import { api } from "@/lib/trpc-client";

export function useDeleteGroup() {
  const deleteGroupMutation = api.group.delete.useMutation();

  const deleteGroup = async (groupId: string, adminToken: string) => {
    return deleteGroupMutation.mutateAsync({
      id: groupId,
      adminToken,
    });
  };

  return {
    deleteGroup,
    isLoading: deleteGroupMutation.isPending,
    error: deleteGroupMutation.error,
  };
}
