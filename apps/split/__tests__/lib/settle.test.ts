import { describe, it, expect } from "vitest";
import {
  calculateBalances,
  calculateSettlements,
  formatAmount,
  parseToCents,
  buildEqualSplits,
} from "@/lib/settle";
import type { DecryptedExpense, MemberBalance } from "@/lib/interfaces";

function makeExpense(
  overrides: Partial<DecryptedExpense> & Pick<DecryptedExpense, "amount" | "paidBy">,
): DecryptedExpense {
  return {
    expenseId: "exp1",
    description: "Test",
    splitType: "equal",
    splits: [],
    date: "2025-01-01",
    createdAt: "2025-01-01",
    version: 1,
    ...overrides,
  };
}

describe("calculateBalances", () => {
  it("returns zero balances when no expenses", () => {
    const balances = calculateBalances([], ["Alice", "Bob"]);
    expect(balances).toEqual([
      { member: "Alice", paid: 0, owes: 0, net: 0 },
      { member: "Bob", paid: 0, owes: 0, net: 0 },
    ]);
  });

  it("calculates equal split for two members", () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: "Alice",
        splitType: "equal",
        splits: [],
      }),
    ];
    const balances = calculateBalances(expenses, ["Alice", "Bob"]);

    expect(balances).toEqual([
      { member: "Alice", paid: 1000, owes: 500, net: 500 },
      { member: "Bob", paid: 0, owes: 500, net: -500 },
    ]);
  });

  it("calculates equal split for three members", () => {
    const expenses = [
      makeExpense({
        amount: 900,
        paidBy: "Alice",
        splitType: "equal",
        splits: [],
      }),
    ];
    const balances = calculateBalances(expenses, ["Alice", "Bob", "Charlie"]);

    expect(balances).toEqual([
      { member: "Alice", paid: 900, owes: 300, net: 600 },
      { member: "Bob", paid: 0, owes: 300, net: -300 },
      { member: "Charlie", paid: 0, owes: 300, net: -300 },
    ]);
  });

  it("distributes remainder cents to first members on uneven split", () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: "Alice",
        splitType: "equal",
        splits: [],
      }),
    ];
    // 1000 / 3 = 333 remainder 1
    const balances = calculateBalances(expenses, ["Alice", "Bob", "Charlie"]);

    const aliceOwes = balances.find((b) => b.member === "Alice")!.owes;
    const bobOwes = balances.find((b) => b.member === "Bob")!.owes;
    const charlieOwes = balances.find((b) => b.member === "Charlie")!.owes;
    expect(aliceOwes + bobOwes + charlieOwes).toBe(1000);
    // First member gets the remainder cent
    expect(aliceOwes).toBe(334);
    expect(bobOwes).toBe(333);
    expect(charlieOwes).toBe(333);
  });

  it("handles equal split with selected members only", () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: "Alice",
        splitType: "equal",
        splits: [{ member: "Alice" }, { member: "Bob" }],
      }),
    ];
    const balances = calculateBalances(expenses, ["Alice", "Bob", "Charlie"]);

    // Charlie should owe nothing
    expect(balances.find((b) => b.member === "Charlie")!.owes).toBe(0);
    // Alice and Bob split equally
    expect(balances.find((b) => b.member === "Alice")!.owes).toBe(500);
    expect(balances.find((b) => b.member === "Bob")!.owes).toBe(500);
  });

  it("calculates exact split", () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: "Alice",
        splitType: "exact",
        splits: [
          { member: "Alice", amount: 200 },
          { member: "Bob", amount: 800 },
        ],
      }),
    ];
    const balances = calculateBalances(expenses, ["Alice", "Bob"]);

    expect(balances).toEqual([
      { member: "Alice", paid: 1000, owes: 200, net: 800 },
      { member: "Bob", paid: 0, owes: 800, net: -800 },
    ]);
  });

  it("calculates percentage split", () => {
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: "Alice",
        splitType: "percentage",
        splits: [
          { member: "Alice", percentage: 30 },
          { member: "Bob", percentage: 70 },
        ],
      }),
    ];
    const balances = calculateBalances(expenses, ["Alice", "Bob"]);

    expect(balances).toEqual([
      { member: "Alice", paid: 1000, owes: 300, net: 700 },
      { member: "Bob", paid: 0, owes: 700, net: -700 },
    ]);
  });

  it("accumulates multiple expenses", () => {
    const expenses = [
      makeExpense({
        expenseId: "e1",
        amount: 600,
        paidBy: "Alice",
        splitType: "equal",
        splits: [],
      }),
      makeExpense({
        expenseId: "e2",
        amount: 400,
        paidBy: "Bob",
        splitType: "equal",
        splits: [],
      }),
    ];
    const balances = calculateBalances(expenses, ["Alice", "Bob"]);

    // Alice: paid 600, owes 300+200=500, net +100
    // Bob: paid 400, owes 300+200=500, net -100
    expect(balances.find((b) => b.member === "Alice")!.net).toBe(100);
    expect(balances.find((b) => b.member === "Bob")!.net).toBe(-100);
  });
});

