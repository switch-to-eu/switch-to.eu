import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5018";
const TRPC_URL = `${BASE}/api/trpc`;
const MCP_URL = `${BASE}/api/mcp/mcp`;

function randomIp() {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Run tests in parallel
test.describe.configure({ mode: "parallel" });

// --- tRPC rate limiting ---

test("tRPC quiz.health is rate-limited per IP", async ({ request }) => {
  const ip = randomIp();

  // Blast 65 concurrent requests — limit is 60/min
  const results = await Promise.all(
    Array.from({ length: 65 }, () =>
      request.get(`${TRPC_URL}/quiz.health`, {
        headers: { "x-forwarded-for": ip },
      }),
    ),
  );

  const statuses = results.map((r) => r.status());
  const ok = statuses.filter((s) => s === 200).length;
  const limited = statuses.filter((s) => s === 429).length;

  expect(ok).toBe(60);
  expect(limited).toBe(5);

  // A different IP should still work
  const other = await request.get(`${TRPC_URL}/quiz.health`, {
    headers: { "x-forwarded-for": randomIp() },
  });
  expect(other.status()).toBe(200);
});

// --- MCP rate limiting ---

const MCP_HEADERS = {
  "content-type": "application/json",
  accept: "application/json, text/event-stream",
};

/** Call the create_quiz MCP tool and return the text content */
async function mcpCreateQuiz(
  request: import("@playwright/test").APIRequestContext,
  ip: string,
): Promise<string> {
  const res = await request.post(MCP_URL, {
    headers: { ...MCP_HEADERS, "x-forwarded-for": ip },
    data: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "create_quiz",
        arguments: {
          title: "Rate limit test",
          description: "",
          questions: [
            { text: "Q?", options: ["A", "B"], correctIndex: 0 },
          ],
          timerSeconds: 0,
          expirationHours: 1,
        },
      },
    },
  });
  // Response is SSE: "event: message\ndata: {json}\n\n"
  const raw = await res.text();
  const dataLine = raw.split("\n").find((l) => l.startsWith("data: "));
  if (!dataLine) return raw;
  const json = JSON.parse(dataLine.slice(6));
  return json?.result?.content?.[0]?.text ?? "";
}

test("MCP create_quiz is rate-limited per IP", async ({ request }) => {
  const testIp = randomIp();

  // Exhaust the 60-req/min rate limit with cheap tRPC health calls first
  await Promise.all(
    Array.from({ length: 60 }, () =>
      request.get(`${TRPC_URL}/quiz.health`, {
        headers: { "x-forwarded-for": testIp },
      }),
    ),
  );

  // Now the MCP call (which internally calls tRPC) should be rate-limited
  const text = await mcpCreateQuiz(request, testIp);
  expect(text).toContain("Too many requests");

  // A different IP should still work
  const otherText = await mcpCreateQuiz(request, randomIp());
  expect(otherText).toContain("Quiz created successfully");
});
