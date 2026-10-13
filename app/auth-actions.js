"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  findUserByPhone,
  createSession,
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
    return { user: null, redirectTo: `/signin?${params.toString()}` };
  }

  try {
    const sessionId = createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error) {
    console.error("Failed to create the sign-in session.", error);
    return {
      user: null,
      errorCode:
        error instanceof Error && error.message.startsWith("SESSION_SECRET")
          ? "session_configuration"
          : "server",
    };
  }

  return {
    user: { name: user.name, role: user.role },
    redirectTo: getSafeRedirectPath(nextRaw),
  };
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
 * Sign out by expiring the signed session cookie.
 */
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // expire immediately
    path: "/",
  });

  redirect("/");
}