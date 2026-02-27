import { z } from "zod";

export const quizIdSchema = z.string().min(10).max(10);

export const sessionIdSchema = z.string().min(8).max(8);

export const joinCodeSchema = z.string().min(6).max(6).toUpperCase();

export const nicknameSchema = z.string().min(1).max(30).trim();

export const timerSecondsSchema = z.number().min(0).max(120);

export const expirationHoursSchema = z.number().min(1).max(168);

export const questionIndexSchema = z.number().int().min(0);

export const answerIndexSchema = z.number().int().min(0).max(5);
