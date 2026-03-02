// --- Client-side (decrypted) types ---

export interface DecryptedBoardData {
  title: string;
  description?: string;
}

export interface DecryptedColumnMeta {
  title: string;
  color?: string;
}

export interface DecryptedCardData {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  dueDate?: string; // ISO 8601 date string
}

// --- Server-side (Redis) types ---

export interface RedisBoardHash {
  encryptedData: string;
  adminToken: string; // SHA-256 hash
  columnOrder: string; // JSON array of column IDs
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  version: string;
}

export interface RedisColumnHash {
  encryptedMeta: string; // Encrypted { title, color }
  encryptedCards: string; // Encrypted Array<DecryptedCardData>
  version: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// --- tRPC output types ---

export interface BoardResponse {
  id: string;
  encryptedData: string;
  columnOrder: string[];
  createdAt: string;
  expiresAt: string;
  version: number;
}

export interface ColumnResponse {
  id: string;
  encryptedMeta: string;
  encryptedCards: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardWithColumnsResponse {
  board: BoardResponse;
  columns: ColumnResponse[];
}
