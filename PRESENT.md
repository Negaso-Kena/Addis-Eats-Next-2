# PRESENT.md — your eight minutes

Open before you sit down: the **live URL** (private window), the repository, and these five files in tabs.

| Tab | File | Be ready to explain |
|---|---|---|
| 1 | `app/orders/(list)/page.js` | **Server component:** why it is not a client component (session, scoped query, sort from the URL, no JavaScript shipped) |
| 2 | `app/orders/[id]/OrderStatus.jsx` | **Client component:** why it has to be (EventSource, SWR, `useFormStatus`) and why the cleanup closes the stream |
| 3 | `app/actions.js` → `cancelOrder` | **Protected action:** both checks inside it: session, then the ownership-scoped lookup |
| 4 | `lib/orders-store.js` → `cancelOrderForUser` | **Data query:** where it runs and why the id from the request can never reach another person's record |
| 5 | `lib/order-service.js` | **Refactor:** the server action and `POST /api/orders` each used to repeat the validation and pricing; now one service does both |

## Minute by minute

| Min | Say / do |
|---|---|
| 0–1 | "Addis Eats is for people in Addis Ababa who want food delivered; kitchen staff run it from a dashboard." No code. |
| 1–3 | **Main flow, live, from the deployed URL.** Sign in as customer `0911223344` / `customer123` → menu → add two dishes → checkout (pick Bole) → confirmation → *Track your order*. Point at the status, the **Live** indicator (SSE) and the courier moving on the map. Open **Network** and show the `stream` request staying open. |
| 3–5 | **One decision.** Suggested: *"Server-sent events instead of WebSockets or polling."* One-directional, ordinary HTTP, reconnects by itself, falls back to SWR polling. Or: *"The ownership check lives inside the write, not in the page."* Show tab 3. |
| 5–6 | **The three attacks, live** (below). |
| 6–7 | **PERF.md:** before, after, and the cause. Use only numbers you measured on the deployed URL. |
| 7–8 | **What you cut** (FUTURE.md): database, payments, real courier GPS, WebSockets. Name the weak spot: orders live in memory. |

## The three attacks

Run these in DevTools → **Console** on the deployed URL. Replace `AE-2048` with a real order id.

1. **Signed out** (private window, not signed in):
   ```js
   await fetch("/api/orders/AE-2048").then((r) => r.status);          // 401
   await fetch("/api/orders/AE-2048/stream").then((r) => r.status);   // 401
   ```
   Refused by `if (!user)` at the top of the handler.
2. **Signed in as someone else.** Place an order as `0911223344`, copy its id, sign out, sign in as `0911000000` / `customer456`:
   ```js
   await fetch("/api/orders/AE-2048").then((r) => r.status);          // 404, not their data
   ```
   Also paste `/orders/AE-2048` into the address bar: not-found page. Refused by the scoped lookup `getOrderForUser`. For cancel, show tab 3: a captured form post for someone else's id throws "Order not found" and the order stays unchanged.
3. **Crafted return link:** open `/signin?next=https://example.com`, sign in. You land on `/`, not on example.com. Refused by `getSafeRedirectPath` in `app/auth-actions.js`.

Also: change the id in `/orders/<id>` to another account's id: refused, never someone else's data.

## Questions you will be asked

| Question | Short honest answer |
|---|---|
| Why is this a client component? | It uses `EventSource`, SWR and `useFormStatus`; those need the browser. Everything around it stays on the server. |
| What happens if I call this action signed out? | It throws at `getSession()`; middleware is only a cheap redirect, not the security check. |
| Why this rendering strategy? | Public pages static or ISR; anything reading the session cookie is dynamic by necessity. See STRATEGY.md. |
| What would you do with another week? | A real database behind `lib/orders-store.js`, Auth.js, and re-measure after compressing the 6 MB image. |
| What was the hardest part? | Be specific and honest: e.g. a missing `SESSION_SECRET` only breaks production, never `npm run dev`. |
| Something you cannot answer | "I don't know; here is how I would find out." Say it once. |

## If something goes wrong

| Problem | Do this |
|---|---|
| Site down | Roll back in Vercel (Deployments → previous → Promote), say so calmly |
| Order not found on the live site | Known limit: in-memory orders on serverless instances. Place a fresh order and track it straight away, or present from `npm run start` |
| Network fails | Present from the local build, explain why |
| A feature fails | Say what should happen and move on |
| Out of time | Skip to the three attacks and the numbers |

Have a short screen recording of the main flow, made yesterday, as a fallback.

## Pre-flight checklist (do not change code after this)

- [ ] `git status` is clean and the deployment matches the last commit
- [ ] No secret in the repository: `git log --all --oneline -- .env.local` prints nothing
- [ ] **Clone test:** clone into a fresh folder, follow the README, it runs
- [ ] `SESSION_SECRET` (and `SEED_DEMO_ORDERS=true` if you want dashboard data) set in Vercel; redeployed
- [ ] Live URL opens in a **private window**; README has the real URL
- [ ] **Keyboard only** (mouse away): Tab, Enter, Escape reach every function
- [ ] **Real phone:** usable, nothing hover-only
- [ ] **New account:** sign in as `0911000000` and visit cart, orders: sensible empty states
- [ ] View source on the deployed `/menu/1`: absolute `og:image`, one `<h1>`
- [ ] `/sitemap.xml` and `/robots.txt` list real routes and no private ones
- [ ] Lighthouse (mobile, throttled) on the deployed URL; numbers in PERF.md are real
