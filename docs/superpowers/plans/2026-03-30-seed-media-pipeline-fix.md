# Seed Media Pipeline Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the seed pipeline so service screenshots and guide videos upload correctly to Vercel Blob, with environment-based prefixes to isolate staging/production.

**Architecture:** Three bugs prevent media uploads from working: screenshot paths resolve incorrectly (treated as absolute filesystem paths), video paths resolve relative to content root instead of the guide directory, and there's no environment prefix on Vercel Blob to isolate environments. All fixes are in the `apps/website/seed/` and `apps/website/payload.config.ts` files.

**Tech Stack:** Payload CMS, Vercel Blob Storage (`@payloadcms/storage-vercel-blob`), Node.js `fs`/`path`

---

### Task 1: Add environment prefix to Vercel Blob storage

**Files:**
- Modify: `apps/website/payload.config.ts:63-69`

The `vercelBlobStorage` plugin supports a `prefix` option per collection. Use `VERCEL_ENV` (auto-set by Vercel to `production`, `preview`, or `development`) with a `local` fallback so different environments don't overwrite each other's files.

- [ ] **Step 1: Add prefix to Vercel Blob config**

In `apps/website/payload.config.ts`, change the blob storage plugin config from:

```ts
vercelBlobStorage({
  collections: { media: true },
  token: process.env.BLOB_READ_WRITE_TOKEN,
})
```

to:

```ts
vercelBlobStorage({
  collections: {
    media: {
      prefix: process.env.VERCEL_ENV ?? "local",
    },
  },
  token: process.env.BLOB_READ_WRITE_TOKEN,
})
```

This means files land at `local/filename.png` in dev, `preview/filename.png` on preview deploys, and `production/filename.png` in prod.

- [ ] **Step 2: Verify config compiles**

Run: `pnpm --filter website build` (just needs to pass the TypeScript compile step — you can ctrl+C after the build starts successfully)

- [ ] **Step 3: Commit**

```bash
git add apps/website/payload.config.ts
git commit -m "feat(seed): add environment prefix to Vercel Blob storage"
```

---

### Task 2: Fix screenshot path resolution

**Files:**
- Modify: `apps/website/seed/importMedia.ts:50-83`

**Bug:** Service frontmatter has screenshot paths like `/images/services/brave.png`. These are Next.js public-dir paths. `resolveMedia` does `path.resolve(CONTENT_ROOT, source)` — but since `source` starts with `/`, `path.resolve` treats it as an absolute filesystem path, looking for `/images/services/brave.png` which doesn't exist.

The actual files are at `apps/website/public/images/services/brave.png`.

- [ ] **Step 1: Add PUBLIC_ROOT constant**

In `apps/website/seed/importMedia.ts`, add a new constant after the existing `CONTENT_ROOT`:

```ts
const PUBLIC_ROOT = path.resolve(
  process.cwd(),
  "public",
);
```

- [ ] **Step 2: Update resolveMedia to handle public-dir paths**

In the local file path branch of `resolveMedia` (the `else` block after the URL check), replace:

```ts
// Local file path — resolve relative to content root
const filePath = path.resolve(CONTENT_ROOT, source);
```

with:

```ts
// Local file path
// Paths starting with /images/ or /videos/ are relative to the public directory
// Other paths are relative to the content root
const filePath = source.startsWith("/images/") || source.startsWith("/videos/")
  ? path.join(PUBLIC_ROOT, source)
  : path.resolve(CONTENT_ROOT, source);
```

- [ ] **Step 3: Verify with dry-run**

Run: `pnpm --filter website seed --dry-run`

Check the output — services should log `screenshot: yes` for EU services that have screenshots (brave, threema, infomaniak, etc.).

- [ ] **Step 4: Commit**

```bash
git add apps/website/seed/importMedia.ts
git commit -m "fix(seed): resolve screenshot paths from public directory"
```

---

### Task 3: Fix video path resolution for guide steps

**Files:**
- Modify: `apps/website/seed/importGuides.ts:54-59` and `apps/website/seed/importGuides.ts:142-147`

**Bug:** Guide step metadata has video paths like `media/proton-desktop1.mp4` which are relative to the guide's directory (e.g., `en/guides/email/gmail-to-protonmail/`). But `uploadMedia` passes this to `resolveMedia` which resolves against `CONTENT_ROOT` (`packages/content/content/`), producing `packages/content/content/media/proton-desktop1.mp4` — wrong.

