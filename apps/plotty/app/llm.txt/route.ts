export function GET() {
  const markdown = `# Plotty

> Privacy-friendly polls and scheduling by switch-to.eu. No account needed, end-to-end encrypted.

Plotty lets you create polls and find the best time to meet. Poll data is encrypted — the server never sees your content in plain text.

- **URL**: https://poll.switch-to.eu
- **Part of**: [switch-to.eu](https://www.switch-to.eu) — European alternatives to Big Tech
- **Privacy**: End-to-end encrypted. Encryption key stays in the URL fragment (never sent to the server). No accounts, no tracking.
- **Data storage**: Redis with configurable expiration. All poll data is encrypted at rest.
- **Locales**: English (en), Dutch (nl)

## Features

- Create polls with multiple options or time slots
- Vote without creating an account
- Real-time updates via server-sent events
- Admin link for poll management
- End-to-end encryption (key in URL fragment)
- Automatic expiration

## Pages

- \`/\` — Home: create a new poll
- \`/create\` — Poll creation form
- \`/poll/[id]\` — View and vote on a poll
- \`/poll/[id]/admin\` — Admin panel for poll owner
- \`/privacy\` — Privacy policy`;

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
