"use client";

import { use } from "react";
import { useLoadGroup } from "@hooks/useLoadGroup";
import { calculateBalances, calculateSettlements } from "@/lib/settle";
import { MissingKeyError, GroupNotFoundError, DecryptionError } from "@components/error-states";
import { GroupLoading } from "@components/group-loading";
import { ExpenseList } from "@components/expense-list";
import { Balances } from "@components/balances";
import { Settlements } from "@components/settlements";
import { AddExpenseDialog } from "@components/add-expense-dialog";
import { Users } from "lucide-react";

export default function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { group, state, error, encryptionKey } = useLoadGroup(id);

  if (state === "loading") return <GroupLoading />;
  if (state === "missing-key") return <MissingKeyError />;
  if (state === "not-found") return <GroupNotFoundError />;
  if (state === "decryption-error") return <DecryptionError message={error} />;
  if (!group) return <GroupLoading />;

  const balances = calculateBalances(group.expenses, group.members);
  const settlements = calculateSettlements(balances);

  return (
    <div className="container mx-auto max-w-4xl py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            {group.name}
          </h1>
          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
            <Users className="h-3.5 w-3.5" />
            {group.members.length} {" members"} · {group.currency}
          </p>
        </div>
        <AddExpenseDialog
          groupId={id}
          encryptionKey={encryptionKey}
          members={group.members}
          currency={group.currency}
        />
      </div>

      {/* Settlements - the key feature! */}
      {group.expenses.length > 0 && (
        <Settlements settlements={settlements} currency={group.currency} />
      )}

      {/* Balances */}
      {group.expenses.length > 0 && (
        <Balances balances={balances} currency={group.currency} />
      )}

      {/* Expense list */}
      <ExpenseList expenses={group.expenses} currency={group.currency} />
    </div>
  );
}
