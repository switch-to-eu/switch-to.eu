import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc-client";

interface UseDeletePollOptions {
  pollId: string;
  adminToken: string;
}

export function useDeletePoll({ pollId, adminToken }: UseDeletePollOptions) {
  const router = useRouter();
  const deletePollMutation = api.poll.delete.useMutation();

  const deletePoll = async () => {
    try {
      await deletePollMutation.mutateAsync({
        id: pollId,
        adminToken,
      });

      toast.success("Poll deleted successfully");
      router.push("/");
    } catch {
      toast.error("Failed to delete poll");
    }
  };

  return {
    deletePoll,
    isLoading: deletePollMutation.isPending,
  };
}
