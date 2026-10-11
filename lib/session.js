import { cookies } from "next/headers";

// Demo users only — never real production data.
// Password is stored as plain text here purely for the teaching project.
// In real apps you would store a bcrypt/argon2 hash.
const USERS = [
  {
    id: "usr_customer",
    name: "Naga",
    phone: "0911223344",
    password: "customer123",
    role: "customer",
  },
  {
    id: "usr_customer_test",
    name: "Test Customer",
    phone: "0911000000",
    password: "customer456",
    role: "customer",
  },
  {
    id: "usr_staff",
    name: "Kitchen Staff",
    phone: "0999887766",
    password: "staff123",
    role: "staff",
  },
];

// Shared across the whole process (same pattern as orders-store)
const g = globalThis;
g.__addisEatsSessions ??= new Map(); // sessionId → { userId, createdAt }
const sessions = g.__addisEatsSessions;

export function findUserByPhone(phone) {
  return USERS.find((u) => u.phone === phone) ?? null;
}

export function createSession(userId) {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    userId,
    createdAt: Date.now(),
  });
  return sessionId;
}

export function destroySession(sessionId) {
  sessions.delete(sessionId);
}

export function getUserById(id) {
  return USERS.find((u) => u.id === id) ?? null;
}

/**
 * Read the session cookie and return the full user object, or null.
 * This is the single helper used by pages, layouts, actions and handlers.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  const user = getUserById(session.userId);
  return user ?? null;
}