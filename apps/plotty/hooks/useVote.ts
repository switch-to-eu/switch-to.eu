import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/trpc-client";
import { encryptData } from "@/lib/crypto";
import type { DecryptedPoll } from "@/lib/interfaces";

interface UseVoteOptions {
  pollId: string;
  encryptionKey: string;
  defaultUserName?: string;
}

export function useVote({ pollId, encryptionKey }: UseVoteOptions) {
  const voteMutation = api.poll.vote.useMutation();
  const utils = api.useUtils();

  // Current user state - now ID-based
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

  // Generate a unique ID for new participants
  const generateParticipantId = () => {
    return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Submit vote
  const submitVote = async (
    poll: DecryptedPoll,
    data: { name: string; availability: Record<string, boolean | string[]> }
  ) => {
    if (!poll) {
      toast.error("Poll data not available");
      return;
    }

    try {
      const updatedParticipants = [...poll.participants];
      let participantId = currentParticipantId;

      if (participantId) {
        // Update existing participant
        const existingIndex = updatedParticipants.findIndex(
          (p) => p.id === participantId
        );

        if (existingIndex >= 0) {
          updatedParticipants[existingIndex] = {
            id: participantId,
            name: data.name,
            availability: data.availability,
          };
        } else {
          // ID not found, treat as new participant
          participantId = generateParticipantId();
          updatedParticipants.push({
            id: participantId,
            name: data.name,
            availability: data.availability,
          });
        }
      } else {
        // New participant
        participantId = generateParticipantId();

        updatedParticipants.push({
          id: participantId,
          name: data.name,
          availability: data.availability,
        });
      }

      // Prepare updated poll data for encryption
      const updatedPollData: DecryptedPoll = {
        ...poll,
        participants: updatedParticipants,
      };

      // Encrypt the updated poll data
      const encryptedData = await encryptData(updatedPollData, encryptionKey);

      // Submit vote via tRPC
      await voteMutation.mutateAsync({
        id: pollId,
        encryptedData,
      });

      utils.poll.get.setData({ id: pollId }, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          encryptedData: encryptedData,
        };
      });

      // Update local state and save participant ID to localStorage
      setCurrentParticipantId(participantId);
      localStorage.setItem(`poll-${pollId}-participant-id`, participantId);

      toast.success("Availability submitted successfully!");
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote");
    }
  };

  return {
    submitVote,
    isLoading: voteMutation.isPending,
    currentParticipantId,
  };
}
