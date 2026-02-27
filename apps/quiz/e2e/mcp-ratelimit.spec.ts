import { test, expect } from "@playwright/test";

const MCP_URL = "http://localhost:5018/api/mcp/mcp";

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
  test.setTimeout(120_000);

  // Unique IP to avoid cross-test pollution
  const testIp = `10.77.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

  // create_quiz makes 2 tRPC calls (create + addQuestion).
  // Rate limit is 60 req/min, so ~30 calls should exhaust it.
  let rateLimited = false;

  for (let i = 0; i < 35; i++) {
    const text = await mcpCreateQuiz(request, testIp);
    if (text.includes("Too many requests")) {
      rateLimited = true;
      break;
    }
  }

  expect(rateLimited, "Expected rate limiting after 35 create_quiz calls from same IP").toBe(true);

  // A different IP should still work
  const otherIp = `10.88.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const otherText = await mcpCreateQuiz(request, otherIp);
  expect(otherText).toContain("Quiz created successfully");
});
