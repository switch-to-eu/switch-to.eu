export function generateEncryptionKey(): string {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...key));
}

export async function encryptData(
  data: unknown,
  keyBase64: string,
): Promise<string> {
  try {
    const keyBytes = new Uint8Array(
      atob(keyBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["encrypt"],
    );

    const jsonString = JSON.stringify(data);
    const dataBytes = new TextEncoder().encode(jsonString);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      dataBytes,
    );

    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch {
    throw new Error("Failed to encrypt data");
  }
}

export async function decryptData<T>(
  encryptedDataBase64: string,
  keyBase64: string,
): Promise<T> {
  try {
    const keyBytes = new Uint8Array(
      atob(keyBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );

    const combined = new Uint8Array(
      atob(encryptedDataBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encryptedData,
    );

    const jsonString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
  } catch {
    throw new Error("Failed to decrypt data");
  }
}
