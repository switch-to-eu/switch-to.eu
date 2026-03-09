import { z } from "zod";

export type ValidationMessages = {
  required: string;
  maxLength: string;
  arrayMinLength: string;
  futureDate: string;
  min: string;
  max: string;
};

export const createPollSchema = (v: ValidationMessages) =>
  z.object({
    title: z.string().min(1, v.required).max(100, v.maxLength),

    description: z.string().max(500, v.maxLength).optional().or(z.literal("")),

    location: z.string().max(100, v.maxLength).optional().or(z.literal("")),

    selectedDates: z
      .array(z.date())
      .min(1, v.arrayMinLength)
      .refine((dates) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dates.every((date) => {
          const dateToCheck = new Date(date);
          dateToCheck.setHours(0, 0, 0, 0);
          return dateToCheck >= today;
        });
      }, v.futureDate),

    expirationDays: z.number().min(1, v.min).max(365, v.max),

    enableTimeSelection: z.boolean().default(false),
    fixedDuration: z.number().min(1).max(8).optional(), // 1-8 hours - applies to all start times
    selectedStartTimes: z
      .array(
        z.object({
          hour: z.number().min(0).max(23), // 0-23 hours
          minutes: z
            .number()
            .refine((val) => [0, 15, 30, 45].includes(val)), // 15-minute intervals
        })
      )
      .default([]), // Array of start times
  });

export type PollFormData = z.infer<ReturnType<typeof createPollSchema>>;
