import { z } from "zod";

export const LIST_PRESETS = ["plain", "shopping", "potluck"] as const;
export type ListPreset = (typeof LIST_PRESETS)[number];

export const createListSchema = z.object({
  title: z.string().min(1, "required").max(200, "maxLength"),
  description: z.string().max(500, "maxLength").optional().or(z.literal("")),
  preset: z.enum(LIST_PRESETS),
  expirationDays: z.number().min(1, "min").max(365, "max"),
});

export type CreateListFormData = z.infer<typeof createListSchema>;
