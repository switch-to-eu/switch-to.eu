"use client";

import { useParams } from "next/navigation";

import { MissingKeyError, PollNotFoundError, DecryptionError } from "@components/error-states";
import { PollLoading } from "@components/poll-loading";
import { AvailabilityGrid } from "@components/availability-grid";
import { useLoadPoll } from "@hooks/useLoadPoll";
import { useVote } from "@hooks/useVote";
import { BestTimeHighlight, PollInfo } from "@components/poll-header";

export default function PollPage() {
  const params = useParams();
  const pollId = params.id as string;

  const {
    poll,
    isLoading,
    encryptionKey,
    missingKey,
    decryptionError,
    pollQueryError,
    topTime,
  } = useLoadPoll({ pollId });

  // Use voting hook with user state management
  const {
    submitVote,
    isLoading: isVoting,
    currentParticipantId,
  } = useVote({
    pollId,
    encryptionKey,
  });

  const handleVote = async (name: string, availability: Record<string, boolean | string[]>) => {
    if (!poll) return;

    await submitVote(poll, { name, availability });
  };

  // Handle missing encryption key
  if (missingKey) {
    return <MissingKeyError />;
  }

  // Handle decryption errors
  if (decryptionError) {
    return <DecryptionError error={decryptionError} />;
  }

  // Handle poll query errors
  if (pollQueryError || !isLoading && !poll) {
    return <PollNotFoundError />;
  }

  // Show loading state
  if (isLoading || !poll) {
    return <PollLoading />;
  }

  return (
    <div className="py-0 sm:py-4 lg:py-6">
      <div className="container mx-auto max-w-4xl space-y-8">
        <PollInfo poll={poll} />

        <BestTimeHighlight poll={poll} bestTime={topTime} />

        <AvailabilityGrid
          poll={poll}
          currentParticipantId={currentParticipantId}
          isSaving={isVoting}
          onSave={handleVote}
        />
      </div>
    </div>
  );
}