// Stored in Redis hash at group:{id}
export interface RedisGroupHash {
  encryptedData: string; // Encrypted group structure (name, currency, members)
  adminToken: string; // SHA-256 hash of the admin token
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  version: string; // Monotonic counter (Redis stores as string)
  isDeleted: string; // "true" | "false"
}

// Stored in Redis hash at group:{id}:expense:{expenseId}
export interface RedisExpenseHash {
  encryptedExpense: string; // Encrypted expense data
  version: string; // Per-expense version counter
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// tRPC output types
export interface GroupResponse {
  id: string;
  encryptedData: string;
  createdAt: string;
  expiresAt: string;
  version: number;
}

export interface ExpenseResponse {
  expenseId: string;
  encryptedExpense: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupWithExpensesResponse {
  group: GroupResponse;
  expenses: ExpenseResponse[];
}
