import { z } from "zod";

export const EXPIRY_OPTIONS = ["5m", "30m", "1h", "24h", "7d"] as const;

export const createNoteSchema = z.object({
  content: z.string().min(1, "required").max(50000, "maxLength"),
  expiry: z.enum(EXPIRY_OPTIONS),
  burnAfterReading: z.boolean(),
  password: z.string().optional().or(z.literal("")),
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;
