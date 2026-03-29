export async function GET() {
  const markdown = `# KeepFocus

> Pomodoro timer and focus tracker by switch-to.eu. No account needed, no data stored on servers.

KeepFocus helps you stay productive using the Pomodoro Technique: 25-minute work sessions followed by 5-minute breaks. All data stays in your browser.

- **URL**: https://focus.switch-to.eu
- **Part of**: [switch-to.eu](https://switch-to.eu) — European alternatives to Big Tech
- **Privacy**: No accounts, no tracking, no server-side data storage. Everything runs locally in the browser.
- **Locales**: English (en), Dutch (nl)

## Features

- Pomodoro timer (25 min work / 5 min break)
- Task management during focus sessions
- Session tracking and statistics
- Works entirely in the browser — no sign-up required

## Pages

- \`/\` — Home: start a focus session
- \`/privacy\` — Privacy policy`;

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
