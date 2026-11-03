# Shared Helper: Reddit MCP

Patterns for calling the `reddit` MCP server (`reddit-mcp-server`, anonymous mode).

## Available tools

The common surface is:
- `mcp__reddit__search_reddit` — Reddit-wide search with optional subreddit filter
- `mcp__reddit__get_top_posts` — top posts in a given subreddit
- `mcp__reddit__get_post_comments` — comments on a specific post
- `mcp__reddit__get_subreddit_info` — subreddit metadata

Without credentials, `search_reddit` reads from the Arctic Shift archive. Pass one `subreddit` per call. Scores and comment counts lag and are often 0 or 1. Arctic Shift can time out under load: retry once after a few seconds.

## Second server: `reddit-mcp-buddy`

`.mcp.json` also has `reddit-mcp-buddy` (tools `mcp__reddit-mcp-buddy__*`). Without `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` in the root `.env`, only `browse_subreddit` works, and it returns no scores. Its `search_reddit` fails. Use the `reddit` server for search unless those credentials are set.

## Default subreddit set

For SEO / switch-to.eu use cases, always include these unless overridden:
- `r/privacy`
- `r/europe`
- `r/selfhosted`
- `r/degoogle`

Optional adds for specific topics: `r/ProtonMail`, `r/VPN`, `r/opensource`, `r/GoogleAlternatives`.

## Query patterns

- For `research` — `"<service name>"` alone; let sentiment come from the posts returned. Use `search_reddit` with the service name plus a subreddit filter when sentiment should be privacy-aware.
- For `opportunity-finder` Mode B — search for `european alternative`, `privacy-friendly`, `swiss hosted`, `gdpr compliant`, plus each non-EU product name we don't yet cover.

## Sentiment classification (heuristic)

Score each post or top-comment as `positive | negative | mixed | neutral`:

- **Positive signals**: words like "love", "great", "switched to", "worth it", "recommend"; upvote ratio > 0.9.
- **Negative signals**: "broken", "disappointed", "lost data", "overpriced", "avoid"; upvote ratio < 0.6.
- **Mixed**: positive and negative keywords in the same post.
- **Neutral**: factual mentions without clear affect.

Don't over-engineer. If the sample is <5 posts, say so in the generated summary rather than claim a strong signal.

## Rate limiting

Anonymous mode: ~10 req/min informal limit. Batch subreddit searches; don't fan out more than ~5 queries in parallel.

## Time window

- Default `time_filter=year` for `research` (surface trends over 12 months).
- Default `time_filter=quarter` (3 months) for `opportunity-finder` Mode B (catch current conversation).

## Error patterns

- `429` → wait 60s and retry once. If still failing, skip this subreddit and note in downstream output.
- Empty results → not an error. Record as "no Reddit discussion found in this window."

## Reddit Responsible Builder Policy (from MCP server instructions)

Stored for reference; relevant when using Reddit data in rendered site output:

- Data retrieved must NOT be used for AI model training without Reddit's written approval.
- Do NOT sell, license, or commercially redistribute Reddit data.
- Do NOT attempt to de-anonymize users.
- Bot-generated content on Reddit itself must disclose its automated nature.

For our use: we extract snippets + URLs for editorial summaries on service pages, which is fair use under the policy. Always credit the source URL when rendering a Reddit quote on the public site.
