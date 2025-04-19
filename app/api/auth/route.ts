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

      // Instead of redirecting, return a page that sends the token back to the parent window
      const postMessageHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Authenticating...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }
    .status {
      margin-top: 20px;
      padding: 10px;
      background-color: #f8f8f8;
      border-radius: 4px;
      font-family: monospace;
    }
    h2 {
      margin-top: 30px;
    }
    button {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #0366d6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .hidden {
      display: none;
    }
    #debug {
      margin-top: 20px;
      text-align: left;
      background: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      white-space: pre-wrap;
      overflow: auto;
      max-height: 200px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h2>Authentication Successful</h2>
  <p>You've successfully authenticated with GitHub.</p>
  <div class="status" id="status">Sending token to CMS...</div>
  <div id="debug"></div>
  <button id="manualClose" class="hidden">Close This Window</button>
  <button id="goToAdmin" class="hidden">Go to Admin Panel</button>

  <script>
    const debug = document.getElementById('debug');
    const status = document.getElementById('status');
    const manualClose = document.getElementById('manualClose');
    const goToAdmin = document.getElementById('goToAdmin');

    function log(message) {
      console.log(message);
      if (debug) {
        debug.textContent += message + '\\n';
        debug.scrollTop = debug.scrollHeight;
      }
    }

    log('Authentication flow complete');
    log('Received access token from GitHub');

    // Get the origin for the parent window
    const origin = window.location.origin;
    log('Origin: ' + origin);

    // Function to update status
    function updateStatus(message) {
      if (status) status.textContent = message;
      log(message);
    }

    // Try to send the token to the parent window
    try {
      if (window.opener) {
        log('Found opener window, attempting to send token');

        // First, try the Decap CMS expected format
        window.opener.postMessage(
          {
            type: "github:auth",
            token: "${tokenData.access_token}"
          },
          origin
        );

        log('Sent token message to parent');
        updateStatus('Authentication complete! Token sent to CMS.');

        // Wait a moment and then try to close
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            log('Could not auto-close window: ' + e.message);
            manualClose.classList.remove('hidden');
          }
        }, 1500);
      } else {
        log('No opener window found!');
        updateStatus('No parent window found. Please use the button below to return to the CMS.');
        goToAdmin.classList.remove('hidden');
      }
    } catch (error) {
      log('Error sending token: ' + error.message);
      updateStatus('Error sending authentication data. Please go back to the admin panel manually.');
      manualClose.classList.remove('hidden');
      goToAdmin.classList.remove('hidden');
    }

    // Manual close button
    manualClose.addEventListener('click', () => {
      window.close();
    });

    // Go to admin button
    goToAdmin.addEventListener('click', () => {
      window.location.href = origin + '/admin/#access_token=${tokenData.access_token}';
    });
  </script>
</body>
</html>`;

      return new NextResponse(postMessageHTML, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
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