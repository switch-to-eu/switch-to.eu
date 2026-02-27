"use client";

const BUTTON_STYLES = [
  "bg-red-500 hover:bg-red-600 active:bg-red-700",
  "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
  "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700",
  "bg-green-500 hover:bg-green-600 active:bg-green-700",
  "bg-purple-500 hover:bg-purple-600 active:bg-purple-700",
  "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
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
