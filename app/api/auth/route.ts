import { NextRequest, NextResponse } from 'next/server';

// Environment variables needed:
// - GITHUB_OAUTH_CLIENT_ID (GitHub OAuth app client ID)
// - GITHUB_OAUTH_CLIENT_SECRET (GitHub OAuth app client secret)
// - NEXT_PUBLIC_SITE_URL (Your site URL e.g., https://switch-to.eu)

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const provider = url.searchParams.get('provider');
  // We read site_id but don't use it directly - included for compatibility with Decap CMS
  url.searchParams.get('site_id');
  const scope = url.searchParams.get('scope');

  // Get the origin from the request
  const origin = new URL(request.url).origin;

  // If it's an initial authentication request (no code but has provider)
  if (!code && provider === 'github') {
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2, 15);

    // Construct GitHub OAuth URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', process.env.GITHUB_OAUTH_CLIENT_ID || '');
    // Use the actual origin from the request rather than relying on env var
    githubAuthUrl.searchParams.set('redirect_uri', `${origin}/api/auth`);
    githubAuthUrl.searchParams.set('scope', scope || 'repo');
    githubAuthUrl.searchParams.set('state', state);

    // Store state in response cookies for validation when GitHub redirects back
    const response = NextResponse.redirect(githubAuthUrl.toString());
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });

    return response;
  }

  // If it's a callback from GitHub with code
  if (code) {
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
          // Include the redirect_uri for verification
          redirect_uri: `${origin}/api/auth`,
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
      // Use the actual origin from the request
      return NextResponse.redirect(
        `${origin}/admin/#access_token=${tokenData.access_token}`
      );
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  }

  // If neither conditions are met, return an error
  return NextResponse.json(
    { error: 'Invalid request parameters' },
    { status: 400 }
  );
}