import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/trpc-client";
import { decryptData } from "@switch-to-eu/db/crypto";
import { useFragment } from "@switch-to-eu/blocks/hooks/use-fragment";
import type {
  DecryptedPoll,
  EncryptedPollStructure,
  EncryptedVoteData,
  Participant,
} from "@/lib/interfaces";

interface BestTime {
  key: string;
  date: string;
  count: number;
  percentage: number;
}

interface UseLoadPollOptions {
  pollId: string;
}

interface UseLoadPollReturn {
  poll: DecryptedPoll | null;
  isLoading: boolean;
  isDecrypting: boolean;
  encryptionKey: string;
  missingKey: boolean;
  decryptionError: string | null;
  pollQueryError: boolean;
  bestTimes: BestTime[];
  topTime?: BestTime;
}

export function useLoadPoll({
  pollId,
}: UseLoadPollOptions): UseLoadPollReturn {
  const fragment = useFragment();

  const [poll, setPoll] = useState<DecryptedPoll | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pollQueryError, setPollQueryError] = useState(false);

  // Derive encryption key from fragment — supports both #rawKey (legacy) and #key=xxx
  const encryptionKey = fragment.params.key || "";
  const missingKey = fragment.ready && !encryptionKey;

  // Use SSE subscription for real-time updates
  const { data: subscriptionData, error: subscriptionError } =
    api.poll.subscribe.useSubscription(
      { id: pollId },
      {
        enabled: !!pollId,
        onError: () => {
          setPollQueryError(true);
        },
      }
    );

  // Load and decrypt poll data when subscription data changes
  useEffect(() => {
    if (!subscriptionData || !encryptionKey) return;

    const loadPoll = async () => {
      setIsDecrypting(true);
      setDecryptionError(null);
      setPollQueryError(false);

      try {
        const { poll: pollResponse, votes } = subscriptionData;

        // Phase 1: Decrypt poll structure
        const structure = await decryptData<EncryptedPollStructure>(
          pollResponse.encryptedData,
          encryptionKey
        );

        // Phase 2: Decrypt each vote individually
        const participants: Participant[] = [];
        for (const vote of votes) {
          try {
            const voteData = await decryptData<EncryptedVoteData>(
              vote.encryptedVote,
              encryptionKey
            );
            participants.push({
              id: vote.participantId,
              name: voteData.name,
              availability: voteData.availability,
            });
          } catch {
            // Graceful degradation: skip votes that fail to decrypt
          }
        }

        const decryptedPoll: DecryptedPoll = {
          id: pollResponse.id,
          title: structure.title,
          description: structure.description,
          location: structure.location,
          dates: structure.dates,
          fixedDuration: structure.fixedDuration,
          selectedStartTimes: structure.selectedStartTimes,
          allowHourSelection: structure.allowHourSelection,
          participants,
          createdAt: pollResponse.createdAt,
          expiresAt: pollResponse.expiresAt,
          version: pollResponse.version,
        };

        setPoll(decryptedPoll);
      } catch {
        setDecryptionError(
          "Failed to decrypt poll data. The encryption key may be invalid."
        );
      } finally {
        setIsDecrypting(false);
        setIsLoading(false);
      }
    };

    void loadPoll();
  }, [subscriptionData, encryptionKey]);

  // Handle subscription errors
  useEffect(() => {
    if (subscriptionError) {
      setPollQueryError(true);
      setIsLoading(false);
    }
  }, [subscriptionError]);

  // Calculate best times from poll data
  const bestTimes = useMemo(() => {
    if (!poll?.participants?.length) return [];

    const timeSlots: BestTime[] = [];

    // Check if this is a timed poll with time slots
    if (poll.allowHourSelection && poll.selectedStartTimes && poll.fixedDuration && poll.selectedStartTimes.length > 0) {
      // For timed polls: calculate best time slots (date + time combinations)
      poll.dates.forEach((date) => {
        poll.selectedStartTimes!.forEach((startTime) => {
          const slotKey = `${date}T${startTime}`;
          const count = poll.participants.filter(
            (participant) => participant.availability[slotKey]
          ).length;
          const percentage = Math.round((count / poll.participants.length) * 100);

          timeSlots.push({
            key: slotKey,
            date: slotKey,
            count,
            percentage,
          });
        });
      });
    } else {
      // For date-only polls: use original logic
      poll.dates.forEach((date) => {
        const count = poll.participants.filter(
          (participant) => participant.availability[date]
        ).length;
        const percentage = Math.round((count / poll.participants.length) * 100);

        timeSlots.push({
          key: date,
          date,
          count,
          percentage,
        });
      });
    }

    return timeSlots.sort((a, b) => b.count - a.count);
  }, [poll]);

  const topTime = bestTimes[0];

  return {
    poll,
    isLoading,
    isDecrypting,
    encryptionKey,
    missingKey,
    decryptionError,
    pollQueryError,
    bestTimes,
    topTime,
  };
}
