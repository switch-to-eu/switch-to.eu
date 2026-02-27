"use client";

import { Trash2, Check, Copy, Plus, X, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@switch-to-eu/ui/components/input";
import { Button } from "@switch-to-eu/ui/components/button";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import type { DecryptedQuestion } from "@/lib/interfaces";

const OPTION_COLORS = [
  "border-red-300 focus-within:border-red-500",
  "border-blue-300 focus-within:border-blue-500",
  "border-yellow-300 focus-within:border-yellow-500",
  "border-green-300 focus-within:border-green-500",
  "border-purple-300 focus-within:border-purple-500",
  "border-orange-300 focus-within:border-orange-500",
];

const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C, D, E, F
}

interface QuestionEditorProps {
  index: number;
  question: DecryptedQuestion;
  onChange: (question: DecryptedQuestion) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  canRemove: boolean;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
  };
}

export function QuestionEditor({
  index,
  question,
  onChange,
  onRemove,
  onDuplicate,
  canRemove,
  dragHandleProps,
}: QuestionEditorProps) {
  const t = useTranslations("create");

  const handleAddOption = () => {
    if (question.options.length >= MAX_OPTIONS) return;
    onChange({ ...question, options: [...question.options, ""] });
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (question.options.length <= MIN_OPTIONS) return;
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    // Adjust correctIndex if needed
    let newCorrectIndex = question.correctIndex;
    if (optionIndex === question.correctIndex) {
      newCorrectIndex = 0;
    } else if (optionIndex < question.correctIndex) {
      newCorrectIndex = question.correctIndex - 1;
    }
    onChange({ ...question, options: newOptions, correctIndex: newCorrectIndex });
  };

  return (
    <div className="rounded-lg border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {dragHandleProps && (
            <button
              type="button"
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground -ml-1"
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {index + 1}.
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="text-muted-foreground hover:text-foreground"
            title={t("duplicateQuestion")}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-muted-foreground hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Input
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        placeholder={t("questionPlaceholder")}
        className="text-base font-medium"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, i) => (
          <div
            key={i}
            className={`relative flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-colors ${OPTION_COLORS[i % OPTION_COLORS.length]} ${
              question.correctIndex === i
                ? "bg-green-50 border-green-500 ring-2 ring-green-200"
                : ""
            }`}
          >
            <button
              type="button"
              onClick={() => onChange({ ...question, correctIndex: i })}
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                question.correctIndex === i
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              title={t("correctAnswer")}
            >
              {question.correctIndex === i ? (
                <Check className="h-4 w-4" />
              ) : (
                getOptionLabel(i)
              )}
            </button>
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...question.options];
                newOptions[i] = e.target.value;
                onChange({ ...question, options: newOptions });
              }}
              placeholder={t("optionPlaceholder", { number: i + 1 })}
              className="border-0 shadow-none focus-visible:ring-0 px-0"
            />
            {question.options.length > MIN_OPTIONS && (
              <button
                type="button"
                onClick={() => handleRemoveOption(i)}
                className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                title={t("removeOption")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {question.options.length < MAX_OPTIONS && (
        <button
          type="button"
          onClick={handleAddOption}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addOption")}
        </button>
      )}
    </div>
  );
}
