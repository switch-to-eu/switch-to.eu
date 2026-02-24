"use client";

import { Label } from "@switch-to-eu/ui/components/label";
import { cn } from "@switch-to-eu/ui/lib/utils";
import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";
import type { ZodType } from "zod";

interface FormTextAreaProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  schema?: ZodType;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export function FormTextArea<T extends FieldValues>({
  label,
  name,
  placeholder,
  register,
  error,
  rows = 3,
  className,
  disabled,
}: FormTextAreaProps<T>) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500",
          className
        )}
        {...register(name)}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}
