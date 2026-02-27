import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import type { RedisClientType } from "@switch-to-eu/db/redis";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getRedisSubscriber } from "@switch-to-eu/db/redis";
import { generateAdminToken, hashAdminToken, verifyAdminToken } from "@switch-to-eu/db/admin";
import { calculateTTLSeconds } from "@switch-to-eu/db/expiration";
import type {
  RedisQuizHash,
  RedisQuestionHash,
  RedisParticipantHash,
  RedisAnswerHash,
  QuizState,
  QuizResponse,
  ParticipantInfo,
  QuestionResponse,
  AnswerInfo,
  QuizStateUpdate,
} from "@/server/db/types";

// --- Utility functions ---

function generateQuizId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[randomInt(chars.length)]!).join("");
}

function generateSessionId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[randomInt(chars.length)]!).join("");
}

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[randomInt(chars.length)]!).join("");
}

async function getValidQuiz(
  redis: RedisClientType,
  id: string
): Promise<RedisQuizHash> {
  const quiz = (await redis.hGetAll(`quiz:${id}`)) as unknown as RedisQuizHash;

  if (!quiz || !quiz.encryptedData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
  }

  if (new Date(quiz.expiresAt) < new Date()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Quiz has expired" });
  }

  return quiz;
}

function quizHashToResponse(id: string, quiz: RedisQuizHash): QuizResponse {
  return {
    id,
    joinCode: quiz.joinCode,
    state: quiz.state,
    currentQuestion: parseInt(quiz.currentQuestion, 10) || 0,
    questionStartedAt: quiz.questionStartedAt,
    timerSeconds: parseInt(quiz.timerSeconds, 10),
    questionCount: parseInt(quiz.questionCount, 10) || 0,
    version: parseInt(quiz.version, 10) || 1,
    encryptedData: quiz.encryptedData,
    createdAt: quiz.createdAt,
    expiresAt: quiz.expiresAt,
  };
}

async function getParticipants(
  redis: RedisClientType,
  quizId: string
): Promise<ParticipantInfo[]> {
  const sessionIds = await redis.sMembers(`quiz:${quizId}:participants`);
  if (!sessionIds.length) return [];

  const participants: ParticipantInfo[] = [];
  for (const sid of sessionIds) {
    const p = (await redis.hGetAll(`quiz:${quizId}:p:${sid}`)) as unknown as RedisParticipantHash;
    if (p && p.nickname) {
      participants.push({
        sessionId: sid,
        nickname: p.nickname,
        joinedAt: p.joinedAt,
      });
    }
  }
  return participants;
}

async function getAnswersForQuestion(
  redis: RedisClientType,
  quizId: string,
  questionIndex: number
): Promise<AnswerInfo[]> {
  const orderKey = `quiz:${quizId}:order:${questionIndex}`;
  const order = await redis.lRange(orderKey, 0, -1);

  const answers: AnswerInfo[] = [];
  for (let i = 0; i < order.length; i++) {
    const sid = order[i]!;
    const answer = (await redis.hGetAll(
      `quiz:${quizId}:a:${questionIndex}:${sid}`
    )) as unknown as RedisAnswerHash;
    if (answer && answer.encryptedAnswer) {
      answers.push({
        sessionId: sid,
        encryptedAnswer: answer.encryptedAnswer,
        position: i + 1,
        answeredAt: answer.answeredAt,
      });
    }
  }
  return answers;
}

async function publishQuizUpdate(
  redis: RedisClientType,
  quizId: string
): Promise<void> {
  await redis.publish(`quiz:channel:${quizId}`, "updated");
}

function isValidTransition(from: QuizState, to: QuizState): boolean {
  const validTransitions: Record<QuizState, QuizState[]> = {
    lobby: ["active"],
    active: ["results"],
    results: ["active", "finished"],
    finished: ["lobby"],
  };
  return validTransitions[from]?.includes(to) ?? false;
}

// --- Constants ---

