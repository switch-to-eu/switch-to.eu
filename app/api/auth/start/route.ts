import { NextRequest, NextResponse } from "next/server";

// Environment variables needed:
// - GITHUB_OAUTH_CLIENT_ID (GitHub OAuth app client ID)

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const scope = url.searchParams.get("scope");
  const origin = new URL(request.url).origin;

  // Check required parameters
  if (!provider) {
    return NextResponse.json(
      { error: "Missing required parameter: provider" },
      { status: 400 }
    );
  }

  // Currently only GitHub is supported
  if (provider !== "github") {
    return NextResponse.json(
      { error: 'Unsupported provider. Only "github" is currently supported' },
      { status: 400 }
    );
  }

  // Verify client ID is configured
  if (!process.env.GITHUB_OAUTH_CLIENT_ID) {
    console.error("Missing environment variable: GITHUB_OAUTH_CLIENT_ID");
    return NextResponse.json(
      { error: "Authentication service is misconfigured" },
      { status: 500 }
    );
  }

  try {
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2, 15);

    // Construct GitHub OAuth URL
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
    githubAuthUrl.searchParams.set(
      "client_id",
      process.env.GITHUB_OAUTH_CLIENT_ID
    );
    githubAuthUrl.searchParams.set(
      "redirect_uri",
      `${origin}/api/auth/callback`
    );
    githubAuthUrl.searchParams.set("scope", scope || "repo");
    githubAuthUrl.searchParams.set("state", state);

    // Store state in response cookies for validation when GitHub redirects back
    const response = NextResponse.redirect(githubAuthUrl.toString());
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("Error initiating authentication:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication process" },
      { status: 500 }
    );
  }
}
