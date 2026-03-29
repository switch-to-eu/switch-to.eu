export async function GET() {
  const markdown = `# PrivNote

> Self-destructing encrypted notes by switch-to.eu. No account needed, end-to-end encrypted.

PrivNote lets you send private notes that self-destruct after reading. Notes are end-to-end encrypted — the server never sees your content in plain text.

- **URL**: https://privnote.switch-to.eu
- **Part of**: [switch-to.eu](https://switch-to.eu) — European alternatives to Big Tech
- **Privacy**: End-to-end encrypted. Encryption key stays in the URL fragment (never sent to the server). No accounts, no tracking.
- **Data storage**: Redis with configurable TTL (5 minutes to 30 days). All note data is encrypted at rest.
- **Locales**: English (en), Dutch (nl)

## Features

- Burn-after-reading: notes auto-delete after being viewed
- Configurable time-to-live (5 min to 30 days)
- Optional password protection (server-side gate)
- End-to-end encryption (key in URL fragment)
- Shareable link with built-in share page
- MCP (Model Context Protocol) integration for AI tools

## Pages

- \`/\` — Home: create a new note
- \`/create\` — Note creation form
- \`/note/[id]\` — View (and destroy) a note
- \`/note/[id]/share\` — Share page with copy link
- \`/mcp\` — MCP integration info
- \`/privacy\` — Privacy policy`;

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
