export function GET() {
  const markdown = `# Listy

> Private shared lists by switch-to.eu. No account needed, end-to-end encrypted.

Listy lets you create and share lists instantly — shopping lists, potlucks, and more. List data is encrypted so the server never sees your content.

- **URL**: https://list.switch-to.eu
- **Part of**: [switch-to.eu](https://www.switch-to.eu) — European alternatives to Big Tech
- **Privacy**: End-to-end encrypted. Encryption key stays in the URL fragment (never sent to the server). No accounts, no tracking.
- **Data storage**: Redis with configurable expiration. All list data is encrypted at rest.
- **Locales**: English (en), Dutch (nl)

## Features

- Create shared lists (plain, shopping, or potluck)
- Real-time collaboration via server-sent events
- Potluck lists with claim/unclaim functionality
- Admin link for list management
- End-to-end encryption (key in URL fragment)
- Automatic expiration

## Pages

- \`/\` — Home: create a new list
- \`/create\` — List creation form
- \`/list/[id]\` — View and edit a shared list
- \`/list/[id]/admin\` — Admin panel for list owner
- \`/privacy\` — Privacy policy`;

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
