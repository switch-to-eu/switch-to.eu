import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1, "required").max(200, "maxLength"),
  description: z.string().max(500, "maxLength").optional().or(z.literal("")),
  expirationDays: z.number().min(1, "min").max(365, "max"),
});

export const createBoardFormSchema = createBoardSchema.extend({
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "required" }),
  }),
});

export type CreateBoardFormData = z.infer<typeof createBoardFormSchema>;
