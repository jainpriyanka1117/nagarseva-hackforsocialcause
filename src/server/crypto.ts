import { SignJWT, jwtVerify } from "jose";

let cachedKey: CryptoKey | null = null;

async function getSecretKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const secret = process.env["AUTH_SECRET"] ?? "nagarseva-dev-secret-key-32-chars-long!";
  const enc = new TextEncoder();
  cachedKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return cachedKey;
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = "nagarseva_salt_";
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password + salt),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 10000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export type AuthPayload = {
  userId: string;
  email: string;
  name: string;
  role: "citizen" | "officer" | "admin";
  ward?: string | undefined;
};

export async function createToken(payload: AuthPayload): Promise<string> {
  const key = await getSecretKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const key = await getSecretKey();
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}
