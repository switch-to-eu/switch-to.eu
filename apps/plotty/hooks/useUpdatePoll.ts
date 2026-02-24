import { toast } from "sonner";
import { api } from "@/lib/trpc-client";
import { encryptData } from "@/lib/crypto";
import type { DecryptedPoll } from "@/lib/interfaces";
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
      const updatedPollData: DecryptedPoll = {
        ...poll,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        dates: formData.selectedDates.map(
          (date: Date) => date.toISOString().split("T")[0]!
        ),
        // Include new time selection fields
        fixedDuration: formData.fixedDuration,
        selectedStartTimes: formData.selectedStartTimes,
        allowHourSelection: formData.enableTimeSelection,
      };

      const encryptedData = await encryptData(updatedPollData, encryptionKey);

      await updatePollMutation.mutateAsync({
        id: pollId,
        adminToken,
        encryptedData,
      });

      toast.success("Poll updated successfully!");
    } catch (error) {
      console.error("Failed to update poll:", error);
      toast.error("Failed to update poll");
    }
  };

  return {
    updatePoll,
    isLoading: updatePollMutation.isPending,
  };
}
