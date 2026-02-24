import { nanoid } from "nanoid";

export function createAdminToken(): string {
  return nanoid(32);
}

export function generateAdminUrl(
  pollId: string,
  token: string,
  encryptionKey: string,
): string {
  return `${window.location.origin}/poll/${pollId}/admin/${token}#${encryptionKey}`;
}
