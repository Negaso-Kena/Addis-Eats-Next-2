"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  findUserByPhone,
  createSession,
  destroySession,
  getSession,
} from "@/lib/session";

/**
 * Sign in with phone + password.
 * Sets an httpOnly, secure, sameSite cookie.
 * Supports the ?next= return URL (validated later).
 */
export async function signIn(formData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/");

  const user = findUserByPhone(phone);

  if (!user || user.password !== password) {
    const params = new URLSearchParams({ error: "1" });
    if (nextRaw && nextRaw !== "/") params.set("next", nextRaw);
    redirect(`/signin?${params.toString()}`);
  }

  const sessionId = createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect(getSafeRedirectPath(nextRaw));
}

function getSafeRedirectPath(value) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  const baseUrl = new URL("http://localhost");
  const destination = new URL(value, baseUrl);
  if (destination.origin !== baseUrl.origin) {
    return "/";
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}

/**
 * Sign out: clear the cookie and remove the session from the store.
 */
export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    destroySession(token);
  }

  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // expire immediately
    path: "/",
  });

  redirect("/");
}