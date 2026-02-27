import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { headers } from "next/headers";
import { generateEncryptionKey, encryptData } from "@switch-to-eu/db/crypto";
import { hashPassword } from "@/lib/crypto";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const EXPIRY_OPTIONS = ["5m", "30m", "1h", "24h", "7d"] as const;

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 5016}`;
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "create_privnote",
      {
        description:
          "Create an encrypted, self-destructing private note. Returns a share URL " +
          "containing the decryption key. The note is encrypted with AES-256-GCM " +
          "before storage — the server never sees the plaintext. " +
          "IMPORTANT: The returned URL contains the encryption key and should be " +
          "shared securely with the intended recipient only.",
        inputSchema: {
          content: z
            .string()
            .min(1)
            .max(50000)
            .describe("The plaintext note content to encrypt and store."),
          expiry: z
            .enum(EXPIRY_OPTIONS)
            .default("24h")
            .describe(
              "How long until the note expires. Options: 5m, 30m, 1h, 24h (default), 7d.",
            ),
          burnAfterReading: z
            .boolean()
            .default(true)
            .describe(
              "If true (default), the note is permanently deleted after being read once.",
            ),
          password: z
            .string()
            .optional()
            .describe(
              "Optional password. The recipient must enter this password to view the note.",
            ),
        },
      },
      async ({ content, expiry, burnAfterReading, password }) => {
        try {
          // Generate encryption key and encrypt content server-side
          const encryptionKey = await generateEncryptionKey();
          const encryptedContent = await encryptData(content, encryptionKey);

          // Hash password if provided
          const passwordHash = password
            ? await hashPassword(password)
            : undefined;

          // Call the tRPC router directly — no HTTP round-trip
          const reqHeaders = await headers();
          const ctx = await createTRPCContext({ headers: reqHeaders });
          
          const caller = createCaller(ctx);
          const result = await caller.note.create({
            encryptedContent,
            expiry,
            burnAfterReading,
            passwordHash,
          });

          // Build the share URL with encryption key in fragment
          const baseUrl = getBaseUrl();
          const shareUrl = `${baseUrl}/en/note/${result.noteId}#key=${encodeURIComponent(encryptionKey)}`;

          const lines = [
            `Private note created successfully.`,
            ``,
            `Share URL: ${shareUrl}`,
            ``,
            `Details:`,
            `- Note ID: ${result.noteId}`,
            `- Expires at: ${result.expiresAt}`,
            `- Burn after reading: ${result.burnAfterReading ? "Yes" : "No"}`,
            `- Password protected: ${password ? "Yes" : "No"}`,
            ``,
            `SECURITY: The URL above contains the decryption key in the fragment (#key=...). ` +
              `Share it only with the intended recipient through a secure channel.`,
          ];

          if (password) {
            lines.push(
              ``,
              `The recipient will also need the password you specified to access the note.`,
            );
          }

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
                text: `Failed to create private note: ${message}`,
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
