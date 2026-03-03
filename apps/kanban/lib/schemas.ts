import { z } from "zod";

export type ValidationMessages = {
  required: string;
  maxLength: string;
  min: string;
  max: string;
};

export const createBoardSchema = (v: ValidationMessages) =>
  z.object({
    title: z.string().min(1, v.required).max(200, v.maxLength),
    description: z
      .string()
      .max(500, v.maxLength)
      .optional()
      .or(z.literal("")),
    expirationDays: z.number().min(1, v.min).max(365, v.max),
  });

export const createBoardFormSchema = (v: ValidationMessages) =>
  createBoardSchema(v).extend({
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: v.required }),
    }),
  });

export type CreateBoardFormData = z.infer<
  ReturnType<typeof createBoardFormSchema>
>;
