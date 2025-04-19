import { NextRequest, NextResponse } from 'next/server';

// Environment variables needed:
// - GITHUB_OAUTH_CLIENT_ID (GitHub OAuth app client ID)
// - GITHUB_OAUTH_CLIENT_SECRET (GitHub OAuth app client secret)
// - NEXT_PUBLIC_SITE_URL (Your site URL e.g., https://switch-to.eu)

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'No code provided' },
      { status: 400 }
    );
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error },
        { status: 400 }
      );
    }

    // Redirect back to the admin with the token
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/admin/#access_token=${tokenData.access_token}`
    );
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}