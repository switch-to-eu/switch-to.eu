import { NextRequest, NextResponse } from "next/server";
import { App } from "octokit";
import { z } from "zod";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { setInRedis, getFromRedis } from "@/lib/redis";

// Simple in-memory rate limiting implementation
const RATE_LIMITS = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 requests per window

// Function to get client IP address
function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown-ip";
}

// Function to check rate limit
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientLimit = RATE_LIMITS.get(clientId);

  if (!clientLimit) {
    // First request from this client
    RATE_LIMITS.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > clientLimit.resetTime) {
    // Window expired, reset counter
    RATE_LIMITS.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (clientLimit.count >= MAX_REQUESTS) {
    // Rate limit exceeded
    return false;
  }

  // Increment counter
  clientLimit.count += 1;
  RATE_LIMITS.set(clientId, clientLimit);
  return true;
}

// Validation schema for the request body with HTML pattern restrictions
const issueSchema = z.object({
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
  csrfToken: z.string().min(1, "CSRF token is required"),
});

// Background processing function
async function processFormInBackground(formData: {
  title: string;
  description: string;
  category: string;
  contactInfo?: string;
  submissionId: string;
  clientId: string;
}) {
  console.log("Processing form in background", formData);
  try {
    // Check if required environment variables are set
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
    const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;

    if (!appId || !privateKey || !installationId || !repoOwner || !repoName) {
      console.error("Missing required environment variables for GitHub App");
      return;
    }

    // Safely process the private key - handle newlines in environment variable
    let formattedPrivateKey;
    try {
      formattedPrivateKey = privateKey
        .replace(/\\n/g, "\n")
        .replace(/^"(.*)"$/, "$1"); // Remove quotes if present
    } catch (keyError) {
      console.error("Error processing private key", keyError);

      // Update Redis with failure status

      return;
    }

    // Initialize GitHub App
    const app = new App({
      appId,
      privateKey: formattedPrivateKey,
    });

    // Get an installation access token
    const octokit = await app.getInstallationOctokit(Number(installationId));

    // Format issue body with metadata
    let issueBody = formData.description;

    // Add category as label at the beginning
    issueBody = `**Category:** ${formData.category}\n\n${issueBody}`;

    // Add contact info if provided
    if (formData.contactInfo) {
      issueBody += `\n\n---\n**Contact:** ${formData.contactInfo}`;
    }

    // Add submission metadata
    issueBody += `\n\n---\n**Submission ID:** ${formData.submissionId}`;

    // Create the issue
    const response = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: repoOwner,
        repo: repoName,
        title: formData.title,
        body: issueBody,
        labels: [formData.category],
      }
    );

    console.log(
      `Successfully created GitHub issue #${response.data.number}: ${response.data.html_url}`
    );
  } catch (error) {
    console.error("Error creating GitHub issue in background:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client identifier (IP address hashed for privacy)
    const clientIp = getClientIp(request);
    const clientId = createHash("sha256").update(clientIp).digest("hex");

    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Check CSRF token
    const host = request.headers.get("host") || "";
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";

    // Basic CSRF validation by checking origins
    if (!origin.includes(host) && !referer.includes(host)) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = issueSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { title, description, category, contactInfo } = validationResult.data;

    // Generate a unique submission ID
    const submissionId = uuidv4();

    // Save initial submission to Redis as backup
    const submissionData = {
      id: submissionId,
      title,
      description,
      category,
      contactInfo: contactInfo || null,
      clientId,
      submittedAt: new Date().toISOString(),
      status: "pending",
      retryCount: 0,
    };

    const submissionKey = `github_submission:${submissionId}`;

    const savedToRedis = await setInRedis(
      submissionKey,
      submissionData,
      60 * 60 * 24 * 7
    ); // 7 days

    if (!savedToRedis) {
      console.error("Failed to save submission to Redis backup");
      // Continue anyway - don't fail the request just because Redis backup failed
    }

    // Process the form in the background using setImmediate
    setImmediate(() => {
      processFormInBackground({
        title,
        description,
        category,
        contactInfo,
        submissionId,
        clientId,
      });
    });

    // Return immediate success response
    return NextResponse.json(
      {
        message:
          "Issue submission received successfully. Your issue will be created shortly.",
        submissionId,
        status: "accepted",
      },
      { status: 202 } // 202 Accepted - request received but not yet processed
    );
  } catch (error) {
    console.error("Error processing form submission:", error);

    // Generic error response that doesn't leak implementation details
    return NextResponse.json(
      {
        error:
          "An error occurred while processing your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
