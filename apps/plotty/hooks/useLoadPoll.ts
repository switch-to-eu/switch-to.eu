import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc-client";
import { decryptData } from "@/lib/crypto";
import type { DecryptedPoll } from "@/lib/interfaces";

interface BestTime {
  key: string;
  date: string;
  count: number;
  percentage: number;
}

interface UseLoadPollOptions {
  pollId: string;
  onMissingKey?: () => void;
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
  onMissingKey,
}: UseLoadPollOptions): UseLoadPollReturn {
  const router = useRouter();

  const [poll, setPoll] = useState<DecryptedPoll | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pollQueryError, setPollQueryError] = useState(false);

  // Use SSE subscription for real-time updates
  const { data: pollData, error: subscriptionError } =
    api.poll.subscribe.useSubscription(
      { id: pollId },
      {
        enabled: !!pollId,
        onError: (error) => {
          console.error("Subscription error:", error);
          setPollQueryError(true);
        },
      }
    );

  // Extract encryption key from URL fragment
  useEffect(() => {
    const fragment = window.location.hash.substring(1);

    if (fragment) {
      setEncryptionKey(fragment);
      setMissingKey(false);
    } else {
      setMissingKey(true);
    }
  }, [router, onMissingKey]);

  // Load and decrypt poll data when subscription data changes
  useEffect(() => {
    if (!pollData || !encryptionKey) return;

    const loadPoll = async () => {
      setIsDecrypting(true);
      setDecryptionError(null);
      setPollQueryError(false);

      try {
        const decryptedPoll = await decryptData<DecryptedPoll>(
          pollData.encryptedData,
          encryptionKey
        );

        // Add metadata from the subscription response
        decryptedPoll.id = pollData.id;
        decryptedPoll.createdAt = pollData.createdAt.toISOString();
        decryptedPoll.expiresAt = pollData.expiresAt.toISOString();

        setPoll(decryptedPoll);
      } catch (error) {
        console.error("Failed to decrypt poll data:", error);
        setDecryptionError(
          "Failed to decrypt poll data. The encryption key may be invalid."
        );
      } finally {
        setIsDecrypting(false);
        setIsLoading(false);
      }
    };

    void loadPoll();
  }, [pollData, encryptionKey]);

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
            date: slotKey, // For backward compatibility with existing code
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