describe("calculateSettlements", () => {
  it("returns empty array when all balances are zero", () => {
    const balances: MemberBalance[] = [
      { member: "Alice", paid: 500, owes: 500, net: 0 },
      { member: "Bob", paid: 500, owes: 500, net: 0 },
    ];
    expect(calculateSettlements(balances)).toEqual([]);
  });

  it("creates single settlement for two members", () => {
    const balances: MemberBalance[] = [
      { member: "Alice", paid: 1000, owes: 500, net: 500 },
      { member: "Bob", paid: 0, owes: 500, net: -500 },
    ];
    const settlements = calculateSettlements(balances);

    expect(settlements).toHaveLength(1);
    expect(settlements[0]).toEqual({
      from: "Bob",
      to: "Alice",
      amount: 500,
    });
  });

  it("simplifies circular debt (unified payback)", () => {
    // A paid 300, B paid 300, C paid 0 — equal split of 900
    // A: paid 300, owes 300, net 0
    // B: paid 600, owes 300, net +300
    // C: paid 0, owes 300, net -300
    const balances: MemberBalance[] = [
      { member: "A", paid: 300, owes: 300, net: 0 },
      { member: "B", paid: 600, owes: 300, net: 300 },
      { member: "C", paid: 0, owes: 300, net: -300 },
    ];
    const settlements = calculateSettlements(balances);

    // Should be one transaction: C -> B: 300
    expect(settlements).toHaveLength(1);
    expect(settlements[0]).toEqual({ from: "C", to: "B", amount: 300 });
  });

  it("minimizes transactions for complex debts", () => {
    // 4 members, various debts
    const balances: MemberBalance[] = [
      { member: "A", paid: 0, owes: 250, net: -250 },
      { member: "B", paid: 0, owes: 250, net: -250 },
      { member: "C", paid: 500, owes: 250, net: 250 },
      { member: "D", paid: 500, owes: 250, net: 250 },
    ];
    const settlements = calculateSettlements(balances);

    // Should be 2 transactions (not 4)
    expect(settlements).toHaveLength(2);

    // Total amounts transferred should equal total debt
    const totalTransferred = settlements.reduce((sum, s) => sum + s.amount, 0);
    expect(totalTransferred).toBe(500);
  });

  it("handles one creditor and multiple debtors", () => {
    const balances: MemberBalance[] = [
      { member: "A", paid: 0, owes: 100, net: -100 },
      { member: "B", paid: 0, owes: 200, net: -200 },
      { member: "C", paid: 300, owes: 0, net: 300 },
    ];
    const settlements = calculateSettlements(balances);

    // B (biggest debtor) should pay C first
    expect(settlements).toHaveLength(2);
    expect(settlements[0]).toEqual({ from: "B", to: "C", amount: 200 });
    expect(settlements[1]).toEqual({ from: "A", to: "C", amount: 100 });
  });

  it("preserves total balance (sum of settlements = sum of debts)", () => {
    const balances: MemberBalance[] = [
      { member: "A", paid: 1000, owes: 333, net: 667 },
      { member: "B", paid: 0, owes: 333, net: -333 },
      { member: "C", paid: 0, owes: 334, net: -334 },
    ];
    const settlements = calculateSettlements(balances);

    const totalDebt = balances
      .filter((b) => b.net < 0)
      .reduce((sum, b) => sum + Math.abs(b.net), 0);
    const totalTransferred = settlements.reduce((sum, s) => sum + s.amount, 0);

    expect(totalTransferred).toBe(totalDebt);
  });
});

describe("formatAmount", () => {
  it("formats cents to EUR", () => {
    const result = formatAmount(1234, "EUR");
    // Should contain 12.34 and EUR symbol
    expect(result).toContain("12");
    expect(result).toContain("34");
  });

  it("formats zero cents", () => {
    const result = formatAmount(0, "USD");
    expect(result).toContain("0");
  });

  it("falls back gracefully for unknown currencies", () => {
    const result = formatAmount(1000, "INVALID");
    expect(result).toContain("10");
  });
});

describe("parseToCents", () => {
  it("parses integer amount", () => {
    expect(parseToCents("10")).toBe(1000);
  });

  it("parses decimal amount with dot", () => {
    expect(parseToCents("12.34")).toBe(1234);
  });

  it("parses decimal amount with comma", () => {
    expect(parseToCents("12,34")).toBe(1234);
  });

  it("returns 0 for invalid input", () => {
    expect(parseToCents("abc")).toBe(0);
  });

  it("rounds to nearest cent", () => {
    expect(parseToCents("10.999")).toBe(1100);
  });
});

describe("buildEqualSplits", () => {
  it("creates splits for all members", () => {
    const splits = buildEqualSplits(["Alice", "Bob", "Charlie"]);
    expect(splits).toEqual([
      { member: "Alice" },
      { member: "Bob" },
      { member: "Charlie" },
    ]);
  });

  it("returns empty array for no members", () => {
    expect(buildEqualSplits([])).toEqual([]);
  });
});
