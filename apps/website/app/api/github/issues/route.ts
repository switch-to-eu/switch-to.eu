import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  issueSchema,
  createGitHubIssue,
  checkRateLimit,
  getClientIp,
} from "@switch-to-eu/db/github";
import { setInRedis } from "@/lib/redis";

const TOOL_ID = "website";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const clientId = createHash("sha256").update(clientIp).digest("hex");

    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const host = request.headers.get("host") || "";
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";

    if (!origin.includes(host) && !referer.includes(host)) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validationResult = issueSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { title, description, category, contactInfo } =
      validationResult.data;
    const submissionId = uuidv4();

    // Save submission to Redis as backup
    const submissionData = {
      id: submissionId,
      title,
      description,
      category,
      contactInfo: contactInfo || null,
      clientId,
      tool: TOOL_ID,
      submittedAt: new Date().toISOString(),
      status: "pending",
      retryCount: 0,
    };

    const savedToRedis = await setInRedis(
      `github_submission:${submissionId}`,
      submissionData,
      60 * 60 * 24 * 7
    );

    if (!savedToRedis) {
      console.error("Failed to save submission to Redis backup");
    }

    setImmediate(() => {
      void createGitHubIssue(
        { title, description, category, contactInfo, submissionId, clientId },
        TOOL_ID
      );
    });

    return NextResponse.json(
      {
        message:
          "Issue submission received successfully. Your issue will be created shortly.",
        submissionId,
        status: "accepted",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error processing form submission:", error);
    return NextResponse.json(
      {
        error:
          "An error occurred while processing your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
