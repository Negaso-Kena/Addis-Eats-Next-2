import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import USERS from "./demo-users.json";

// Demo users only — public course accounts, never real customers.
// Passwords are stored as bcrypt hashes (see scripts/setup-demo-users.mjs);
// the plaintext is never in the source or the bundle.
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const DEVELOPMENT_SECRET = "addis-eats-local-development-secret-not-for-production";

function getSigningSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) {
    if (Buffer.byteLength(secret, "utf8") < 32) {
      throw new Error("SESSION_SECRET must be at least 32 bytes long.");
    }
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }

  return DEVELOPMENT_SECRET;
}

function sign(value) {
  return createHmac("sha256", getSigningSecret())
    .update(value)
    .digest("base64url");
}

export function findUserByPhone(phone) {
  return USERS.find((user) => user.phone === phone) ?? null;
}

// Returns the user only when phone AND password match. Always runs a
// comparison so a wrong phone number is not faster than a wrong password.
const DUMMY_HASH = USERS[0].passwordHash;
export async function verifyCredentials(phone, password) {
  const user = findUserByPhone(phone);
  const ok = await compare(password, user ? user.passwordHash : DUMMY_HASH);
  return user && ok ? user : null;
}

export function createSession(userId) {
  if (!getUserById(userId)) {
    throw new Error("Cannot create a session for an unknown user.");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      userId,
      issuedAt,
      expiresAt: issuedAt + SESSION_TTL_SECONDS,
    }),
  ).toString("base64url");
  const content = `v1.${payload}`;

  return `${content}.${sign(content)}`;
}

export function getUserById(id) {
  return USERS.find((user) => user.id === id) ?? null;
}

function getSessionUser(token) {
  const [version, encodedPayload, signature, ...extra] = token.split(".");
  if (
    version !== "v1" ||
    !encodedPayload ||
    !signature ||
    extra.length > 0 ||
    !/^[A-Za-z0-9_-]+$/.test(encodedPayload) ||
    !/^[A-Za-z0-9_-]+$/.test(signature)
  ) {
    return null;
  }

  const content = `${version}.${encodedPayload}`;
  const expectedSignature = Buffer.from(sign(content), "base64url");
  const receivedSignature = Buffer.from(signature, "base64url");
  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    payload?.version !== 1 ||
    typeof payload.userId !== "string" ||
    !Number.isInteger(payload.issuedAt) ||
    !Number.isInteger(payload.expiresAt) ||
    payload.issuedAt > now ||
    payload.expiresAt <= now ||
    payload.expiresAt - payload.issuedAt > SESSION_TTL_SECONDS
  ) {
    return null;
  }

  const user = getUserById(payload.userId);
  return user ? { id: user.id, name: user.name, role: user.role } : null;
}

/**
 * Read and verify the signed session cookie, returning only public user data.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  return getSessionUser(token);
}
