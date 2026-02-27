/**
 * Interactive load-player test for quiz app.
 *
 * This is NOT an automated CI test. It spawns multiple browser players that
 * join a live quiz and submit random answers. You (the admin) control the
 * quiz flow — start the quiz, advance questions, finish — while these
 * simulated players participate.
 *
 * Usage:
 *   JOIN_URL="http://localhost:5018/en/join/ABC123#key=..." PLAYERS=8 \
 *     pnpm --filter @switch-to-eu/quiz test:e2e:players
 *
 * Environment variables:
 *   JOIN_URL  — Full join URL including fragment (required)
 *   PLAYERS   — Number of simulated players (default: 5)
 */
import { test, chromium, type BrowserContext, type Page } from "@playwright/test";
import { QUIZ_STATE_TITLES, type QuizState } from "../../server/db/types";

// ── Configuration ──────────────────────────────────────────────────────────

const JOIN_URL = process.env.JOIN_URL ?? "";
const PLAYER_COUNT = parseInt(process.env.PLAYERS ?? "5", 10);

// How long to wait for admin to advance the quiz between states
const ADMIN_WAIT_TIMEOUT = 5 * 60_000; // 5 minutes
// Random delay range (ms) before answering to simulate human behavior
const MIN_ANSWER_DELAY = 500;
const MAX_ANSWER_DELAY = 3_000;

const NICKNAMES = [
  "QuizBot", "SpeedyGonzales", "BrainiacBot", "LuckyGuesser",
  "RandomRick", "ClickHappy", "TestPilot", "QuizWhiz",
  "ButtonMasher", "CaptainRandom", "DataDrivenDave", "ErrorBot",
  "FastFingers", "GuessQueen", "HappyClicker", "InstaAnswer",
  "JokesterJay", "KeyboardKid", "LazyLarry", "MegaMind",
  "NerdyNick", "OverThinker", "PixelPusher", "QuickDraw",
  "RushRobot", "SnapAnswer", "TurboTester", "UltraUser",
  "VibeChecker", "WildCard", "XtremeBot", "YoloPlayer",
  "ZappyZoe", "AlphaAnswerer", "BetaBrain", "ChaosCat",
  "DiceyDan", "EagerEve", "FlipCoin", "GamblerGus",
  "HunchHero", "ImpulseIvy", "JumbleJack", "KineticKate",
  "LoopLuke", "MayhemMax", "NimbleNora", "OddOracle",
  "PulsePlayer", "QueueQueen",
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function randomDelay(): Promise<void> {
  const ms = MIN_ANSWER_DELAY + Math.random() * (MAX_ANSWER_DELAY - MIN_ANSWER_DELAY);
  return new Promise((r) => setTimeout(r, ms));
}

function pickNickname(index: number): string {
  if (index < NICKNAMES.length) return NICKNAMES[index];
  return `Player${index + 1}`;
}

function log(player: string, msg: string) {
  const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
  console.log(`[${ts}] 🎮 ${player}: ${msg}`);
}

// ── State detection via document.title ──────────────────────────────────────

// Build a reverse lookup: title string → QuizState
const TITLE_TO_STATE = new Map(
  Object.entries(QUIZ_STATE_TITLES).map(([state, title]) => [title, state as QuizState]),
);

const ANSWER_BUTTON_SELECTOR =
  "button.bg-red-500, button.bg-blue-500, button.bg-yellow-500, button.bg-green-500, button.bg-purple-500, button.bg-orange-500";

const POLL_INTERVAL = 1_000; // check state every second

/**
 * Read the current quiz state from the page's document.title.
 * Returns undefined if the title doesn't match any known state.
 */
async function detectState(page: Page): Promise<QuizState | undefined> {
  const title = await page.title();
  return TITLE_TO_STATE.get(title);
}

/**
 * Poll until the page transitions to one of the target states, or timeout.
 */
async function waitForState(
  page: Page,
  targets: QuizState[],
  timeout: number,
): Promise<QuizState | "timeout"> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const state = await detectState(page);
    if (state && targets.includes(state)) return state;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
  return "timeout";
}

// ── Single player lifecycle ─────────────────────────────────────────────────

