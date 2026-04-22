# Shared Helper: Unlighthouse

Local Lighthouse runner. Installed as a dependency; invoke via `npx unlighthouse`.

## Single-URL audit

```bash
npx unlighthouse --site <absolute-url> --throttle --output-dir /tmp/unlighthouse-<slug> --no-open
```

- `<slug>` should be derived from the URL (replace non-alphanum with `-`) so runs don't collide.
- `--no-open` disables browser auto-launch; required for non-interactive runs.
- `--throttle` enables simulated 3G + CPU throttling; matches the Lighthouse web UI defaults.

## Reading output

Unlighthouse writes HTML + JSON reports to the output dir. Parse:

```
/tmp/unlighthouse-<slug>/reports/<report-id>.json
```

Extract top-level scores (0–100):
- `categories.performance.score * 100`
- `categories.accessibility.score * 100`
- `categories['best-practices'].score * 100`
- `categories.seo.score * 100`

## Timing

Allow ~15–30s per URL (includes cold-start Chromium). Multi-URL runs that exceed 5 minutes should be batched across invocations rather than one massive run.

## Cleanup

Delete `/tmp/unlighthouse-<slug>` after extracting scores to avoid disk bloat over many audits.

## Error patterns

- `Error: Cannot find Chrome` — install chromium via `npx playwright install chromium` (already installed for this repo's Playwright tests).
- Timeout on a single URL — the target is unreachable or extremely slow. Skip that URL, report a gap, continue.
