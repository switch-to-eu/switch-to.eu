export async function generateEncryptionKey(): Promise<string> {
  // Generate a random 256-bit key for AES-GCM
  const key = crypto.getRandomValues(new Uint8Array(32));

  // Convert to base64 for easy transmission
  return btoa(String.fromCharCode(...key));
}

export async function encryptData(
  data: unknown,
  keyBase64: string,
): Promise<string> {
  try {
    // Convert base64 key back to bytes
    const keyBytes = new Uint8Array(
      atob(keyBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    // Import the key for use with WebCrypto API
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["encrypt"],
    );

    // Convert data to JSON string then to bytes
    const jsonString = JSON.stringify(data);
    const dataBytes = new TextEncoder().encode(jsonString);

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      dataBytes,
    );

    // Combine IV + encrypted data and encode as base64
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

export async function decryptData<T>(
  encryptedDataBase64: string,
  keyBase64: string,
): Promise<T> {
  try {
    // Convert base64 key back to bytes
    const keyBytes = new Uint8Array(
      atob(keyBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    // Import the key for use with WebCrypto API
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );

    // Convert base64 encrypted data back to bytes
    const combined = new Uint8Array(
      atob(encryptedDataBase64)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    // Extract IV (first 12 bytes) and encrypted data (rest)
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      encryptedData,
    );

    // Convert bytes back to JSON string then parse
    const jsonString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}