const MAX_ENCRYPTED_DATA_SIZE = 65_536;
const MAX_ENCRYPTED_QUESTION_SIZE = 16_384;
const MAX_ENCRYPTED_ANSWER_SIZE = 4_096;
const MAX_QUESTIONS = 50;
const MAX_PARTICIPANTS = 50;

// --- Input schemas ---

const quizIdSchema = z.string().length(10).regex(/^[A-Za-z0-9]+$/);
const sessionIdSchema = z.string().length(8).regex(/^[A-Za-z0-9]+$/);
const joinCodeSchema = z.string().length(6).regex(/^[A-Z0-9]+$/);

// --- Router ---

export const quizRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      encryptedData: z.string().min(1).max(MAX_ENCRYPTED_DATA_SIZE),
      timerSeconds: z.number().int().min(0).max(120),
      expirationHours: z.number().int().min(1).max(168).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const quizId = generateQuizId();
      const joinCode = generateJoinCode();
      const adminToken = generateAdminToken();
      const hashedToken = hashAdminToken(adminToken);
      const now = new Date();
      const hours = input.expirationHours ?? 24;
      const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
      const ttl = calculateTTLSeconds(expiresAt.toISOString());

      const quizHash: RedisQuizHash = {
        encryptedData: input.encryptedData,
        adminToken: hashedToken,
        joinCode,
        state: "lobby",
        currentQuestion: "0",
        questionStartedAt: "",
        timerSeconds: String(input.timerSeconds),
        questionCount: "0",
        version: "1",
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const multi = ctx.redis.multi();
      multi.hSet(`quiz:${quizId}`, quizHash as unknown as Record<string, string>);
      multi.expire(`quiz:${quizId}`, ttl);
      multi.set(`quiz:join:${joinCode}`, quizId);
      multi.expire(`quiz:join:${joinCode}`, ttl);
      await multi.exec();

      return {
        quiz: quizHashToResponse(quizId, quizHash),
        adminToken,
        joinCode,
      };
    }),

  addQuestion: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
      encryptedQuestion: z.string().min(1).max(MAX_ENCRYPTED_QUESTION_SIZE),
      timerOverride: z.number().int().min(5).max(120).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (quiz.state !== "lobby") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only add questions in lobby state" });
      }

      const currentCount = parseInt(quiz.questionCount, 10) || 0;
      if (currentCount >= MAX_QUESTIONS) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Maximum ${MAX_QUESTIONS} questions allowed` });
      }

      const index = currentCount;
      const ttl = calculateTTLSeconds(quiz.expiresAt);

      const questionHash: RedisQuestionHash = {
        encryptedQuestion: input.encryptedQuestion,
        timerOverride: input.timerOverride ? String(input.timerOverride) : "",
      };

      const multi = ctx.redis.multi();
      multi.hSet(`quiz:${input.quizId}:q:${index}`, questionHash as unknown as Record<string, string>);
      multi.expire(`quiz:${input.quizId}:q:${index}`, ttl);
      multi.hSet(`quiz:${input.quizId}`, {
        questionCount: String(index + 1),
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });
      await multi.exec();

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { index };
    }),

  updateQuestion: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
      index: z.number().int().min(0),
      encryptedQuestion: z.string().min(1).max(MAX_ENCRYPTED_QUESTION_SIZE),
      timerOverride: z.number().int().min(5).max(120).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (quiz.state !== "lobby") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only update questions in lobby state" });
      }

      const questionCount = parseInt(quiz.questionCount, 10) || 0;
      if (input.index >= questionCount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      await ctx.redis.hSet(`quiz:${input.quizId}:q:${input.index}`, {
        encryptedQuestion: input.encryptedQuestion,
        timerOverride: input.timerOverride ? String(input.timerOverride) : "",
      });

      await ctx.redis.hSet(`quiz:${input.quizId}`, {
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { index: input.index };
    }),

  removeQuestion: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
      index: z.number().int().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (quiz.state !== "lobby") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only remove questions in lobby state" });
      }

      const questionCount = parseInt(quiz.questionCount, 10) || 0;
      if (input.index >= questionCount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      // Shift questions down to fill the gap
      const ttl = calculateTTLSeconds(quiz.expiresAt);
      for (let i = input.index; i < questionCount - 1; i++) {
        const nextQ = await ctx.redis.hGetAll(`quiz:${input.quizId}:q:${i + 1}`);
        if (nextQ) {
          await ctx.redis.hSet(`quiz:${input.quizId}:q:${i}`, nextQ);
          await ctx.redis.expire(`quiz:${input.quizId}:q:${i}`, ttl);
        }
      }

      // Delete the last question key
      await ctx.redis.del(`quiz:${input.quizId}:q:${questionCount - 1}`);

      await ctx.redis.hSet(`quiz:${input.quizId}`, {
        questionCount: String(questionCount - 1),
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { removed: input.index, newCount: questionCount - 1 };
    }),

  upsertQuestions: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
      questions: z.array(z.object({
        index: z.number().int().min(0).optional(),
        encryptedQuestion: z.string().min(1).max(MAX_ENCRYPTED_QUESTION_SIZE),
        timerOverride: z.number().int().min(5).max(120).optional(),
      })).min(1).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (quiz.state !== "lobby") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only upsert questions in lobby state" });
      }

      let currentCount = parseInt(quiz.questionCount, 10) || 0;
      const ttl = calculateTTLSeconds(quiz.expiresAt);

      // Split into updates (existing index) and adds (new questions)
      const updates: typeof input.questions = [];
      const adds: typeof input.questions = [];

      for (const q of input.questions) {
        if (q.index !== undefined && q.index < currentCount) {
          updates.push(q);
        } else {
          adds.push(q);
        }
      }

      if (currentCount + adds.length > MAX_QUESTIONS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Maximum ${MAX_QUESTIONS} questions allowed (currently ${currentCount}, adding ${adds.length})`,
        });
      }

      const multi = ctx.redis.multi();

      // Apply updates to existing questions
      for (const q of updates) {
        multi.hSet(`quiz:${input.quizId}:q:${q.index!}`, {
          encryptedQuestion: q.encryptedQuestion,
          timerOverride: q.timerOverride ? String(q.timerOverride) : "",
        });
      }

      // Append new questions
      for (const q of adds) {
        const index = currentCount++;
        multi.hSet(`quiz:${input.quizId}:q:${index}`, {
          encryptedQuestion: q.encryptedQuestion,
          timerOverride: q.timerOverride ? String(q.timerOverride) : "",
        });
        multi.expire(`quiz:${input.quizId}:q:${index}`, ttl);
      }

      // Single version bump
      multi.hSet(`quiz:${input.quizId}`, {
        questionCount: String(currentCount),
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await multi.exec();
      await publishQuizUpdate(ctx.redis, input.quizId);

      return { updatedCount: updates.length, addedCount: adds.length, totalCount: currentCount };
    }),

  join: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      nickname: z.string().min(1).max(30).trim(),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (quiz.state !== "lobby") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only join while quiz is in lobby" });
      }

      const participantCount = await ctx.redis.sCard(`quiz:${input.quizId}:participants`);
      if (participantCount >= MAX_PARTICIPANTS) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Maximum ${MAX_PARTICIPANTS} participants allowed` });
      }

      const sessionId = generateSessionId();
      const now = new Date().toISOString();
      const ttl = calculateTTLSeconds(quiz.expiresAt);

      const participantHash: RedisParticipantHash = {
        nickname: input.nickname,
        joinedAt: now,
      };

      const multi = ctx.redis.multi();
      multi.hSet(`quiz:${input.quizId}:p:${sessionId}`, participantHash as unknown as Record<string, string>);
      multi.expire(`quiz:${input.quizId}:p:${sessionId}`, ttl);
      multi.sAdd(`quiz:${input.quizId}:participants`, sessionId);
      multi.expire(`quiz:${input.quizId}:participants`, ttl);
      await multi.exec();

      await publishQuizUpdate(ctx.redis, input.quizId);

      return {
        sessionId,
        quiz: quizHashToResponse(input.quizId, quiz),
      };
    }),

  startQuiz: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (!isValidTransition(quiz.state, "active")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Cannot start quiz from state: ${quiz.state}` });
      }

      const questionCount = parseInt(quiz.questionCount, 10) || 0;
      if (questionCount === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Need at least 1 question to start" });
      }

      const participantCount = await ctx.redis.sCard(`quiz:${input.quizId}:participants`);
      if (participantCount === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Need at least 1 participant to start" });
      }

      const now = new Date().toISOString();
      await ctx.redis.hSet(`quiz:${input.quizId}`, {
        state: "active",
        currentQuestion: "0",
        questionStartedAt: now,
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { state: "active" as QuizState, currentQuestion: 0 };
    }),

  showResults: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (!isValidTransition(quiz.state, "results")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Cannot show results from state: ${quiz.state}` });
      }

      await ctx.redis.hSet(`quiz:${input.quizId}`, {
        state: "results",
        questionStartedAt: "",
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { state: "results" as QuizState, currentQuestion: parseInt(quiz.currentQuestion, 10) || 0 };
    }),

  nextQuestion: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (!isValidTransition(quiz.state, "active")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Cannot go to next question from state: ${quiz.state}` });
      }

      const currentQ = parseInt(quiz.currentQuestion, 10) || 0;
      const questionCount = parseInt(quiz.questionCount, 10) || 0;
      const nextQ = currentQ + 1;

      if (nextQ >= questionCount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No more questions. Use finishQuiz instead." });
      }

      const now = new Date().toISOString();
      await ctx.redis.hSet(`quiz:${input.quizId}`, {
        state: "active",
        currentQuestion: String(nextQ),
        questionStartedAt: now,
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { state: "active" as QuizState, currentQuestion: nextQ };
    }),

  finishQuiz: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (!isValidTransition(quiz.state, "finished")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Cannot finish quiz from state: ${quiz.state}` });
      }

      await ctx.redis.hSet(`quiz:${input.quizId}`, {
        state: "finished",
        questionStartedAt: "",
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { state: "finished" as QuizState, currentQuestion: parseInt(quiz.currentQuestion, 10) || 0 };
    }),

  resetQuiz: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      if (!isValidTransition(quiz.state, "lobby")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Cannot reset quiz from state: ${quiz.state}` });
      }

      const questionCount = parseInt(quiz.questionCount, 10) || 0;
      const sessionIds = await ctx.redis.sMembers(`quiz:${input.quizId}:participants`);

      // Delete all answer keys
      const answerKeys: string[] = [];
      for (let i = 0; i < questionCount; i++) {
        for (const sid of sessionIds) {
          answerKeys.push(`quiz:${input.quizId}:a:${i}:${sid}`);
        }
      }

      // Delete participant session keys and the participants set
      const participantKeys = sessionIds.map((sid) => `quiz:${input.quizId}:p:${sid}`);
      const keysToDelete = [...answerKeys, ...participantKeys, `quiz:${input.quizId}:participants`];

      if (keysToDelete.length > 0) {
        await ctx.redis.del(keysToDelete);
      }

      // Reset quiz state to lobby
      await ctx.redis.hSet(`quiz:${input.quizId}`, {
        state: "lobby",
        currentQuestion: "0",
        questionStartedAt: "",
        version: String((parseInt(quiz.version, 10) || 1) + 1),
      });

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { state: "lobby" as QuizState };
    }),

  submitAnswer: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      sessionId: sessionIdSchema,
      questionIndex: z.number().int().min(0),
      encryptedAnswer: z.string().min(1).max(MAX_ENCRYPTED_ANSWER_SIZE),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (quiz.state !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Quiz is not in active state" });
      }

      const currentQ = parseInt(quiz.currentQuestion, 10) || 0;
      if (input.questionIndex !== currentQ) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not the current question" });
      }

      // Verify participant exists
      const isMember = await ctx.redis.sIsMember(`quiz:${input.quizId}:participants`, input.sessionId);
      if (!isMember) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant of this quiz" });
      }

      const now = new Date().toISOString();
      const ttl = calculateTTLSeconds(quiz.expiresAt);

      // Atomically check for duplicate and store answer using Lua script
      // This prevents a TOCTOU race where two concurrent requests both pass a non-atomic duplicate check
      const answerKey = `quiz:${input.quizId}:a:${input.questionIndex}:${input.sessionId}`;
      const orderKey = `quiz:${input.quizId}:order:${input.questionIndex}`;
      const result = await ctx.redis.eval(
        `if redis.call('HEXISTS', KEYS[1], 'encryptedAnswer') == 1 then
          return -1
        end
        redis.call('HSET', KEYS[1], 'encryptedAnswer', ARGV[1], 'answeredAt', ARGV[2])
        redis.call('EXPIRE', KEYS[1], ARGV[3])
        redis.call('RPUSH', KEYS[2], ARGV[4])
        redis.call('EXPIRE', KEYS[2], ARGV[3])
        return redis.call('LLEN', KEYS[2])`,
        { keys: [answerKey, orderKey], arguments: [input.encryptedAnswer, now, String(ttl), input.sessionId] }
      ) as number;

      if (result === -1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already answered this question" });
      }

      const position = result;

      await publishQuizUpdate(ctx.redis, input.quizId);

      return { position };
    }),

  delete: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      adminToken: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);

      if (!verifyAdminToken(input.adminToken, quiz.adminToken)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token" });
      }

      const questionCount = parseInt(quiz.questionCount, 10) || 0;
      const sessionIds = await ctx.redis.sMembers(`quiz:${input.quizId}:participants`);

      const keysToDelete = [
        `quiz:${input.quizId}`,
        `quiz:${input.quizId}:participants`,
        `quiz:join:${quiz.joinCode}`,
      ];

      // Question keys
      for (let i = 0; i < questionCount; i++) {
        keysToDelete.push(`quiz:${input.quizId}:q:${i}`);
        keysToDelete.push(`quiz:${input.quizId}:order:${i}`);
        // Answer keys for each participant
        for (const sid of sessionIds) {
          keysToDelete.push(`quiz:${input.quizId}:a:${i}:${sid}`);
        }
      }

      // Participant keys
      for (const sid of sessionIds) {
        keysToDelete.push(`quiz:${input.quizId}:p:${sid}`);
      }

      if (keysToDelete.length > 0) {
        await ctx.redis.del(keysToDelete);
      }

      return { message: "Quiz deleted successfully" };
    }),

  // --- Queries ---

  get: publicProcedure
    .input(z.object({ quizId: quizIdSchema }))
    .query(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);
      return quizHashToResponse(input.quizId, quiz);
    }),

  getQuestion: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      index: z.number().int().min(0),
    }))
    .query(async ({ ctx, input }) => {
      const quiz = await getValidQuiz(ctx.redis, input.quizId);
      const questionCount = parseInt(quiz.questionCount, 10) || 0;

      if (input.index >= questionCount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      const q = (await ctx.redis.hGetAll(
        `quiz:${input.quizId}:q:${input.index}`
      )) as unknown as RedisQuestionHash;

      if (!q || !q.encryptedQuestion) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      return {
        index: input.index,
        encryptedQuestion: q.encryptedQuestion,
        timerOverride: q.timerOverride ? parseInt(q.timerOverride, 10) : null,
      } satisfies QuestionResponse;
    }),

  getAnswers: publicProcedure
    .input(z.object({
      quizId: quizIdSchema,
      index: z.number().int().min(0),
    }))
    .query(async ({ ctx, input }) => {
      await getValidQuiz(ctx.redis, input.quizId);
      return getAnswersForQuestion(ctx.redis, input.quizId, input.index);
    }),

  getParticipants: publicProcedure
    .input(z.object({ quizId: quizIdSchema }))
    .query(async ({ ctx, input }) => {
      await getValidQuiz(ctx.redis, input.quizId);
      return getParticipants(ctx.redis, input.quizId);
    }),

  resolveJoinCode: publicProcedure
    .input(z.object({ joinCode: joinCodeSchema }))
    .query(async ({ ctx, input }) => {
      const quizId = await ctx.redis.get(`quiz:join:${input.joinCode}`);
      if (!quizId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Join code not found" });
      }
      return { quizId };
    }),

  health: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.redis.ping();
      return { status: "healthy", timestamp: new Date().toISOString() };
    } catch (error) {
      console.error("Health check failed:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Service unavailable" });
    }
  }),

  // --- Subscription ---

  subscribe: publicProcedure
    .input(z.object({ quizId: quizIdSchema }))
    .subscription(async function* (opts) {
      const { ctx, input } = opts;

      const fetchFullState = async (): Promise<QuizStateUpdate> => {
        const quiz = await getValidQuiz(ctx.redis, input.quizId);
        const quizResponse = quizHashToResponse(input.quizId, quiz);
        const participants = await getParticipants(ctx.redis, input.quizId);

        const update: QuizStateUpdate = {
          quiz: quizResponse,
          participants,
        };

        const currentQ = parseInt(quiz.currentQuestion, 10) || 0;
        const questionCount = parseInt(quiz.questionCount, 10) || 0;

        // Include all questions in lobby state (for admin UI live updates)
        if (quiz.state === "lobby" && questionCount > 0) {
          update.allQuestions = [];
          for (let i = 0; i < questionCount; i++) {
            const q = (await ctx.redis.hGetAll(
              `quiz:${input.quizId}:q:${i}`
            )) as unknown as RedisQuestionHash;
            if (q && q.encryptedQuestion) {
              update.allQuestions.push({
                index: i,
                encryptedQuestion: q.encryptedQuestion,
                timerOverride: q.timerOverride ? parseInt(q.timerOverride, 10) : null,
              });
            }
          }
        }

        // Include current question data when active or results
        if (quiz.state === "active" || quiz.state === "results") {
          const q = (await ctx.redis.hGetAll(
            `quiz:${input.quizId}:q:${currentQ}`
          )) as unknown as RedisQuestionHash;

          if (q && q.encryptedQuestion) {
            const totalAnswers = await ctx.redis.lLen(`quiz:${input.quizId}:order:${currentQ}`);
            const timerOverride = q.timerOverride ? parseInt(q.timerOverride, 10) : null;

            update.currentQuestion = {
              index: currentQ,
              encryptedQuestion: q.encryptedQuestion,
              totalAnswers,
              timerSeconds: timerOverride ?? parseInt(quiz.timerSeconds, 10),
              startedAt: quiz.questionStartedAt,
            };
          }
        }

        // Include answers when showing results or finished
        if (quiz.state === "results" || quiz.state === "finished") {
          update.answers = await getAnswersForQuestion(ctx.redis, input.quizId, currentQ);
        }

        return update;
      };

      // Yield initial state
      yield await fetchFullState();

      // Listen for updates via Redis Pub/Sub
      const subscriber = await getRedisSubscriber();
      const channel = `quiz:channel:${input.quizId}`;

      let resolveNext: ((value: string) => void) | null = null;
      const messageQueue: string[] = [];

      const listener = (message: string) => {
        if (resolveNext) {
          const resolve = resolveNext;
          resolveNext = null;
          resolve(message);
        } else {
          messageQueue.push(message);
        }
      };

      await subscriber.subscribe(channel, listener);

      const signal = opts.signal;

      const abortHandler = () => {
        void subscriber.unsubscribe(channel, listener);
      };
      signal?.addEventListener("abort", abortHandler);

      try {
        while (!signal?.aborted) {
          await new Promise<string>((resolve) => {
            const queued = messageQueue.shift();
            if (queued) {
              resolve(queued);
            } else {
              resolveNext = resolve;
            }
          });

          if (signal?.aborted) break;

          try {
            yield await fetchFullState();
          } catch {
            break;
          }
        }
      } finally {
        signal?.removeEventListener("abort", abortHandler);
        await subscriber.unsubscribe(channel, listener);
      }
    }),
});