The actual file is at `packages/content/content/en/guides/email/gmail-to-protonmail/media/proton-desktop1.mp4`.

The fix: compute the full content-root-relative path in `importGuides.ts` before calling `uploadMedia`.

- [ ] **Step 1: Add a helper to compute guide-relative video paths**

At the top of `importGuides.ts` (after the imports), add:

```ts
/**
 * Resolve a video path relative to the guide directory to a content-root-relative path.
 * e.g., "media/proton-desktop1.mp4" for guide at en/guides/email/gmail-to-protonmail
 * becomes "en/guides/email/gmail-to-protonmail/media/proton-desktop1.mp4"
 */
function resolveGuideMediaPath(
  videoPath: string,
  category: string,
  slug: string,
  lang: string,
): string {
  return path.join(lang, "guides", category, slug, videoPath);
}
```

Also add `import path from "node:path";` at the top.

- [ ] **Step 2: Update EN step video upload to use resolved paths**

In the `enStepData` mapping (around line 54-59), change:

```ts
if (!dryRun && step.video && payload) {
  videoId = await uploadMedia(payload, step.video, `${enFm.title} — ${step.title ?? "step"}`);
}
```

to:

```ts
if (!dryRun && step.video && payload) {
  const videoPath = resolveGuideMediaPath(step.video, guide.category, guide.slug, "en");
  videoId = await uploadMedia(payload, videoPath, `${enFm.title} — ${step.title ?? "step"}`);
}
```

- [ ] **Step 3: Update NL step video upload to use resolved paths**

In the `nlStepData` mapping (around line 142-147), change:

```ts
if (step.video && payload) {
  videoId = await uploadMedia(payload, step.video, `${nlFm.title} — ${step.title ?? "step"}`);
}
```

to:

```ts
if (step.video && payload) {
  const videoPath = resolveGuideMediaPath(step.video, guide.category, guide.slug, "nl");
  videoId = await uploadMedia(payload, videoPath, `${nlFm.title} — ${step.title ?? "step"}`);
}
```

Note: If a Dutch guide doesn't have its own video files, the upload will warn and skip — the NL locale can share the EN video via the media relationship (since media isn't localized). If you want NL to fall back to EN videos, add a fallback:

```ts
if (step.video && payload) {
  const nlVideoPath = resolveGuideMediaPath(step.video, guide.category, guide.slug, "nl");
  const enVideoPath = resolveGuideMediaPath(step.video, guide.category, guide.slug, "en");
  videoId = await uploadMedia(payload, nlVideoPath, `${nlFm.title} — ${step.title ?? "step"}`)
    ?? await uploadMedia(payload, enVideoPath, `${nlFm.title} — ${step.title ?? "step"}`);
}
```

- [ ] **Step 4: Verify with dry-run**

Run: `pnpm --filter website seed --dry-run`

Check that guides with videos still parse correctly (step counts should match).

- [ ] **Step 5: Commit**

```bash
git add apps/website/seed/importGuides.ts
git commit -m "fix(seed): resolve guide video paths relative to guide directory"
```

---

### Task 4: Run the full seed with media uploads

**Files:**
- None (runtime only)

- [ ] **Step 1: Ensure dev server is stopped**

The seed script needs exclusive database access. Stop any running `pnpm dev` process.

- [ ] **Step 2: Run seed with reset**

```bash
pnpm --filter website seed --reset
```

Watch the output for:
- `Uploaded media: brave.png (id: X)` lines for service screenshots
- `Uploaded media: proton-desktop1.mp4 (id: X)` lines for guide videos
- No `Media file not found` warnings

- [ ] **Step 3: Verify in Payload admin**

Open http://localhost:3000/admin/collections/media and confirm:
- Service screenshots are visible
- Guide videos are uploaded
- Files have the `local/` prefix in their URLs (Vercel Blob)

- [ ] **Step 4: Verify on frontend**

Open http://localhost:3000/en/guides/email/gmail-to-protonmail and confirm:
- Step videos load and autoplay when scrolled into view
- Video URLs point to Vercel Blob (not local `/images/` paths)

Open a service page with a screenshot (e.g., http://localhost:3000/en/services/eu/brave) and confirm:
- Screenshot/hero banner image loads from Vercel Blob

- [ ] **Step 5: Commit if any additional fixes were needed**

```bash
git add -A
git commit -m "fix(seed): address issues found during media upload testing"
```
