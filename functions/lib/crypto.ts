// Cloudflare Workers crypto utilities
// PBKDF2-SHA-256 password hashing (with SHA-256 + simpleHash legacy fallback for migration)
// HMAC-SHA-256 token signing.

// ── Password Hashing ──────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LEN = 32;
const PBKDF2_SALT_LEN = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(PBKDF2_SALT_LEN);
  crypto.getRandomValues(salt);
  const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LEN);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bufferToHex(salt)}$${bufferToHex(derived)}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (storedHash.startsWith("pbkdf2$")) {
    const parts = storedHash.split("$");
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10);
    const salt = hexToBuffer(parts[2]);
    const expected = hexToBuffer(parts[3]);
    if (!iterations || !salt.length || !expected.length) return false;
    const derived = await pbkdf2(password, salt, iterations, expected.length);
    return constantTimeEqual(derived, expected);
  }
  // Legacy SHA-256 + salt
  if (storedHash.includes(":")) {
    const [saltHex, expectedHash] = storedHash.split(":");
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(saltHex + password),
    );
    return constantTimeHexEqual(
      bufferToHex(new Uint8Array(hashBuffer)),
      expectedHash,
    );
  }
  // Legacy simpleHash fallback
  return constantTimeHexEqual(storedHash, simpleHashLegacy(password));
}

export function isLegacyHash(storedHash: string): boolean {
  return !storedHash.startsWith("pbkdf2$");
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keyLen: number,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    keyLen * 8,
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function constantTimeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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
