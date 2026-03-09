"use client";

import { Label } from "@switch-to-eu/ui/components/label";
import { cn } from "@switch-to-eu/ui/lib/utils";
import type { Control, FieldError, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

interface DurationSelectorProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  error?: FieldError;
  label?: string;
  description?: string;
  className?: string;
}

const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 3, 4];

export function DurationSelector<T extends FieldValues>({
  name,
  control,
  error,
  label,
  description,
  className,
}: DurationSelectorProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label>{label}</Label>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => field.onChange(duration)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  field.value === duration
                    ? "bg-tool-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                {duration}h
              </button>
            ))}
          </div>
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}
