import { z } from "zod";

export const quizIdSchema = z.string().min(10).max(10);

export const sessionIdSchema = z.string().min(8).max(8);

export const joinCodeSchema = z.string().min(6).max(6).toUpperCase();

export const nicknameSchema = z.string().min(1).max(30).trim();

export const timerSecondsSchema = z.number().min(0).max(120);

export const expirationHoursSchema = z.number().min(1).max(168);

export const questionIndexSchema = z.number().int().min(0);

export const answerIndexSchema = z.number().int().min(0).max(5);

// Form schemas

export const questionFormSchema = z.object({
  text: z.string().min(1, "required"),
  options: z.array(z.string().min(1, "required")).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const quizFormSchema = z.object({
  title: z.string().min(1, "required").max(200, "maxLength"),
  description: z.string().max(500, "maxLength").optional().or(z.literal("")),
  questions: z.array(questionFormSchema).min(1, "minQuestions"),
  timerSeconds: z.number().min(0).max(120),
  expirationHours: z.number().min(1).max(168),
});

export type QuizFormData = z.infer<typeof quizFormSchema>;
export type QuestionFormData = z.infer<typeof questionFormSchema>;
