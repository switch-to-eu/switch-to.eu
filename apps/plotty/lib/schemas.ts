import { z } from "zod";

export const pollSchema = z.object({
  title: z.string().min(1, "required").max(100, "maxLength"),

  description: z.string().max(500, "maxLength").optional().or(z.literal("")),

  location: z.string().max(100, "maxLength").optional().or(z.literal("")),

  selectedDates: z
    .array(z.date())
    .min(1, "arrayMinLength")
    .refine((dates) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      return dates.every((date) => {
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);
        return dateToCheck >= today;
      });
    }, "futureDate"),

  expirationDays: z.number().min(1, "min").max(365, "max"),

  enableTimeSelection: z.boolean().default(false),
  fixedDuration: z.number().min(1).max(8).optional(), // 1-8 hours - applies to all start times
  selectedStartTimes: z.array(z.object({
    hour: z.number().min(0).max(23), // 0-23 hours
    minutes: z.number().refine(val => [0, 15, 30, 45].includes(val), "Must be 0, 15, 30, or 45"), // 15-minute intervals
  })).default([]), // Array of start times
});

export type PollFormData = z.infer<typeof pollSchema>;
