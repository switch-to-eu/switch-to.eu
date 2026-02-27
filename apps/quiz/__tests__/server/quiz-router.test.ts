import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockRedis } from "@switch-to-eu/db/mock-redis";
import { hashAdminToken } from "@switch-to-eu/db/admin";

const mockRedis = new MockRedis();

vi.mock("@switch-to-eu/db/redis", () => ({
  getRedis: () => Promise.resolve(mockRedis),
  getRedisSubscriber: () => Promise.resolve(mockRedis),
}));

const { createCaller } = await import("@/server/api/root");

function getCaller() {
  return createCaller({ redis: mockRedis as never, headers: new Headers() });
}

/** Seed a quiz directly in mock Redis */
async function seedQuiz(
  id: string,
  opts: {
    adminToken?: string;
    expired?: boolean;
    state?: string;
    questionCount?: number;
    currentQuestion?: number;
  } = {},
) {
  const adminToken = opts.adminToken ?? "test-admin-token";
  const expiresAt = opts.expired
    ? new Date(Date.now() - 86_400_000).toISOString()
    : new Date(Date.now() + 7 * 86_400_000).toISOString();

  const joinCode = "ABC123";

  await mockRedis.hSet(`quiz:${id}`, {
    encryptedData: "encrypted-quiz-data",
    adminToken: hashAdminToken(adminToken),
    joinCode,
    state: opts.state ?? "lobby",
    currentQuestion: String(opts.currentQuestion ?? 0),
    questionStartedAt: "",
    timerSeconds: "20",
    questionCount: String(opts.questionCount ?? 0),
    version: "1",
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  await mockRedis.set(`quiz:join:${joinCode}`, id);

  return { adminToken, joinCode };
}

/** Add a question to a seeded quiz */
async function seedQuestion(quizId: string, index: number) {
  await mockRedis.hSet(`quiz:${quizId}:q:${index}`, {
    encryptedQuestion: `encrypted-question-${index}`,
    timerOverride: "",
  });
}

/** Add a participant to a seeded quiz */
async function seedParticipant(quizId: string, sessionId: string, nickname: string) {
  await mockRedis.hSet(`quiz:${quizId}:p:${sessionId}`, {
    nickname,
    joinedAt: new Date().toISOString(),
  });
  await mockRedis.sAdd(`quiz:${quizId}:participants`, sessionId);
}

describe("quiz router", () => {
  beforeEach(() => {
    mockRedis._clear();
  });

  // --- create ---

  describe("create", () => {
    it("creates a quiz and returns id, admin token, and join code", async () => {
      const caller = getCaller();
      const result = await caller.quiz.create({
        encryptedData: "test-encrypted-data",
        timerSeconds: 20,
      });

      expect(result.quiz.id).toHaveLength(10);
      expect(result.quiz.encryptedData).toBe("test-encrypted-data");
      expect(result.quiz.state).toBe("lobby");
      expect(result.quiz.timerSeconds).toBe(20);
      expect(result.quiz.questionCount).toBe(0);
      expect(result.quiz.version).toBe(1);
      expect(result.adminToken).toBeDefined();
      expect(result.adminToken.length).toBeGreaterThan(0);
      expect(result.joinCode).toHaveLength(6);
    });

    it("stores hashed admin token, not plaintext", async () => {
      const caller = getCaller();
      const result = await caller.quiz.create({
        encryptedData: "test-data",
        timerSeconds: 20,
      });

      const stored = mockRedis._getHash(`quiz:${result.quiz.id}`);
      expect(stored!.adminToken).not.toBe(result.adminToken);
      expect(stored!.adminToken).toBe(hashAdminToken(result.adminToken));
    });

    it("creates a join code lookup key", async () => {
      const caller = getCaller();
      const result = await caller.quiz.create({
        encryptedData: "test-data",
        timerSeconds: 20,
      });

      const quizId = mockRedis._getString(`quiz:join:${result.joinCode}`);
      expect(quizId).toBe(result.quiz.id);
    });

    it("uses custom expiration hours", async () => {
      const caller = getCaller();
      const before = Date.now();
      const result = await caller.quiz.create({
        encryptedData: "test-data",
        timerSeconds: 20,
        expirationHours: 1,
      });

      const expiresAt = new Date(result.quiz.expiresAt).getTime();
      // Should expire ~1 hour from now
      expect(expiresAt - before).toBeLessThan(1.1 * 60 * 60 * 1000);
      expect(expiresAt - before).toBeGreaterThan(0.9 * 60 * 60 * 1000);
    });

    it("creates a quiz with no timer (timerSeconds=0)", async () => {
      const caller = getCaller();
      const result = await caller.quiz.create({
        encryptedData: "test-data",
        timerSeconds: 0,
      });

      expect(result.quiz.timerSeconds).toBe(0);
      const stored = mockRedis._getHash(`quiz:${result.quiz.id}`);
      expect(stored!.timerSeconds).toBe("0");
    });
  });

  // --- addQuestion ---

  describe("addQuestion", () => {
    it("adds a question and increments question count", async () => {
      const id = "testquiz01";
      const { adminToken } = await seedQuiz(id);
      const caller = getCaller();

      const result = await caller.quiz.addQuestion({
        quizId: id,
        adminToken,
        encryptedQuestion: "encrypted-q-data",
      });

      expect(result.index).toBe(0);

      const quiz = mockRedis._getHash(`quiz:${id}`);
      expect(quiz!.questionCount).toBe("1");

      const question = mockRedis._getHash(`quiz:${id}:q:0`);
      expect(question!.encryptedQuestion).toBe("encrypted-q-data");
    });

    it("rejects with invalid admin token", async () => {
      const id = "testquiz02";
      await seedQuiz(id);
      const caller = getCaller();

      await expect(
        caller.quiz.addQuestion({
          quizId: id,
          adminToken: "wrong-token",
          encryptedQuestion: "data",
        })
      ).rejects.toThrow();
    });

    it("rejects when quiz is not in lobby state", async () => {
      const id = "testquiz03";
      const { adminToken } = await seedQuiz(id, { state: "active" });
      const caller = getCaller();

      await expect(
        caller.quiz.addQuestion({
          quizId: id,
          adminToken,
          encryptedQuestion: "data",
        })
      ).rejects.toThrow("lobby");
    });
  });

  // --- join ---

  describe("join", () => {
    it("adds a participant and returns session id", async () => {
      const id = "testquiz04";
      await seedQuiz(id);
      const caller = getCaller();

      const result = await caller.quiz.join({
        quizId: id,
        nickname: "Alice",
      });

      expect(result.sessionId).toHaveLength(8);
      expect(result.quiz.id).toBe(id);

      const participants = await mockRedis.sMembers(`quiz:${id}:participants`);
      expect(participants).toContain(result.sessionId);

      const pHash = mockRedis._getHash(`quiz:${id}:p:${result.sessionId}`);
      expect(pHash!.nickname).toBe("Alice");
    });

    it("rejects when quiz is finished", async () => {
      const id = "testquiz05";
      await seedQuiz(id, { state: "finished" });
      const caller = getCaller();

      await expect(
        caller.quiz.join({ quizId: id, nickname: "Bob" })
      ).rejects.toThrow("lobby");
    });

    it("rejects when quiz is active", async () => {
      const id = "testqz05ac";
      await seedQuiz(id, { state: "active" });
      const caller = getCaller();

      await expect(
        caller.quiz.join({ quizId: id, nickname: "Bob" })
      ).rejects.toThrow("lobby");
    });
  });

  // --- resolveJoinCode ---

  describe("resolveJoinCode", () => {
    it("resolves a valid join code to quiz id", async () => {
      const id = "testquiz06";
      const { joinCode } = await seedQuiz(id);
      const caller = getCaller();

      const result = await caller.quiz.resolveJoinCode({ joinCode });
      expect(result.quizId).toBe(id);
    });

    it("throws for invalid join code", async () => {
      const caller = getCaller();

      await expect(
        caller.quiz.resolveJoinCode({ joinCode: "ZZZZZZ" })
      ).rejects.toThrow("not found");
    });
  });

  // --- startQuiz ---

  describe("startQuiz", () => {
    it("transitions from lobby to active", async () => {
      const id = "testquiz07";
      const { adminToken } = await seedQuiz(id, { questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0001", "Alice");
      const caller = getCaller();

      const result = await caller.quiz.startQuiz({
        quizId: id,
        adminToken,
      });

      expect(result.state).toBe("active");
      expect(result.currentQuestion).toBe(0);

      const quiz = mockRedis._getHash(`quiz:${id}`);
      expect(quiz!.state).toBe("active");
      expect(quiz!.questionStartedAt).toBeTruthy();
    });

    it("rejects when no questions exist", async () => {
      const id = "testquiz08";
      const { adminToken } = await seedQuiz(id);
      await seedParticipant(id, "sess0002", "Bob");
      const caller = getCaller();

      await expect(
        caller.quiz.startQuiz({ quizId: id, adminToken })
      ).rejects.toThrow("question");
    });

    it("rejects when no participants exist", async () => {
      const id = "testquiz09";
      const { adminToken } = await seedQuiz(id, { questionCount: 1 });
      await seedQuestion(id, 0);
      const caller = getCaller();

      await expect(
        caller.quiz.startQuiz({ quizId: id, adminToken })
      ).rejects.toThrow("participant");
    });

    it("rejects from non-lobby state", async () => {
      const id = "testquiz10";
      const { adminToken } = await seedQuiz(id, { state: "active", questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0003", "Charlie");
      const caller = getCaller();

      await expect(
        caller.quiz.startQuiz({ quizId: id, adminToken })
      ).rejects.toThrow();
    });
  });

  // --- submitAnswer ---

  describe("submitAnswer", () => {
    it("stores an encrypted answer and returns position", async () => {
      const id = "testquiz11";
      await seedQuiz(id, { state: "active", questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0010", "Alice");

      // Set questionStartedAt so the quiz looks active
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();
      const result = await caller.quiz.submitAnswer({
        quizId: id,
        sessionId: "sess0010",
        questionIndex: 0,
        encryptedAnswer: "encrypted-answer-data",
      });

      expect(result.position).toBe(1);

      // Check answer stored
      const answer = mockRedis._getHash(`quiz:${id}:a:0:sess0010`);
      expect(answer!.encryptedAnswer).toBe("encrypted-answer-data");

      // Check order list
      const order = mockRedis._getList(`quiz:${id}:order:0`);
      expect(order).toEqual(["sess0010"]);
    });

    it("assigns correct positions based on answer order", async () => {
      const id = "testquiz12";
      await seedQuiz(id, { state: "active", questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0020", "Alice");
      await seedParticipant(id, "sess0021", "Bob");
      await seedParticipant(id, "sess0022", "Charlie");
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();

      const r1 = await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0020", questionIndex: 0, encryptedAnswer: "a1",
      });
      const r2 = await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0021", questionIndex: 0, encryptedAnswer: "a2",
      });
      const r3 = await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0022", questionIndex: 0, encryptedAnswer: "a3",
      });

      expect(r1.position).toBe(1);
      expect(r2.position).toBe(2);
      expect(r3.position).toBe(3);
    });

    it("rejects duplicate answers", async () => {
      const id = "testquiz13";
      await seedQuiz(id, { state: "active", questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0030", "Alice");
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();
      await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0030", questionIndex: 0, encryptedAnswer: "a1",
      });

      await expect(
        caller.quiz.submitAnswer({
          quizId: id, sessionId: "sess0030", questionIndex: 0, encryptedAnswer: "a2",
        })
      ).rejects.toThrow("Already answered");
    });

    it("rejects when quiz is not active", async () => {
      const id = "testquiz14";
      await seedQuiz(id, { state: "lobby", questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0040", "Alice");

      const caller = getCaller();
      await expect(
        caller.quiz.submitAnswer({
          quizId: id, sessionId: "sess0040", questionIndex: 0, encryptedAnswer: "a1",
        })
      ).rejects.toThrow("not in active");
    });

    it("rejects non-participants", async () => {
      const id = "testquiz15";
      await seedQuiz(id, { state: "active", questionCount: 1 });
      await seedQuestion(id, 0);
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();
      await expect(
        caller.quiz.submitAnswer({
          quizId: id, sessionId: "fake0001", questionIndex: 0, encryptedAnswer: "a1",
        })
      ).rejects.toThrow("Not a participant");
    });
  });

  // --- submitAnswer edge cases ---

  describe("submitAnswer edge cases", () => {
    it("rejects answer after results are shown (state is results)", async () => {
      const id = "testquiz30";
      await seedQuiz(id, { state: "active", questionCount: 2 });
      await seedQuestion(id, 0);
      await seedQuestion(id, 1);
      await seedParticipant(id, "sess0100", "Alice");
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();

      // Answer during active state — succeeds
      await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0100", questionIndex: 0, encryptedAnswer: "a1",
      });

      // Admin shows results
      await seedQuiz(id, { state: "active", questionCount: 2 });
      await mockRedis.hSet(`quiz:${id}`, { state: "results" });

      // Attempt to answer again — should reject because state is "results"
      await expect(
        caller.quiz.submitAnswer({
          quizId: id, sessionId: "sess0100", questionIndex: 0, encryptedAnswer: "a2",
        })
      ).rejects.toThrow("not in active");
    });

    it("rejects answer for wrong question index", async () => {
      const id = "testquiz31";
      await seedQuiz(id, { state: "active", questionCount: 2, currentQuestion: 1 });
      await seedQuestion(id, 0);
      await seedQuestion(id, 1);
      await seedParticipant(id, "sess0110", "Alice");
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();

      // Try to answer question 0 when current question is 1
      await expect(
        caller.quiz.submitAnswer({
          quizId: id, sessionId: "sess0110", questionIndex: 0, encryptedAnswer: "a1",
        })
      ).rejects.toThrow("Not the current question");
    });

    it("allows answering a new question after answering previous one", async () => {
      const id = "testquiz32";
      const { adminToken } = await seedQuiz(id, { state: "active", questionCount: 2 });
      await seedQuestion(id, 0);
      await seedQuestion(id, 1);
      await seedParticipant(id, "sess0120", "Alice");
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();

      // Answer question 0
      const r1 = await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0120", questionIndex: 0, encryptedAnswer: "a1",
      });
      expect(r1.position).toBe(1);

      // Transition: active -> results -> active (next question)
      await caller.quiz.showResults({ quizId: id, adminToken });
      await caller.quiz.nextQuestion({ quizId: id, adminToken });

      // Answer question 1 — should succeed
      const r2 = await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0120", questionIndex: 1, encryptedAnswer: "a2",
      });
      expect(r2.position).toBe(1);
    });

    it("still rejects duplicate on same question after state round-trip", async () => {
      const id = "testquiz33";
      await seedQuiz(id, { state: "active", questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0130", "Alice");
      await mockRedis.hSet(`quiz:${id}`, { questionStartedAt: new Date().toISOString() });

      const caller = getCaller();

      // Answer question 0
      await caller.quiz.submitAnswer({
        quizId: id, sessionId: "sess0130", questionIndex: 0, encryptedAnswer: "a1",
      });

      // Even if we set state back to active (simulating a re-send), duplicate should be rejected
      await mockRedis.hSet(`quiz:${id}`, { state: "active" });

      await expect(
        caller.quiz.submitAnswer({
          quizId: id, sessionId: "sess0130", questionIndex: 0, encryptedAnswer: "a2",
        })
      ).rejects.toThrow("Already answered");
    });
  });

  // --- full quiz flow ---

  describe("full quiz flow", () => {
    it("runs a complete quiz: create, add questions, join, play, finish", async () => {
      const caller = getCaller();

      // 1. Create quiz
      const quiz = await caller.quiz.create({
        encryptedData: "encrypted-title",
        timerSeconds: 20,
      });
      const quizId = quiz.quiz.id;
      const adminToken = quiz.adminToken;

      // 2. Add 2 questions
      await caller.quiz.addQuestion({
        quizId, adminToken, encryptedQuestion: "enc-q1",
      });
      await caller.quiz.addQuestion({
        quizId, adminToken, encryptedQuestion: "enc-q2",
      });

      // Verify question count
      const quizState = await caller.quiz.get({ quizId });
      expect(quizState.questionCount).toBe(2);

      // 3. Two participants join
      const alice = await caller.quiz.join({ quizId, nickname: "Alice" });
      const bob = await caller.quiz.join({ quizId, nickname: "Bob" });
      expect(alice.sessionId).toHaveLength(8);
      expect(bob.sessionId).toHaveLength(8);

      const participants = await caller.quiz.getParticipants({ quizId });
      expect(participants).toHaveLength(2);

      // 4. Start quiz
      const started = await caller.quiz.startQuiz({ quizId, adminToken });
      expect(started.state).toBe("active");
      expect(started.currentQuestion).toBe(0);

      // 5. Both answer question 0
      const a1 = await caller.quiz.submitAnswer({
        quizId, sessionId: alice.sessionId, questionIndex: 0, encryptedAnswer: "enc-alice-0",
      });
      const b1 = await caller.quiz.submitAnswer({
        quizId, sessionId: bob.sessionId, questionIndex: 0, encryptedAnswer: "enc-bob-0",
      });
      expect(a1.position).toBe(1);
      expect(b1.position).toBe(2);

      // 6. Duplicate answer rejected
      await expect(
        caller.quiz.submitAnswer({
          quizId, sessionId: alice.sessionId, questionIndex: 0, encryptedAnswer: "enc-alice-retry",
        })
      ).rejects.toThrow("Already answered");

      // 7. Show results
      const results = await caller.quiz.showResults({ quizId, adminToken });
      expect(results.state).toBe("results");

      // 8. Can't answer during results
      await expect(
        caller.quiz.submitAnswer({
          quizId, sessionId: alice.sessionId, questionIndex: 0, encryptedAnswer: "enc-nope",
        })
      ).rejects.toThrow("not in active");

      // 9. Get answers for question 0
      const answers = await caller.quiz.getAnswers({ quizId, index: 0 });
      expect(answers).toHaveLength(2);

      // 10. Next question
      const next = await caller.quiz.nextQuestion({ quizId, adminToken });
      expect(next.state).toBe("active");
      expect(next.currentQuestion).toBe(1);

      // 11. Answer question 1
      await caller.quiz.submitAnswer({
        quizId, sessionId: bob.sessionId, questionIndex: 1, encryptedAnswer: "enc-bob-1",
      });
      await caller.quiz.submitAnswer({
        quizId, sessionId: alice.sessionId, questionIndex: 1, encryptedAnswer: "enc-alice-1",
      });

      // 12. Show results for question 1
      await caller.quiz.showResults({ quizId, adminToken });

      // 13. Finish quiz
      const finished = await caller.quiz.finishQuiz({ quizId, adminToken });
      expect(finished.state).toBe("finished");

      // 14. Can't answer on finished quiz
      await expect(
        caller.quiz.submitAnswer({
          quizId, sessionId: alice.sessionId, questionIndex: 1, encryptedAnswer: "enc-nope",
        })
      ).rejects.toThrow("not in active");
    });
  });

  // --- showResults ---

  describe("showResults", () => {
    it("transitions from active to results", async () => {
      const id = "testquiz16";
      const { adminToken } = await seedQuiz(id, { state: "active", questionCount: 1 });
      const caller = getCaller();

      const result = await caller.quiz.showResults({
        quizId: id,
        adminToken,
      });

      expect(result.state).toBe("results");
      const quiz = mockRedis._getHash(`quiz:${id}`);
      expect(quiz!.state).toBe("results");
    });
  });

  // --- nextQuestion ---

  describe("nextQuestion", () => {
    it("transitions from results to active with next question", async () => {
      const id = "testquiz17";
      const { adminToken } = await seedQuiz(id, { state: "results", questionCount: 3, currentQuestion: 0 });
      await seedQuestion(id, 0);
      await seedQuestion(id, 1);
      await seedQuestion(id, 2);
      const caller = getCaller();

      const result = await caller.quiz.nextQuestion({
        quizId: id,
        adminToken,
      });

      expect(result.state).toBe("active");
      expect(result.currentQuestion).toBe(1);
    });

    it("rejects when on last question", async () => {
      const id = "testquiz18";
      const { adminToken } = await seedQuiz(id, { state: "results", questionCount: 1, currentQuestion: 0 });
      await seedQuestion(id, 0);
      const caller = getCaller();

      await expect(
        caller.quiz.nextQuestion({ quizId: id, adminToken })
      ).rejects.toThrow("No more questions");
    });
  });

  // --- finishQuiz ---

  describe("finishQuiz", () => {
    it("transitions from results to finished", async () => {
      const id = "testquiz19";
      const { adminToken } = await seedQuiz(id, { state: "results", questionCount: 1 });
      const caller = getCaller();

      const result = await caller.quiz.finishQuiz({
        quizId: id,
        adminToken,
      });

      expect(result.state).toBe("finished");
    });
  });

  // --- getAnswers ---

  describe("getAnswers", () => {
    it("returns answers with positions", async () => {
      const id = "testquiz20";
      await seedQuiz(id, { state: "results", questionCount: 1 });
      await seedQuestion(id, 0);

      // Seed answers manually
      await mockRedis.rPush(`quiz:${id}:order:0`, "sess0050");
      await mockRedis.rPush(`quiz:${id}:order:0`, "sess0051");
      await mockRedis.hSet(`quiz:${id}:a:0:sess0050`, {
        encryptedAnswer: "enc-a1",
        answeredAt: new Date().toISOString(),
      });
      await mockRedis.hSet(`quiz:${id}:a:0:sess0051`, {
        encryptedAnswer: "enc-a2",
        answeredAt: new Date().toISOString(),
      });

      const caller = getCaller();
      const answers = await caller.quiz.getAnswers({ quizId: id, index: 0 });

      expect(answers).toHaveLength(2);
      expect(answers[0]!.sessionId).toBe("sess0050");
      expect(answers[0]!.position).toBe(1);
      expect(answers[1]!.sessionId).toBe("sess0051");
      expect(answers[1]!.position).toBe(2);
    });
  });

  // --- delete ---

  describe("delete", () => {
    it("removes all quiz data", async () => {
      const id = "testquiz21";
      const { adminToken, joinCode } = await seedQuiz(id, { questionCount: 1 });
      await seedQuestion(id, 0);
      await seedParticipant(id, "sess0060", "Alice");
      await mockRedis.hSet(`quiz:${id}:a:0:sess0060`, {
        encryptedAnswer: "enc-a",
        answeredAt: new Date().toISOString(),
      });
      await mockRedis.rPush(`quiz:${id}:order:0`, "sess0060");

      const caller = getCaller();
      const result = await caller.quiz.delete({ quizId: id, adminToken });

      expect(result.message).toContain("deleted");

      // Verify all keys are gone
      expect(mockRedis._getHash(`quiz:${id}`)).toBeUndefined();
      expect(mockRedis._getString(`quiz:join:${joinCode}`)).toBeUndefined();
      expect(mockRedis._getHash(`quiz:${id}:q:0`)).toBeUndefined();
      expect(mockRedis._getHash(`quiz:${id}:p:sess0060`)).toBeUndefined();
      expect(mockRedis._getHash(`quiz:${id}:a:0:sess0060`)).toBeUndefined();
    });
  });

  // --- health ---

  describe("health", () => {
    it("returns healthy status", async () => {
      const caller = getCaller();
      const result = await caller.quiz.health();
      expect(result.status).toBe("healthy");
    });
  });

  // --- get ---

  describe("get", () => {
    it("returns quiz metadata", async () => {
      const id = "testquiz22";
      await seedQuiz(id, { questionCount: 2 });

      const caller = getCaller();
      const result = await caller.quiz.get({ quizId: id });

      expect(result.id).toBe(id);
      expect(result.state).toBe("lobby");
      expect(result.joinCode).toBe("ABC123");
      expect(result.questionCount).toBe(2);
    });

    it("throws for non-existent quiz", async () => {
      const caller = getCaller();
      await expect(
        caller.quiz.get({ quizId: "nonexist01" })
      ).rejects.toThrow("not found");
    });

    it("throws for expired quiz", async () => {
      const id = "testquiz23";
      await seedQuiz(id, { expired: true });
      const caller = getCaller();

      await expect(
        caller.quiz.get({ quizId: id })
      ).rejects.toThrow("expired");
    });
  });

  // --- getParticipants ---

  describe("getParticipants", () => {
    it("returns all participants", async () => {
      const id = "testquiz24";
      await seedQuiz(id);
      await seedParticipant(id, "sess0070", "Alice");
      await seedParticipant(id, "sess0071", "Bob");

      const caller = getCaller();
      const result = await caller.quiz.getParticipants({ quizId: id });

      expect(result).toHaveLength(2);
      const nicknames = result.map((p) => p.nickname).sort();
      expect(nicknames).toEqual(["Alice", "Bob"]);
    });
  });
});
