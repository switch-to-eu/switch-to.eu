import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract the subscriber data from the request
    const data = await request.json() as { email?: string; first_name?: string; language?: string };
    const { email, first_name, language } = data;

    // Validate the input
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Get environment variables
    const MAIL_COACH_API_KEY = process.env.MAIL_COACH_API_KEY;
    const MAIL_COACH_DOMAIN = process.env.MAIL_COACH_DOMAIN;
    const EMAIL_LIST_UUID = process.env.MAIL_COACH_LIST_ID;

    if (!MAIL_COACH_API_KEY || !MAIL_COACH_DOMAIN || !EMAIL_LIST_UUID) {
      console.error("Mailcoach API key or domain not configured");
      return NextResponse.json(
        { message: "Newsletter service is not properly configured" },
        { status: 500 }
      );
    }

    // Make the request to the Mailcoach API
    const mailcoachResponse = await fetch(
      `https://${MAIL_COACH_DOMAIN}/api/email-lists/${EMAIL_LIST_UUID}/subscribers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MAIL_COACH_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name,
          language: language || "en",
        }),
      }
    );

    // Handle the response from Mailcoach
    if (!mailcoachResponse.ok) {
      const errorData = await mailcoachResponse.json() as { errors?: { email?: string[] } };

      // Check if it's a duplicate subscription
      if (
        mailcoachResponse.status === 422 &&
        errorData.errors?.email?.some(msg => typeof msg === 'string' && msg.includes("has already been taken"))
      ) {
        return NextResponse.json(
          { message: "You are already subscribed to our newsletter." },
          { status: 409 }
        );
      }

      console.error("Mailcoach API error:", errorData);
      return NextResponse.json(
        { message: "Failed to subscribe to the newsletter" },
        { status: mailcoachResponse.status }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: "Successfully subscribed to the newsletter" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
