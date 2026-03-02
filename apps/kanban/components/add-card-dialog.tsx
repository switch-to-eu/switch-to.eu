"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import { Label } from "@switch-to-eu/ui/components/label";
import type { DecryptedCardData } from "@/lib/types";

const AVAILABLE_LABELS = ["bug", "feature", "improvement", "urgent", "design", "research"];

const LABEL_COLORS: Record<string, string> = {
  bug: "bg-red-100 text-red-700 border-red-200",
  feature: "bg-blue-100 text-blue-700 border-blue-200",
  improvement: "bg-green-100 text-green-700 border-green-200",
  urgent: "bg-orange-100 text-orange-700 border-orange-200",
  design: "bg-purple-100 text-purple-700 border-purple-200",
  research: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

interface AddCardDialogProps {
  initialData?: DecryptedCardData;
  onSave: (data: Omit<DecryptedCardData, "id">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function AddCardDialog({ initialData, onSave, onCancel, onDelete }: AddCardDialogProps) {
  const t = useTranslations("BoardPage.cardDialog");
  const labelsT = useTranslations("BoardPage.labels");

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [labels, setLabels] = useState<string[]>(initialData?.labels || []);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");

  const isEditing = !!initialData;

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      labels: labels.length > 0 ? labels : undefined,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? t("editTitle") : t("addTitle")}
          </h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="card-title">{t("titleLabel")}</Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              maxLength={200}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="card-description">{t("descriptionLabel")}</Label>
            <Textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Labels */}
          <div>
            <Label>{t("labelsLabel")}</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AVAILABLE_LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                    labels.includes(label)
                      ? LABEL_COLORS[label] || "bg-gray-100 text-gray-700 border-gray-200"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => toggleLabel(label)}
                >
                  {labelsT(label)}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="card-due-date">{t("dueDateLabel")}</Label>
            <Input
              id="card-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div>
            {isEditing && onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                {t("delete")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {t("save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
