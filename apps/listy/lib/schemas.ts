import { z } from "zod";

export const LIST_PRESETS = ["plain", "shopping", "potluck"] as const;
export type ListPreset = (typeof LIST_PRESETS)[number];

export type ValidationMessages = {
  required: string;
  maxLength: string;
  min: string;
  max: string;
};

export const createListSchema = (v: ValidationMessages) =>
  z.object({
    title: z.string().min(1, v.required).max(200, v.maxLength),
    description: z.string().max(500, v.maxLength).optional().or(z.literal("")),
    preset: z.enum(LIST_PRESETS),
    expirationDays: z.number().min(1, v.min).max(365, v.max),
  });

export const createListFormSchema = (v: ValidationMessages) =>
  createListSchema(v).extend({
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: v.required }),
    }),
  });

export type CreateListFormData = z.infer<ReturnType<typeof createListFormSchema>>;
