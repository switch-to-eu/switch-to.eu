// Stored in Redis hash at poll:{id}
export interface RedisPollHash {
  encryptedData: string; // Encrypted poll structure (title, dates, settings)
  adminToken: string; // SHA-256 hash of the admin token
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  version: string; // Monotonic counter (Redis stores as string)
  isDeleted: string; // "true" | "false"
}

// Stored in Redis hash at poll:{id}:vote:{participantId}
export interface RedisVoteHash {
  encryptedVote: string; // Encrypted { name, availability }
  version: string; // Per-vote version counter
  updatedAt: string; // ISO 8601
}

// tRPC output types
export interface PollResponse {
  id: string;
  encryptedData: string;
  createdAt: string;
  expiresAt: string;
  version: number;
}

export interface VoteResponse {
  participantId: string;
  encryptedVote: string;
  version: number;
  updatedAt: string;
}

export interface PollWithVotesResponse {
  poll: PollResponse;
  votes: VoteResponse[];
}
