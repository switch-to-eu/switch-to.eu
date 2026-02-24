"use client";

import { Input } from "@switch-to-eu/ui/components/input";
import { Label } from "@switch-to-eu/ui/components/label";
import { cn } from "@switch-to-eu/ui/lib/utils";
import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";
import type { ZodType } from "zod";

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  schema?: ZodType;
  type?: string;
  className?: string;
  disabled?: boolean;
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  placeholder,
  register,
  error,
  type = "text",
  className,
  disabled,
}: FormInputProps<T>) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error && "border-red-500")}
        {...register(name)}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}
