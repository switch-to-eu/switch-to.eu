import type {
  DecryptedExpense,
  MemberBalance,
  Settlement,
  ExpenseSplit,
} from "./interfaces";

/**
 * Calculate the share each member owes for a single expense.
 * Returns a map of member -> amount in cents.
 */
function calculateExpenseShares(
  expense: DecryptedExpense,
  members: string[],
): Map<string, number> {
  const shares = new Map<string, number>();

  if (expense.splitType === "equal") {
    // Split equally among all involved members (or all members if splits empty)
    const involvedMembers =
      expense.splits.length > 0
        ? expense.splits.map((s) => s.member)
        : members;
    const perPerson = Math.floor(expense.amount / involvedMembers.length);
    const remainder = expense.amount - perPerson * involvedMembers.length;

    involvedMembers.forEach((member, idx) => {
      // Distribute remainder cents to first members
      shares.set(member, perPerson + (idx < remainder ? 1 : 0));
    });
  } else if (expense.splitType === "exact") {
    for (const split of expense.splits) {
      shares.set(split.member, split.amount ?? 0);
    }
  } else if (expense.splitType === "percentage") {
    for (const split of expense.splits) {
      const pct = split.percentage ?? 0;
      shares.set(split.member, Math.round((expense.amount * pct) / 100));
    }
  }

  return shares;
}

/**
 * Calculate net balances for all members across all expenses.
 */
export function calculateBalances(
  expenses: DecryptedExpense[],
  members: string[],
): MemberBalance[] {
  const paid = new Map<string, number>();
  const owes = new Map<string, number>();

  for (const member of members) {
    paid.set(member, 0);
    owes.set(member, 0);
  }

  for (const expense of expenses) {
    // Track what payer paid
    paid.set(expense.paidBy, (paid.get(expense.paidBy) ?? 0) + expense.amount);

    // Track what each person owes
    const shares = calculateExpenseShares(expense, members);
    for (const [member, amount] of shares) {
      owes.set(member, (owes.get(member) ?? 0) + amount);
    }
  }

  return members.map((member) => {
    const p = paid.get(member) ?? 0;
    const o = owes.get(member) ?? 0;
    return {
      member,
      paid: p,
      owes: o,
      net: p - o, // positive = owed money, negative = owes money
    };
  });
}

/**
 * Unified payback algorithm (debt simplification).
 * Minimizes the number of transactions needed to settle all debts.
 *
 * This is the key Splitwise-like feature:
 * Instead of A->B, B->C, C->A we simplify to minimal transfers.
 */
export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
  // Filter out zero balances and create working copies
  const debtors: { member: string; amount: number }[] = [];
  const creditors: { member: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.net < 0) {
      debtors.push({ member: b.member, amount: -b.net }); // make positive
    } else if (b.net > 0) {
      creditors.push({ member: b.member, amount: b.net });
    }
  }

  // Sort both by amount descending for greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]!;
    const creditor = creditors[ci]!;

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({
        from: debtor.member,
        to: creditor.member,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) di++;
    if (creditor.amount === 0) ci++;
  }

  return settlements;
}

/**
 * Format amount from cents to display string.
 */
export function formatAmount(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Parse a user-entered amount string to cents.
 */
export function parseToCents(value: string): number {
  const num = parseFloat(value.replace(",", "."));
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Build splits for an equal split across selected members.
 */
export function buildEqualSplits(members: string[]): ExpenseSplit[] {
  return members.map((member) => ({ member }));
}
