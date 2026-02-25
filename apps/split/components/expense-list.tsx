"use client";

import { useTranslations } from "next-intl";
import type { DecryptedExpense } from "@/lib/interfaces";
import { formatAmount } from "@/lib/settle";
import { Card, CardContent, CardHeader, CardTitle } from "@switch-to-eu/ui/components/card";
import { Receipt } from "lucide-react";

interface ExpenseListProps {
  expenses: DecryptedExpense[];
  currency: string;
}

export function ExpenseList({ expenses, currency }: ExpenseListProps) {
  const t = useTranslations("GroupView");

  const totalCents = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <p className="text-neutral-500 font-medium">{t("noExpenses")}</p>
          <p className="text-sm text-neutral-400 mt-1">{t("noExpensesDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <span className="text-sm text-neutral-500">
          {t("totalSpent")}: <strong>{formatAmount(totalCents, currency)}</strong>
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {expenses.map((expense) => (
          <div
            key={expense.expenseId}
            className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900 truncate">
                {expense.description}
              </p>
              <p className="text-sm text-neutral-500">
                {t("paidBy")} <span className="font-medium">{expense.paidBy}</span>
                {" · "}
                {expense.splitType === "equal" && t("splitEqually")}
                {expense.splitType === "exact" && t("splitExact")}
                {expense.splitType === "percentage" && t("splitPercentage")}
                {" · "}
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
            <span className="font-semibold text-neutral-900 ml-4 shrink-0">
              {formatAmount(expense.amount, currency)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
