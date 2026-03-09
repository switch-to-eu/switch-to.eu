import { z } from "zod";

export const quizIdSchema = z.string().min(10).max(10);

export const sessionIdSchema = z.string().min(8).max(8);

export const nicknameSchema = z.string().min(1).max(30).trim();

export const timerSecondsSchema = z.number().min(0).max(120);

export const expirationHoursSchema = z.number().min(0).max(168);

export const questionIndexSchema = z.number().int().min(0);

export const answerIndexSchema = z.number().int().min(0).max(5);

// Form schemas

export type ValidationMessages = {
  required: string;
  maxLength: string;
  minQuestions: string;
};

export const createQuestionFormSchema = (v: ValidationMessages) =>
  z.object({
    text: z.string().min(1, v.required),
    options: z.array(z.string().min(1, v.required)).min(2).max(6),
    correctIndex: z.number().int().min(0),
  });

export const createQuizFormSchema = (v: ValidationMessages) =>
  z.object({
    title: z.string().min(1, v.required).max(200, v.maxLength),
    description: z.string().max(500, v.maxLength).optional().or(z.literal("")),
    questions: z.array(createQuestionFormSchema(v)).min(1, v.minQuestions),
    timerSeconds: z.number().min(0).max(120),
    expirationHours: z.number().min(0).max(168),
    scoringEnabled: z.boolean(),
    leaderboardEnabled: z.boolean(),
  });

export type QuizFormData = z.infer<ReturnType<typeof createQuizFormSchema>>;
export type QuestionFormData = z.infer<
  ReturnType<typeof createQuestionFormSchema>
>;
