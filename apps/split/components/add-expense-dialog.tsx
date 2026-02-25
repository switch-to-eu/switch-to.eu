"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { EncryptedExpenseData, ExpenseSplit } from "@/lib/interfaces";
import { parseToCents } from "@/lib/settle";
import { useAddExpense } from "@hooks/useAddExpense";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { Label } from "@switch-to-eu/ui/components/label";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@switch-to-eu/ui/components/dialog";
import { Plus } from "lucide-react";

interface AddExpenseDialogProps {
  groupId: string;
  encryptionKey: string;
  members: string[];
  currency: string;
}

export function AddExpenseDialog({
  groupId,
  encryptionKey,
  members,
  currency,
}: AddExpenseDialogProps) {
  const t = useTranslations("AddExpense");
  const { addExpense, isLoading } = useAddExpense();
  const [open, setOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "exact" | "percentage">("equal");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(members));
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]!);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplitType("equal");
    setSelectedMembers(new Set(members));
    setExactAmounts({});
    setPercentages({});
    setDate(new Date().toISOString().split("T")[0]!);
  };

  const toggleMember = (member: string) => {
    const next = new Set(selectedMembers);
    if (next.has(member)) {
      next.delete(member);
    } else {
      next.add(member);
    }
    setSelectedMembers(next);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error(t("errorNoDescription"));
      return;
    }
    const totalCents = parseToCents(amount);
    if (totalCents <= 0) {
      toast.error(t("errorNoAmount"));
      return;
    }
    if (!paidBy) {
      toast.error(t("errorNoPayer"));
      return;
    }
    if (selectedMembers.size === 0) {
      toast.error(t("errorNoSplit"));
      return;
    }

    let splits: ExpenseSplit[];

    if (splitType === "equal") {
      splits = Array.from(selectedMembers).map((member) => ({ member }));
    } else if (splitType === "exact") {
      splits = Array.from(selectedMembers).map((member) => ({
        member,
        amount: parseToCents(exactAmounts[member] ?? "0"),
      }));
      const splitTotal = splits.reduce((sum, s) => sum + (s.amount ?? 0), 0);
      if (Math.abs(splitTotal - totalCents) > 1) {
        toast.error(t("errorSplitMismatch"));
        return;
      }
    } else {
      splits = Array.from(selectedMembers).map((member) => ({
        member,
        percentage: parseFloat(percentages[member] ?? "0"),
      }));
      const pctTotal = splits.reduce((sum, s) => sum + (s.percentage ?? 0), 0);
      if (Math.abs(pctTotal - 100) > 0.01) {
        toast.error(t("errorPercentageMismatch"));
        return;
      }
    }

    const expense: EncryptedExpenseData = {
      description: description.trim(),
      amount: totalCents,
      paidBy,
      splitType,
      splits,
      date,
    };

    try {
      await addExpense(groupId, encryptionKey, expense);
      toast.success(t("success"));
      resetForm();
      setOpen(false);
    } catch {
      toast.error(t("error"));
    }
  };

  const currencySymbol = (() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? currency;
    } catch {
      return currency;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Description */}
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={200}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>{t("amount")} ({currencySymbol})</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t("amountPlaceholder")}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{t("date")}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Paid by */}
          <div className="space-y-2">
            <Label>{t("paidBy")}</Label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">{t("selectPayer")}</option>
              {members.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Split type */}
          <div className="space-y-2">
            <Label>{t("splitType")}</Label>
            <div className="flex gap-2">
              {(["equal", "exact", "percentage"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={splitType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSplitType(type)}
                >
                  {t(type)}
                </Button>
              ))}
            </div>
          </div>

          {/* Split among */}
          <div className="space-y-2">
            <Label>{t("splitAmong")}</Label>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member} className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedMembers.has(member)}
                    onCheckedChange={() => toggleMember(member)}
                  />
                  <span className="text-sm font-medium flex-1">{member}</span>
                  {splitType === "exact" && selectedMembers.has(member) && (
                    <Input
                      type="text"
                      inputMode="decimal"
                      className="w-24"
                      placeholder="0.00"
                      value={exactAmounts[member] ?? ""}
                      onChange={(e) =>
                        setExactAmounts({ ...exactAmounts, [member]: e.target.value })
                      }
                    />
                  )}
                  {splitType === "percentage" && selectedMembers.has(member) && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="w-20"
                        placeholder="0"
                        value={percentages[member] ?? ""}
                        onChange={(e) =>
                          setPercentages({ ...percentages, [member]: e.target.value })
                        }
                      />
                      <span className="text-sm text-neutral-500">%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <LoadingButton
              className="flex-1"
              loading={isLoading}
              loadingText={t("saving")}
              onClick={handleSubmit}
            >
              {t("save")}
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
