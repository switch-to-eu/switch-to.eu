"use client";

const BUTTON_STYLES = [
  "bg-destructive hover:bg-destructive/90 active:bg-destructive/80",
  "bg-tool-primary hover:bg-tool-primary/90 active:bg-tool-primary/80",
  "bg-warning hover:bg-warning/90 active:bg-warning/80",
  "bg-success hover:bg-success/90 active:bg-success/80",
  "bg-brand-navy hover:bg-brand-navy/90 active:bg-brand-navy/80",
  "bg-tool-accent hover:bg-tool-accent/90 active:bg-tool-accent/80",
];

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

interface AnswerButtonsProps {
  options: string[];
  onSelect: (index: number) => void;
  disabled: boolean;
  selectedIndex?: number;
}

export function AnswerButtons({
  options,
  onSelect,
  disabled,
  selectedIndex,
}: AnswerButtonsProps) {
  const useGrid = options.length >= 4;

  return (
    <div className={`grid gap-3 ${useGrid ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
      {options.map((option, i) => {
        const isSelected = selectedIndex === i;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            disabled={disabled}
            className={`flex items-center gap-3 rounded-xl p-4 text-left text-white font-medium transition-all ${
              BUTTON_STYLES[i % BUTTON_STYLES.length]
            } ${
              isSelected ? "ring-4 ring-white/50 scale-[0.98]" : ""
            } ${
              disabled && !isSelected ? "opacity-50 cursor-not-allowed" : ""
            } ${
              disabled && isSelected ? "opacity-90" : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {getOptionLabel(i)}
            </span>
            <span className="flex-1">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
