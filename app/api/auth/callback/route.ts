import { NextRequest, NextResponse } from "next/server";

// Environment variables needed:
// - GITHUB_OAUTH_CLIENT_ID (GitHub OAuth app client ID)
// - GITHUB_OAUTH_CLIENT_SECRET (GitHub OAuth app client secret)

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const origin = new URL(request.url).origin;

  // Verify required parameters
  if (!code) {
    return NextResponse.json(
      { error: "Missing required parameter: code" },
      { status: 400 }
    );
  }

  // Verify OAuth state matches for security
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid or missing state parameter" },
      { status: 400 }
    );
  }

  // Verify environment variables
  if (
    !process.env.GITHUB_OAUTH_CLIENT_ID ||
    !process.env.GITHUB_OAUTH_CLIENT_SECRET
  ) {
    console.error(
      "Missing environment variables: GITHUB_OAUTH_CLIENT_ID or GITHUB_OAUTH_CLIENT_SECRET"
    );
    return NextResponse.json(
      { error: "Authentication service is misconfigured" },
      { status: 500 }
    );
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
          client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
          code,
          // Include the redirect_uri for verification - updated to the new endpoint
          redirect_uri: `${origin}/api/auth/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("GitHub token exchange failed:", errorText);
      return NextResponse.json(
        { error: "Failed to exchange code for token", details: errorText },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error);
      return NextResponse.json(
        {
          error: tokenData.error,
          error_description: tokenData.error_description,
        },
        { status: 400 }
      );
    }

    // Return a simple callback page that posts the token to the parent window
    const postMessageHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Authenticating...</title>
  <style>
    body {
      font-family: -apple-system, sans-serif;
      text-align: center;
      padding: 40px;
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #0366d6;
      animation: spin 1s ease-in-out infinite;
      margin-right: 10px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading"></div>
  <span>Authentication successful. Finishing login...</span>

  <script>
    // Very simple auth callback - just pass the token to the opener and close
    (function() {
      const token = "${tokenData.access_token}";

      // First try using postMessage
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "github:auth",
            token: token
          },
          "*"  // Use * to ensure message is received regardless of origin
        );

        // Allow some time for message to be processed
        setTimeout(function() {
          try {
            window.close();
          } catch (e) {
            // If we can't close, redirect
            redirectToAdmin();
          }
        }, 500);
      } else {
        redirectToAdmin();
      }

      // Fallback - redirect to admin with token in URL
      function redirectToAdmin() {
        window.location.href = window.location.origin + "/admin/#access_token=" + token;
      }
    })();
  </script>
</body>
</html>`;

    // Clear the oauth_state cookie as it's no longer needed
    const response = new NextResponse(postMessageHTML, {
      headers: {
        "Content-Type": "text/html",
      },
    });

    response.cookies.set("oauth_state", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Authentication callback error:", error);
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
