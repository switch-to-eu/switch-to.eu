"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Label } from "@switch-to-eu/ui/components/label";
import { cn } from "@switch-to-eu/ui/lib/utils";
import type { FieldError, FieldValues, Path, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface TimeSlot {
  hour: number;
  minutes: number;
}

interface TimeSlotsManagerProps<T extends FieldValues> {
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
  error?: FieldError | FieldError[];
  label?: string;
  description?: string;
  selectedTimesFieldName: string;
  durationFieldName: string;
  className?: string;
}

const QUICK_TIMES: TimeSlot[] = [
  { hour: 9, minutes: 0 },
  { hour: 10, minutes: 0 },
  { hour: 11, minutes: 0 },
  { hour: 13, minutes: 0 },
  { hour: 14, minutes: 0 },
  { hour: 15, minutes: 0 },
  { hour: 16, minutes: 0 },
  { hour: 17, minutes: 0 },
  { hour: 18, minutes: 0 },
  { hour: 19, minutes: 0 },
  { hour: 20, minutes: 0 },
];

export function TimeSlotsManager<T extends FieldValues>({
  name,
  setValue,
  watch,
  error,
  label,
  description,
  selectedTimesFieldName,
  durationFieldName,
  className,
}: TimeSlotsManagerProps<T>) {
  const selectedTimes = (watch(selectedTimesFieldName as Path<T>) as TimeSlot[]) || [];
  const duration = (watch(durationFieldName as Path<T>) as number) || 1;

  const addTime = (slot: TimeSlot) => {
    const exists = selectedTimes.some(
      (t) => t.hour === slot.hour && t.minutes === slot.minutes
    );
    if (!exists) {
      setValue(
        selectedTimesFieldName as Path<T>,
        [...selectedTimes, slot].sort((a, b) => a.hour * 60 + a.minutes - (b.hour * 60 + b.minutes)) as any
      );
    }
  };

  const removeTime = (index: number) => {
    setValue(
      selectedTimesFieldName as Path<T>,
      selectedTimes.filter((_, i) => i !== index) as any
    );
  };

  const formatTime = (slot: TimeSlot) => {
    const h = slot.hour.toString().padStart(2, "0");
    const m = slot.minutes.toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatEndTime = (slot: TimeSlot) => {
    const totalMinutes = slot.hour * 60 + slot.minutes + duration * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMin = totalMinutes % 60;
    return `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label className="text-base font-medium">{label}</Label>}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK_TIMES.map((slot) => {
          const isSelected = selectedTimes.some(
            (t) => t.hour === slot.hour && t.minutes === slot.minutes
          );
          return (
            <button
              key={`${slot.hour}:${slot.minutes}`}
              type="button"
              onClick={() => isSelected ? undefined : addTime(slot)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                isSelected
                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {formatTime(slot)}
            </button>
          );
        })}
      </div>

      {/* Selected Times */}
      {selectedTimes.length > 0 && (
        <div className="space-y-2">
          {selectedTimes.map((slot, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm"
            >
              <span className="text-sm font-medium">
                {formatTime(slot)} – {formatEndTime(slot)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTime(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {Array.isArray(error) ? error[0]?.message : error.message}
        </p>
      )}
    </div>
  );
}
