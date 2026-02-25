// Data structures encrypted on the client, stored as blobs on server

/** Encrypted group structure - the core group data */
export interface EncryptedGroupStructure {
  name: string;
  currency: string;
  members: string[]; // List of member names
}

/** Encrypted expense data */
export interface EncryptedExpenseData {
  description: string;
  amount: number; // Total amount in cents to avoid floating point
  paidBy: string; // Member name who paid
  splitType: "equal" | "exact" | "percentage";
  splits: ExpenseSplit[];
  date: string; // ISO date string
}

export interface ExpenseSplit {
  member: string;
  amount?: number; // For exact splits (in cents)
  percentage?: number; // For percentage splits
}

/** Decrypted group with all computed data */
export interface DecryptedGroup {
  id: string;
  name: string;
  currency: string;
  members: string[];
  expenses: DecryptedExpense[];
  createdAt: string;
  expiresAt: string;
  version: number;
}

export interface DecryptedExpense {
  expenseId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitType: "equal" | "exact" | "percentage";
  splits: ExpenseSplit[];
  date: string;
  createdAt: string;
  version: number;
}

/** Balance for a single member */
export interface MemberBalance {
  member: string;
  paid: number; // Total paid in cents
  owes: number; // Total share in cents
  net: number; // paid - owes (positive = owed money, negative = owes money)
}

/** A single settlement transaction */
export interface Settlement {
  from: string;
  to: string;
  amount: number; // In cents
}
