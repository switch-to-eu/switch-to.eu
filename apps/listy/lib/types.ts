// --- Client-side (decrypted) types ---

export interface CustomCategory {
  id: string; // stable identifier (preset key or nanoid)
  label: string; // display name
}

export interface ListSettings {
  enableCategories: boolean;
  enableClaims: boolean;
  categories?: CustomCategory[]; // present when enableCategories is true
}

export interface DecryptedListData {
  title: string;
  description?: string;
  settings?: ListSettings; // undefined = derive from preset (backward compat)
}

export interface DecryptedItemData {
  text: string;
  claimedBy?: string; // potluck only
  category?: string; // shopping only
}

// --- Server-side (Redis) types ---

export interface RedisListHash {
  encryptedData: string;
  adminToken: string; // SHA-256 hash
  preset: string;
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  version: string;
}

export interface RedisItemHash {
  encryptedItem: string;
  completed: string; // "true" | "false"
  version: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// --- tRPC output types ---

export interface ListResponse {
  id: string;
  encryptedData: string;
  preset: string;
  createdAt: string;
  expiresAt: string;
  version: number;
}

export interface ItemResponse {
  id: string;
  encryptedItem: string;
  completed: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListWithItemsResponse {
  list: ListResponse;
  items: ItemResponse[];
}
