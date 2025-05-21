import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";

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
const feedbackSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .regex(/^[^<>]*$/, "HTML tags are not allowed"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .regex(/^[^<>]*$/, "HTML tags are not allowed"),
  category: z.enum(["bug", "feature", "feedback", "other"]),
  contactInfo: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  csrfToken: z.string().min(1, "CSRF token is required"),
});

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
    const validationResult = feedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { title, description, category, contactInfo } = validationResult.data;

    // Check if required environment variables are set
    const mailcoachToken = process.env.MAIL_COACH_API_KEY;
    const mailcoachDomain = process.env.MAIL_COACH_DOMAIN;
    const notificationEmail = process.env.NOTIFICATION_EMAIL;

    if (!mailcoachToken || !mailcoachDomain || !notificationEmail) {
      console.error("Missing required environment variables for Mailcoach API");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Format email body
    const emailSubject = `[${category.toUpperCase()}] ${title}`;

    // Create HTML content for the email
    const emailHtml = `
      <h2>New Feedback Submission</h2>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong><br>${description.replace(
        /\n/g,
        "<br>"
      )}</p>
      ${contactInfo ? `<p><strong>Contact:</strong> ${contactInfo}</p>` : ""}
    `;

    // Send transactional email via Mailcoach API
    const mailcoachResponse = await fetch(
      `https://${mailcoachDomain}/api/transactional-mails/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mailcoachToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "info@switch-to.eu",
          subject: emailSubject,
          to: notificationEmail,
          html: emailHtml,
          replacements: {
            category: category,
            title: title,
            description: description,
            contactInfo: contactInfo || "Not provided",
          },
        }),
      }
    );

    if (!mailcoachResponse.ok) {
      const errorData = await mailcoachResponse.json();
      console.error("Mailcoach API error:", errorData);
      return NextResponse.json(
        { error: "Failed to send feedback notification" },
        { status: 500 }
      );
    }

    const mailData = await mailcoachResponse.json();

    // Return success response
    return NextResponse.json(
      {
        message: "Feedback submitted successfully",
        referenceId: mailData.uuid || "unknown",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);

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
