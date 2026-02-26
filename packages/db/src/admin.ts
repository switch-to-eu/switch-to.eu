import { randomBytes, timingSafeEqual, createHash } from "crypto";

/** Generate a cryptographically random admin token */
export function generateAdminToken(): string {
  return randomBytes(48).toString("base64url");
}

/** Hash an admin token for storage (never store plain text) */
export function hashAdminToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time comparison of admin tokens */
export function verifyAdminToken(inputToken: string, storedHash: string): boolean {
  const inputHash = hashAdminToken(inputToken);
  if (inputHash.length !== storedHash.length) return false;
  return timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
}

/** Generate an admin URL with token and encryption key in the hash fragment */
export function generateAdminUrl(
  basePath: string,
  id: string,
  token: string,
  encryptionKey: string,
): string {
  return `${basePath}/${id}/admin#token=${token}&key=${encryptionKey}`;
}

/** Parse admin token and encryption key from URL fragment (e.g. #token=xxx&key=yyy) */
export function parseAdminFragment(hash: string): {
  token: string;
  key: string;
} {
  const fragment = hash.startsWith("#") ? hash.substring(1) : hash;
  const params = new URLSearchParams(fragment);
  return {
    token: params.get("token") ?? "",
    key: params.get("key") ?? "",
  };
}
