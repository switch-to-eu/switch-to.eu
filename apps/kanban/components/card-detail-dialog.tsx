"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Calendar, Tag, AlignLeft, Trash2 } from "lucide-react";

import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import { Label } from "@switch-to-eu/ui/components/label";
import type { DecryptedCardData } from "@/lib/types";

const AVAILABLE_LABELS = [
  "bug",
  "feature",
  "improvement",
  "urgent",
  "design",
  "research",
];

const LABEL_COLORS: Record<string, string> = {
  bug: "bg-destructive/10 text-destructive border-destructive/20",
  feature: "bg-tool-primary/10 text-tool-primary border-tool-primary/20",
  improvement: "bg-success/10 text-success border-success/20",
  urgent: "bg-warning/10 text-warning border-warning/20",
  design: "bg-tool-accent/20 text-tool-accent border-tool-accent/30",
  research: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

interface CardDetailDialogProps {
  data: DecryptedCardData;
  // eslint-disable-next-line no-unused-vars
  onSave: (data: Omit<DecryptedCardData, "id">) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function CardDetailDialog({
  data,
  onSave,
  onClose,
  onDelete,
}: CardDetailDialogProps) {
  const t = useTranslations("BoardPage.cardDialog");
  const labelsT = useTranslations("BoardPage.labels");

  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description || "");
  const [labels, setLabels] = useState<string[]>(data.labels || []);
  const [dueDate, setDueDate] = useState(data.dueDate || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label],
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[10vh] overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 mb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex-1 mr-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-0 px-0 shadow-none focus-visible:ring-0 h-auto"
              placeholder={t("titlePlaceholder")}
              maxLength={200}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-5">
          {/* Labels */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">{t("labelsLabel")}</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                    labels.includes(label)
                      ? LABEL_COLORS[label] ||
                        "bg-muted text-foreground border-border"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted"
                  }`}
                  onClick={() => toggleLabel(label)}
                >
                  {labelsT(label)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                {t("descriptionLabel")}
              </Label>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={2000}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">{t("dueDateLabel")}</Label>
            </div>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 pt-0">
          <div>
            {confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive">
                  {t("deleteConfirmTitle")}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                >
                  {t("delete")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                >
                  {t("cancel")}
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {t("delete")}
              </Button>
            )}
          </div>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
