"use client";

import { useTranslations } from "next-intl";
import type { MemberBalance } from "@/lib/interfaces";
import { formatAmount } from "@/lib/settle";
import { Card, CardContent, CardHeader, CardTitle } from "@switch-to-eu/ui/components/card";

interface BalancesProps {
  balances: MemberBalance[];
  currency: string;
}

export function Balances({ balances, currency }: BalancesProps) {
  const t = useTranslations("Balances");

  const allSettled = balances.every((b) => b.net === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {allSettled && balances.length > 0 && (
          <p className="text-center text-green-600 font-medium py-4">
            {t("netZero")}
          </p>
        )}
        {balances.map((balance) => (
          <div
            key={balance.member}
            className="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
          >
            <span className="font-medium text-neutral-900">{balance.member}</span>
            <span
              className={`font-semibold ${
                balance.net > 0
                  ? "text-green-600"
                  : balance.net < 0
                    ? "text-red-600"
                    : "text-neutral-400"
              }`}
            >
              {balance.net > 0 && `${t("isOwed")} `}
              {balance.net < 0 && `${t("owes")} `}
              {balance.net === 0
                ? t("settledUp")
                : formatAmount(Math.abs(balance.net), currency)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
