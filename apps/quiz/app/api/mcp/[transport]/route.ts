import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  generateEncryptionKey,
  encryptData,
  decryptData,
} from "@switch-to-eu/db/crypto";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 5018}`;
}

interface QuizMetadata {
  title: string;
  description: string;
}

interface QuestionData {
  text: string;
  options: string[];
  correctIndex: number;
}

/**
 * Parse an admin URL to extract quizId, adminToken, and encryptionKey.
 * Format: https://host/en/quiz/{quizId}/admin#token={token}&key={key}
 */
function parseAdminUrl(adminUrl: string): {
  quizId: string;
  adminToken: string;
  encryptionKey: string;
} {
  // Extract quizId from path: /en/quiz/{quizId}/admin or /{locale}/quiz/{quizId}/admin
  const pathMatch = adminUrl.match(/\/quiz\/([A-Za-z0-9]+)\/admin/);
  if (!pathMatch?.[1]) {
    throw new Error(
      "Invalid admin URL format. Expected: https://host/{locale}/quiz/{quizId}/admin#token=...&key=...",
    );
  }
  const quizId = pathMatch[1];

  // Extract fragment (after #)
  const fragmentIndex = adminUrl.indexOf("#");
  if (fragmentIndex === -1) {
    throw new Error("Admin URL missing fragment (#token=...&key=...)");
  }
  const fragment = adminUrl.slice(fragmentIndex + 1);
  const params = new URLSearchParams(fragment);

  const adminToken = params.get("token");
  const encryptionKey = params.get("key");

  if (!adminToken) {
    throw new Error("Admin URL missing token in fragment");
  }
  if (!encryptionKey) {
    throw new Error("Admin URL missing key in fragment");
  }

  return {
    quizId,
    adminToken,
    encryptionKey: decodeURIComponent(encryptionKey),
  };
}

async function getCaller() {
  const ctx = await createTRPCContext({ headers: new Headers() });
  return createCaller(ctx);
}

const handler = createMcpHandler(
  (server) => {
    // --- create_quiz ---
    server.registerTool(
      "create_quiz",
      {
        description:
          "Create a new quiz with questions. Returns an admin URL that contains " +
          "the admin token and encryption key — save this URL to manage the quiz later. " +
          "Also returns a join code and join URL for participants. " +
          "All data is E2E encrypted with AES-256-GCM before storage.",
        inputSchema: {
          title: z.string().min(1).max(200).describe("The quiz title."),
          description: z
            .string()
            .max(500)
            .default("")
            .describe("Optional quiz description."),
          questions: z
            .array(
              z.object({
                text: z.string().min(1).describe("The question text."),
                options: z
                  .array(z.string().min(1))
                  .min(2)
                  .max(4)
                  .describe("2–4 answer options."),
                correctIndex: z
                  .number()
                  .int()
                  .min(0)
                  .describe(
                    "0-based index of the correct answer in the options array.",
                  ),
                timerOverride: z
                  .number()
                  .int()
                  .min(5)
                  .max(120)
                  .optional()
                  .describe(
                    "Optional per-question timer in seconds (5–120). Overrides the quiz default.",
                  ),
              }),
            )
            .min(1)
            .max(50)
            .describe("Array of questions (1–50)."),
          timerSeconds: z
            .number()
            .int()
            .min(0)
            .max(120)
            .default(20)
            .describe(
              "Default timer per question in seconds (0 = no timer). Default: 20.",
            ),
          expirationHours: z
            .number()
            .int()
            .min(1)
            .max(168)
            .default(24)
            .describe("Hours until the quiz expires (1–168). Default: 24."),
        },
      },
      async ({
        title,
        description,
        questions,
        timerSeconds,
        expirationHours,
      }) => {
        try {
          const encryptionKey = await generateEncryptionKey();
          const caller = await getCaller();

          // Encrypt quiz metadata
          const quizMetadata: QuizMetadata = { title, description };
          const encryptedData = await encryptData(quizMetadata, encryptionKey);

          // Create the quiz
          const result = await caller.quiz.create({
            encryptedData,
            timerSeconds,
            expirationHours,
          });

          // Encrypt all questions in parallel
          const encryptedQuestions = await Promise.all(
            questions.map(async (q) => ({
              encryptedQuestion: await encryptData(
                { text: q.text, options: q.options, correctIndex: q.correctIndex } satisfies QuestionData,
                encryptionKey,
              ),
              timerOverride: q.timerOverride,
            })),
          );

          // Add questions sequentially (addQuestion uses questionCount as index)
          for (const eq of encryptedQuestions) {
            await caller.quiz.addQuestion({
              quizId: result.quiz.id,
              adminToken: result.adminToken,
              encryptedQuestion: eq.encryptedQuestion,
              timerOverride: eq.timerOverride,
            });
          }

          const baseUrl = getBaseUrl();
          const adminUrl = `${baseUrl}/en/quiz/${result.quiz.id}/admin#token=${encodeURIComponent(result.adminToken)}&key=${encodeURIComponent(encryptionKey)}`;
          const joinUrl = `${baseUrl}/en/join/${result.joinCode}`;

          const lines = [
            `Quiz created successfully!`,
            ``,
            `Admin URL (save this!): ${adminUrl}`,
            `Join URL: ${joinUrl}`,
            ``,
            `Details:`,
            `- Title: ${title}`,
            `- Questions: ${questions.length}`,
            `- Timer: ${timerSeconds === 0 ? "No timer" : `${timerSeconds}s per question`}`,
            `- Expires: ${result.quiz.expiresAt}`,
            ``,
            `IMPORTANT: The admin URL above contains the encryption key and admin ` +
              `token. Save it to manage this quiz later. Without it, you cannot ` +
              `edit or control the quiz.`,
          ];

          return {
            content: [{ type: "text" as const, text: lines.join("\n") }],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to create quiz: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // --- get_quiz ---
    server.registerTool(
      "get_quiz",
      {
        description:
          "Get the full details of a quiz including all decrypted questions. " +
          "Requires the admin URL returned during creation.",
        inputSchema: {
          adminUrl: z
            .string()
            .describe(
              "The admin URL returned when the quiz was created. " +
                "Format: https://host/{locale}/quiz/{id}/admin#token=...&key=...",
            ),
        },
      },
      async ({ adminUrl }) => {
        try {
          const { quizId, adminToken: _adminToken, encryptionKey } =
            parseAdminUrl(adminUrl);
          const caller = await getCaller();

          const quiz = await caller.quiz.get({ quizId });
          const participants = await caller.quiz.getParticipants({ quizId });

          // Decrypt quiz metadata
          const metadata = await decryptData<QuizMetadata>(
            quiz.encryptedData,
            encryptionKey,
          );

          // Fetch and decrypt all questions in parallel
          const questions = await Promise.all(
            Array.from({ length: quiz.questionCount }, async (_, i) => {
              const q = await caller.quiz.getQuestion({ quizId, index: i });
              const qData = await decryptData<QuestionData>(
                q.encryptedQuestion,
                encryptionKey,
              );
              return {
                index: i,
                text: qData.text,
                options: qData.options,
                correctIndex: qData.correctIndex,
                timerOverride: q.timerOverride,
              };
            }),
          );

          const baseUrl = getBaseUrl();
          const joinUrl = `${baseUrl}/en/join/${quiz.joinCode}`;

          const lines = [
            `Quiz: ${metadata.title}`,
            metadata.description
              ? `Description: ${metadata.description}`
              : null,
            ``,
            `State: ${quiz.state}`,
            `Join URL: ${joinUrl}`,
            `Admin URL: ${adminUrl}`,
            `Timer: ${quiz.timerSeconds === 0 ? "No timer" : `${quiz.timerSeconds}s`}`,
            `Participants: ${participants.length}`,
            participants.length > 0
              ? `  ${participants.map((p) => p.nickname).join(", ")}`
              : null,
            `Expires: ${quiz.expiresAt}`,
            ``,
            `Questions (${questions.length}):`,
            ...questions.flatMap((q) => [
              ``,
              `  ${q.index + 1}. ${q.text}${q.timerOverride ? ` (timer: ${q.timerOverride}s)` : ""}`,
              ...q.options.map(
                (opt, i) =>
                  `     ${i === q.correctIndex ? "✓" : " "} ${String.fromCharCode(65 + i)}) ${opt}`,
              ),
            ]),
          ];

          return {
            content: [
              {
                type: "text" as const,
                text: lines.filter((l) => l !== null).join("\n"),
              },
            ],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to get quiz: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // --- add_question ---
    server.registerTool(
      "add_question",
      {
        description:
          "Add a single new question to an existing quiz (must be in lobby state). " +
          "For adding or editing 2+ questions at once, use upsert_questions instead. " +
          "Requires the admin URL.",
        inputSchema: {
          adminUrl: z
            .string()
            .describe("The admin URL returned when the quiz was created."),
          text: z.string().min(1).describe("The question text."),
          options: z
            .array(z.string().min(1))
            .min(2)
            .max(4)
            .describe("2–4 answer options."),
          correctIndex: z
            .number()
            .int()
            .min(0)
            .describe(
              "0-based index of the correct answer in the options array.",
            ),
          timerOverride: z
            .number()
            .int()
            .min(5)
            .max(120)
            .optional()
            .describe("Optional per-question timer override in seconds (5–120)."),
        },
      },
      async ({ adminUrl, text, options, correctIndex, timerOverride }) => {
        try {
          const { quizId, adminToken, encryptionKey } =
            parseAdminUrl(adminUrl);
          const caller = await getCaller();

          const questionData: QuestionData = { text, options, correctIndex };
          const encryptedQuestion = await encryptData(
            questionData,
            encryptionKey,
          );

          const result = await caller.quiz.addQuestion({
            quizId,
            adminToken,
            encryptedQuestion,
            timerOverride,
          });

          return {
            content: [
              {
                type: "text" as const,
                text: [
                  `Question added at index ${result.index} (question #${result.index + 1}).`,
                  ``,
                  `Admin URL: ${adminUrl}`,
                ].join("\n"),
              },
            ],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to add question: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // --- update_question ---
    server.registerTool(
      "update_question",
      {
        description:
          "Update a single existing question in a quiz (must be in lobby state). " +
          "For adding or editing 2+ questions at once, use upsert_questions instead. " +
          "Requires the admin URL.",
        inputSchema: {
          adminUrl: z
            .string()
            .describe("The admin URL returned when the quiz was created."),
          index: z
            .number()
            .int()
            .min(0)
            .describe("0-based index of the question to update."),
          text: z.string().min(1).describe("The updated question text."),
          options: z
            .array(z.string().min(1))
            .min(2)
            .max(4)
            .describe("2–4 updated answer options."),
          correctIndex: z
            .number()
            .int()
            .min(0)
            .describe(
              "0-based index of the correct answer in the options array.",
            ),
          timerOverride: z
            .number()
            .int()
            .min(5)
            .max(120)
            .optional()
            .describe("Optional per-question timer override in seconds (5–120)."),
        },
      },
      async ({
        adminUrl,
        index,
        text,
        options,
        correctIndex,
        timerOverride,
      }) => {
        try {
          const { quizId, adminToken, encryptionKey } =
            parseAdminUrl(adminUrl);
          const caller = await getCaller();

          const questionData: QuestionData = { text, options, correctIndex };
          const encryptedQuestion = await encryptData(
            questionData,
            encryptionKey,
          );

          await caller.quiz.updateQuestion({
            quizId,
            adminToken,
            index,
            encryptedQuestion,
            timerOverride,
          });

          return {
            content: [
              {
                type: "text" as const,
                text: [
                  `Question #${index + 1} updated successfully.`,
                  ``,
                  `Admin URL: ${adminUrl}`,
                ].join("\n"),
              },
            ],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to update question: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // --- remove_question ---
    server.registerTool(
      "remove_question",
      {
        description:
          "Remove a question from a quiz (must be in lobby state). " +
          "Remaining questions are re-indexed. Requires the admin URL.",
        inputSchema: {
          adminUrl: z
            .string()
            .describe("The admin URL returned when the quiz was created."),
          index: z
            .number()
            .int()
            .min(0)
            .describe("0-based index of the question to remove."),
        },
      },
      async ({ adminUrl, index }) => {
        try {
          const { quizId, adminToken } = parseAdminUrl(adminUrl);
          const caller = await getCaller();

          const result = await caller.quiz.removeQuestion({
            quizId,
            adminToken,
            index,
          });

          return {
            content: [
              {
                type: "text" as const,
                text: [
                  `Question #${index + 1} removed. Quiz now has ${result.newCount} question(s).`,
                  ``,
                  `Admin URL: ${adminUrl}`,
                ].join("\n"),
              },
            ],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to remove question: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // --- upsert_questions ---
    server.registerTool(
      "upsert_questions",
      {
        description:
          "Bulk add and/or update multiple questions in a single operation. " +
          "Much more efficient than calling add_question/update_question individually — " +
          "use this when adding or editing more than 1 question. " +
          "Questions with an index are updates; questions without an index are appended as new. " +
          "All encryption and database writes happen in parallel. " +
          "Requires the admin URL.",
        inputSchema: {
          adminUrl: z
            .string()
            .describe("The admin URL returned when the quiz was created."),
          questions: z
            .array(
              z.object({
                index: z
                  .number()
                  .int()
                  .min(0)
                  .optional()
                  .describe(
                    "0-based index of an existing question to update. " +
                      "Omit to append as a new question.",
                  ),
                text: z.string().min(1).describe("The question text."),
                options: z
                  .array(z.string().min(1))
                  .min(2)
                  .max(4)
                  .describe("2–4 answer options."),
                correctIndex: z
                  .number()
                  .int()
                  .min(0)
                  .describe(
                    "0-based index of the correct answer in the options array.",
                  ),
                timerOverride: z
                  .number()
                  .int()
                  .min(5)
                  .max(120)
                  .optional()
                  .describe(
                    "Optional per-question timer in seconds (5–120).",
                  ),
              }),
            )
            .min(1)
            .max(50)
            .describe(
              "Array of questions to add or update. " +
                "Include 'index' to update an existing question, omit it to append a new one.",
            ),
        },
      },
      async ({ adminUrl, questions }) => {
        try {
          const { quizId, adminToken, encryptionKey } =
            parseAdminUrl(adminUrl);
          const caller = await getCaller();

          // Encrypt all questions in parallel
          const encrypted = await Promise.all(
            questions.map(async (q) => ({
              index: q.index,
              encryptedQuestion: await encryptData(
                { text: q.text, options: q.options, correctIndex: q.correctIndex } satisfies QuestionData,
                encryptionKey,
              ),
              timerOverride: q.timerOverride,
            })),
          );

          // Single bulk upsert call
          const result = await caller.quiz.upsertQuestions({
            quizId,
            adminToken,
            questions: encrypted,
          });

          const lines = [
            `Upserted ${questions.length} question(s):`,
            `- Updated: ${result.updatedCount}`,
            `- Added: ${result.addedCount}`,
            `- Total questions: ${result.totalCount}`,
            ``,
            `Admin URL: ${adminUrl}`,
          ];

          return {
            content: [{ type: "text" as const, text: lines.join("\n") }],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to upsert questions: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // --- delete_quiz ---
    server.registerTool(
      "delete_quiz",
      {
        description:
          "Permanently delete a quiz and all its data. This cannot be undone. " +
          "Requires the admin URL.",
        inputSchema: {
          adminUrl: z
            .string()
            .describe("The admin URL returned when the quiz was created."),
        },
      },
      async ({ adminUrl }) => {
        try {
          const { quizId, adminToken } = parseAdminUrl(adminUrl);
          const caller = await getCaller();

          await caller.quiz.delete({ quizId, adminToken });

          return {
            content: [
              {
                type: "text" as const,
                text: `Quiz deleted successfully. All data has been permanently removed.`,
              },
            ],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to delete quiz: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  },
  {
    capabilities: {
      tools: {},
    },
  },
  {
    basePath: "/api/mcp",
  },
);

export { handler as GET, handler as POST, handler as DELETE };
