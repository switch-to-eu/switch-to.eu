import { toast } from "sonner";
import { api } from "@/lib/trpc-client";
import { encryptData } from "@switch-to-eu/db/crypto";
import type { DecryptedPoll, EncryptedPollStructure } from "@/lib/interfaces";
import type { ProcessedPollFormData } from "@components/poll-form";

interface UseUpdatePollOptions {
  pollId: string;
  adminToken: string;
  encryptionKey: string;
}

export function useUpdatePoll({
  pollId,
  adminToken,
  encryptionKey,
}: UseUpdatePollOptions) {
  const updatePollMutation = api.poll.update.useMutation();

  const updatePoll = async (poll: DecryptedPoll, formData: ProcessedPollFormData) => {
    if (!poll) return;

    try {
      // Encrypt only the poll structure (no participants)
      const structure: EncryptedPollStructure = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        dates: formData.selectedDates.map(
          (date: Date) => date.toISOString().split("T")[0]!
        ),
        fixedDuration: formData.fixedDuration,
        selectedStartTimes: formData.selectedStartTimes,
        allowHourSelection: formData.enableTimeSelection,
      };

      const encryptedData = await encryptData(structure, encryptionKey);

      await updatePollMutation.mutateAsync({
        id: pollId,
        adminToken,
        encryptedData,
        expectedVersion: poll.version,
      });

      toast.success("Poll updated successfully!");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("modified")
      ) {
        toast.error(
          "Poll was modified by someone else. Please refresh and try again."
        );
      } else {
        toast.error("Failed to update poll");
      }
    }
  };

  return {
    updatePoll,
    isLoading: updatePollMutation.isPending,
  };
}
