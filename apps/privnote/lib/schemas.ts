import { z } from "zod";

export const EXPIRY_OPTIONS = ["5m", "30m", "1h", "24h", "7d"] as const;

export type ValidationMessages = {
  required: string;
  maxLength: string;
  termsRequired: string;
};

export const createNoteSchema = (v: ValidationMessages) =>
  z.object({
    content: z.string().min(1, v.required).max(50000, v.maxLength),
    expiry: z.enum(EXPIRY_OPTIONS),
    burnAfterReading: z.boolean(),
    password: z.string().optional().or(z.literal("")),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: v.termsRequired,
    }),
  });

export type CreateNoteFormData = z.infer<ReturnType<typeof createNoteSchema>>;
