export function generateAdminUrl(
  groupId: string,
  token: string,
  encryptionKey: string,
): string {
  return `${window.location.origin}/group/${groupId}/admin#token=${token}&key=${encryptionKey}`;
}

/** Parse admin token and encryption key from URL fragment */
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
