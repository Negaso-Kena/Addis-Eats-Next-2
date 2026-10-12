"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

// Shared across every component that calls useSession(), so KitchenLink
// and AuthStatus read one consistent value instead of two independent,
// possibly-out-of-sync fetches.
let currentUser = undefined; // undefined = not fetched yet, null = signed out, object = signed in
let inFlight = null;
let requestVersion = 0;
let lastRefreshPath = null;
const listeners = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export async function refetchSession({ force = false, path } = {}) {
  if (path && path === lastRefreshPath) {
    return inFlight ?? Promise.resolve(currentUser);
  }
  if (path) lastRefreshPath = path;
  if (inFlight && !force) return inFlight;

  const version = ++requestVersion;
  let request;
  request = fetch("/api/session", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Session request failed with HTTP ${res.status}.`);
      }
      return res.json();
    })
    .then((data) => {
      if (!data || !("user" in data)) {
        throw new Error("Session response did not include a user field.");
      }
      const user = data.user;
      if (
        user !== null &&
        (typeof user?.name !== "string" || typeof user?.role !== "string")
      ) {
        throw new Error("Session response contained an invalid user.");
      }
      if (version === requestVersion) {
        currentUser = user;
        notify();
      }
      return user;
    })
    .catch((error) => {
      if (version === requestVersion) {
        currentUser = undefined;
        notify();
        console.error("Failed to refresh the current session.", error);
      }
      return undefined;
    })
    .finally(() => {
      if (inFlight === request) inFlight = null;
    });
  inFlight = request;
  return request;
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
    // Force a fresh request after navigation so a pre-login in-flight request
    // cannot leave the shared header stuck in its signed-out state.
    refetchSession({ force: true, path: pathname });
  }, [pathname]);

  return user;
}