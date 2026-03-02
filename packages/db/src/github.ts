import { NextRequest, NextResponse } from "next/server";
import { App } from "octokit";
import { z } from "zod";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";

// Simple in-memory rate limiting implementation
const RATE_LIMITS = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 requests per window

/** Get client IP address from request headers */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown-ip";
  }
  return "unknown-ip";
}

/** Check rate limit for a client ID. Returns true if allowed. */
export function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientLimit = RATE_LIMITS.get(clientId);

  if (!clientLimit) {
    RATE_LIMITS.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > clientLimit.resetTime) {
    RATE_LIMITS.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (clientLimit.count >= MAX_REQUESTS) {
    return false;
  }

  clientLimit.count += 1;
  RATE_LIMITS.set(clientId, clientLimit);
  return true;
}

/** Validation schema for issue submissions */
export const issueSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(100, "Title must be less than 100 characters long")
    .regex(/^[^<>]*$/, "HTML tags are not allowed"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description must be less than 1000 characters long")
    .regex(/^[^<>]*$/, "HTML tags are not allowed"),
  category: z.enum(["bug", "feature", "feedback", "other", "new-service"]),
  contactInfo: z
    .string()
    .max(100, "Contact info must be less than 100 characters long")
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export type IssueFormData = z.infer<typeof issueSchema>;

/** Create a GitHub issue with tool-specific labeling */
export async function createGitHubIssue(
  formData: IssueFormData & { submissionId: string; clientId: string },
  toolId?: string
) {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!appId || !privateKey || !installationId || !repoOwner || !repoName) {
    console.error("Missing required environment variables for GitHub App");
    return;
  }

  let formattedPrivateKey;
  try {
    formattedPrivateKey = privateKey
      .replace(/\\n/g, "\n")
      .replace(/^"(.*)"$/, "$1");
  } catch (keyError) {
    console.error("Error processing private key", keyError);
    return;
  }

  const app = new App({
    appId,
    privateKey: formattedPrivateKey,
  });

  const octokit = await app.getInstallationOctokit(Number(installationId));

  // Format issue body
  let issueBody = `**Category:** ${formData.category}\n\n${formData.description}`;

  if (toolId) {
    issueBody = `**Tool:** ${toolId}\n${issueBody}`;
  }

  if (formData.contactInfo) {
    issueBody += `\n\n---\n**Contact:** ${formData.contactInfo}`;
  }

  issueBody += `\n\n---\n**Submission ID:** ${formData.submissionId}`;

  // Build labels
  const labels: string[] = [formData.category];
  if (toolId) {
    labels.push(`tool:${toolId}`);
  }

  const response = await octokit.request("POST /repos/{owner}/{repo}/issues", {
    owner: repoOwner,
    repo: repoName,
    title: formData.title,
    body: issueBody,
    labels,
  });

  console.log(
    `Successfully created GitHub issue #${response.data.number}: ${response.data.html_url}`
  );
}

/**
 * Factory that creates a Next.js POST handler for GitHub issue creation.
 * Each app calls this with its tool ID to get a pre-configured handler.
 */
export function createIssueRouteHandler(toolId: string) {
  return async function POST(request: NextRequest) {
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

      // Process in background
      setImmediate(() => {
        void createGitHubIssue(
          { title, description, category, contactInfo, submissionId, clientId },
          toolId
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
  };
}
