"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

// Shared across every component that calls useSession(), so KitchenLink
// and AuthStatus read one consistent value instead of two independent,
// possibly-out-of-sync fetches.
let currentUser = undefined; // undefined = not fetched yet, null = signed out, object = signed in
let inFlight = null;
const listeners = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export async function refetchSession() {
  if (!inFlight) {
    inFlight = fetch("/api/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        currentUser = data.user ?? null;
        notify();
        return currentUser;
      })
      .catch(() => {
        currentUser = null;
        notify();
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// Called the instant sign-out is clicked — before the server action even
// runs — so the UI updates immediately and isn't dependent on code that
// might never run if the action internally calls redirect().
export function clearSessionLocally() {
  currentUser = null;
  notify();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentUser;
}

export function useSession() {
  const pathname = usePathname();
  const user = useSyncExternalStore(subscribe, getSnapshot, () => undefined);

  useEffect(() => {
    // Runs on first mount AND on every client-side navigation — the
    // navigation case is what makes sign-in (redirecting to a new route)
    // pick up the fresh session with no extra wiring needed.
    refetchSession();
  }, [pathname]);

  return user;
}