async function runPlayer(context: BrowserContext, nickname: string) {
  const page = await context.newPage();

  // 1. Navigate to join page
  log(nickname, `Joining via ${JOIN_URL.split("#")[0]}`);
  await page.goto(JOIN_URL, { waitUntil: "networkidle" });

  // 2. Fill nickname and submit
  const nicknameInput = page.locator("#nickname");
  await nicknameInput.waitFor({ state: "visible", timeout: 30_000 });
  await nicknameInput.fill(nickname);
  await page.locator('button[type="submit"]').click();

  // 3. Wait for redirect to quiz page (URL changes to /quiz/{id})
  await page.waitForURL(/\/quiz\/[a-zA-Z0-9]+/, { timeout: 30_000 });
  log(nickname, "Joined! Waiting in lobby...");

  // 4. Main loop — poll state and react accordingly
  let questionNumber = 0;

  while (true) {
    const state = await waitForState(
      page,
      ["active", "finished"],
      ADMIN_WAIT_TIMEOUT,
    );

    if (state === "timeout") {
      log(nickname, "Timed out waiting for admin. Exiting.");
      break;
    }

    if (state === "finished") {
      log(nickname, "Quiz finished!");
      break;
    }

    // state === "active" — answer buttons are visible
    questionNumber++;
    const buttons = page.locator(ANSWER_BUTTON_SELECTOR);
    const count = await buttons.count();

    if (count === 0) {
      log(nickname, "No answer buttons found, retrying...");
      continue;
    }

    // Random delay to simulate human thinking
    await randomDelay();

    // Re-check buttons are still there (timer may have expired during delay)
    const stillVisible = await buttons.first().isVisible().catch(() => false);
    if (!stillVisible) {
      log(nickname, `Q${questionNumber}: Timer expired before answering`);
    } else {
      const choice = Math.floor(Math.random() * count);
      const chosenButton = buttons.nth(choice);
      const label = await chosenButton.locator("span.flex-1").textContent().catch(() => "?");

      log(nickname, `Q${questionNumber}: Picking answer ${String.fromCharCode(65 + choice)} — "${label}"`);
      await chosenButton.click();
      log(nickname, `Q${questionNumber}: Answered! Waiting for results...`);
    }

    // Wait for results or finished (skip past answered/results states)
    const nextState = await waitForState(
      page,
      ["results", "finished"],
      ADMIN_WAIT_TIMEOUT,
    );

    if (nextState === "finished") {
      log(nickname, "Quiz finished!");
      break;
    }

    if (nextState === "timeout") {
      log(nickname, "Timed out waiting for results. Exiting.");
      break;
    }

    // In results state now — loop back to wait for next question or finish
    log(nickname, `Q${questionNumber}: Results received. Waiting for next question...`);
  }

  // Read final score if visible
  const scoreEl = page.locator("p.text-2xl.font-black");
  if (await scoreEl.isVisible().catch(() => false)) {
    const score = await scoreEl.textContent().catch(() => "?");
    log(nickname, `Final score: ${score}`);
  }

  await page.close();
  log(nickname, "Done.");
}

// ── Test entry point ────────────────────────────────────────────────────────

test.describe("Load players", () => {
  test.skip(!JOIN_URL, "JOIN_URL environment variable is required");

  test("spawn players and participate in quiz", async () => {
    // Very long timeout — the test runs as long as the admin takes
    test.setTimeout(30 * 60_000); // 30 minutes

    console.log(`\n${"═".repeat(60)}`);
    console.log(`  Quiz Load Test — ${PLAYER_COUNT} players`);
    console.log(`  Join URL: ${JOIN_URL.split("#")[0]}`);
    console.log(`${"═".repeat(60)}\n`);

    const browser = await chromium.launch({ headless: true });

    // Create one context per player (isolated sessions)
    const players: Array<{ context: BrowserContext; nickname: string }> = [];

    for (let i = 0; i < PLAYER_COUNT; i++) {
      const context = await browser.newContext();
      const nickname = pickNickname(i);
      players.push({ context, nickname });
    }

    console.log(
      `Players: ${players.map((p) => p.nickname).join(", ")}\n`,
    );

    // Run all players in parallel
    const results = await Promise.allSettled(
      players.map(({ context, nickname }) => runPlayer(context, nickname)),
    );

    // Report
    console.log(`\n${"─".repeat(60)}`);
    console.log("Results:");
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const name = players[i].nickname;
      if (r.status === "fulfilled") {
        console.log(`  ✅ ${name}: completed`);
      } else {
        console.log(`  ❌ ${name}: ${r.reason}`);
      }
    }
    console.log(`${"─".repeat(60)}\n`);

    // Cleanup
    for (const { context } of players) {
      await context.close().catch(() => {});
    }
    await browser.close();
  });
});
