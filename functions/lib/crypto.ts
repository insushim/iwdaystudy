// Cloudflare Workers crypto utilities
// SHA-256 + salt password hashing, HMAC-SHA256 token signing

// ── Password Hashing ──────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = bufferToHex(salt);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(saltHex + password),
  );
  return `${saltHex}:${bufferToHex(new Uint8Array(hashBuffer))}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (storedHash.includes(":")) {
    const [saltHex, expectedHash] = storedHash.split(":");
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(saltHex + password),
    );
    return bufferToHex(new Uint8Array(hashBuffer)) === expectedHash;
  }
  // Legacy simpleHash fallback
  return storedHash === simpleHashLegacy(password);
}

export function isLegacyHash(storedHash: string): boolean {
  return !storedHash.includes(":");
}

function simpleHashLegacy(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ── Token Signing ─────────────────────────────────────

export async function createToken(
  payload: { id: string; email: string; exp: number },
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const payloadB64 = base64urlEncode(
    encoder.encode(JSON.stringify(payload)),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return `${payloadB64}.${bufferToHex(new Uint8Array(sig))}`;
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<{ id: string; email?: string; exp: number } | null> {
  if (!token.includes(".")) return null; // old unsigned token
  const dotIdx = token.lastIndexOf(".");
  const payloadB64 = token.substring(0, dotIdx);
  const sigHex = token.substring(dotIdx + 1);
  const encoder = new TextEncoder();
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuffer(sigHex),
      encoder.encode(payloadB64),
    );
    if (!valid) return null;
    const json = new TextDecoder().decode(base64urlDecode(payloadB64));
    const data = JSON.parse(json);
    if (!data.id || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────

function bufferToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function base64urlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
