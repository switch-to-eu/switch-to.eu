"use client";

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
            className={`flex items-center gap-3 rounded-xl p-4 text-left font-medium transition-all ${
              isSelected
                ? "bg-tool-primary text-white ring-4 ring-tool-primary/30 scale-[0.98]"
                : "bg-white border-2 border-tool-primary/20 text-foreground hover:border-tool-primary/40 hover:bg-tool-surface/10"
            } ${
              disabled && !isSelected ? "opacity-50 cursor-not-allowed" : ""
            } ${
              disabled && isSelected ? "opacity-90" : ""
            }`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isSelected ? "bg-white/20 text-white" : "bg-tool-primary/10 text-tool-primary"
            }`}>
              {getOptionLabel(i)}
            </span>
            <span className="flex-1">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
