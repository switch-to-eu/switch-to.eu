"use client";

import { useTranslations } from "next-intl";
import type { Settlement } from "@/lib/interfaces";
import { formatAmount } from "@/lib/settle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@switch-to-eu/ui/components/card";
import { ArrowRight, CheckCircle } from "lucide-react";

interface SettlementsProps {
  settlements: Settlement[];
  currency: string;
}

export function Settlements({ settlements, currency }: SettlementsProps) {
  const t = useTranslations("Settlements");

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {settlements.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-3" />
            <p className="text-green-600 font-medium">{t("noSettlements")}</p>
          </div>
        ) : (
          <>
            {settlements.map((settlement, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg bg-white border border-neutral-100 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-red-600 truncate">
                    {settlement.from}
                  </span>
                  <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span className="font-semibold text-green-600 truncate">
                    {settlement.to}
                  </span>
                </div>
                <span className="font-bold text-neutral-900 ml-4 shrink-0">
                  {formatAmount(settlement.amount, currency)}
                </span>
              </div>
            ))}
            <p className="text-sm text-neutral-500 text-center pt-2">
              {settlements.length} {t("totalTransactions")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
