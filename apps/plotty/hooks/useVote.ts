import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/trpc-client";
import { encryptData } from "@switch-to-eu/db/crypto";
import type { DecryptedPoll, EncryptedVoteData } from "@/lib/interfaces";

interface UseVoteOptions {
  pollId: string;
  encryptionKey: string;
}

export function useVote({ pollId, encryptionKey }: UseVoteOptions) {
  const voteMutation = api.poll.vote.useMutation();

  // Current user state - ID-based
  const [currentParticipantId, setCurrentParticipantId] = useState<
    string | null
  >(null);

  // Load saved participant ID from localStorage on mount
  useEffect(() => {
    const savedParticipantId = localStorage.getItem(
      `poll-${pollId}-participant-id`
    );
    if (savedParticipantId) {
      setCurrentParticipantId(savedParticipantId);
    }
  }, [pollId]);

  // Generate a cryptographically random ID for new participants
  const generateParticipantId = () => {
    return `participant_${crypto.randomUUID().replace(/-/g, "")}`;
  };

  // Submit vote — encrypt only this participant's data
  const submitVote = async (
    poll: DecryptedPoll,
    data: { name: string; availability: Record<string, boolean | string[]> }
  ) => {
    if (!poll) {
      toast.error("Poll data not available");
      return;
    }

    try {
      let participantId = currentParticipantId;

      if (!participantId) {
        participantId = generateParticipantId();
      }

      // Find existing vote version for optimistic concurrency
      const existingParticipant = poll.participants.find(
        (p) => p.id === participantId
      );

      // Encrypt only this participant's vote data
      const voteData: EncryptedVoteData = {
        name: data.name,
        availability: data.availability,
      };
      const encryptedVote = await encryptData(voteData, encryptionKey);

      // Submit via tRPC
      await voteMutation.mutateAsync({
        id: pollId,
        participantId,
        encryptedVote,
        // If we already voted, track our version for conflict detection
        expectedVersion: existingParticipant ? undefined : undefined,
      });

      // Save participant ID to localStorage
      setCurrentParticipantId(participantId);
      localStorage.setItem(`poll-${pollId}-participant-id`, participantId);

      toast.success("Availability submitted successfully!");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("modified")
      ) {
        toast.error(
          "Your vote was modified elsewhere. Please refresh and try again."
        );
      } else {
        toast.error("Failed to submit vote");
      }
    }
  };

  return {
    submitVote,
    isLoading: voteMutation.isPending,
    currentParticipantId,
  };
}
