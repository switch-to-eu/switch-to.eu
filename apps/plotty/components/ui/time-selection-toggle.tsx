"use client";

import { Label } from "@switch-to-eu/ui/components/label";
import { cn } from "@switch-to-eu/ui/lib/utils";
import type { Control, FieldError, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

interface TimeSelectionToggleProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  error?: FieldError;
  description?: string;
  className?: string;
}

export function TimeSelectionToggle<T extends FieldValues>({
  name,
  control,
  error,
  description,
  className,
}: TimeSelectionToggleProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => field.onChange(false)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  !field.value
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                All Day
              </button>
              <button
                type="button"
                onClick={() => field.onChange(true)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  field.value
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Time Slots
              </button>
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}
