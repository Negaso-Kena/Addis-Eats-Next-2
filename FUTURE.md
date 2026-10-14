# FUTURE.md — what was cut, and why

Cutting is a decision, not an oversight. Nothing below is half-built in the code.

## Cut from the capstone (Could, not Must)

| Item | Why it was cut | What it would take |
|---|---|---|
| A real database | Out of scope for the frontend track; Module 5 adds PostgreSQL, MongoDB and Neo4j | Replace `lib/orders-store.js` (it is the only file that touches storage) |
| Payments (TeleBirr) | Needs a backend and credentials | A route handler for the payment webhook; the order service is already the single write point |
| Real courier tracking | Needs a GPS source | Swap the simulated position in `DeliveryMap.jsx` for coordinates from an API |
| WebSockets | The client only receives; SSE is enough | A separate socket service (serverless hosting cannot hold one open) |
| Registration, password reset, rate limiting | A library (Auth.js) should do this, not hand-rolled code | Adopt Auth.js and remove `lib/session.js` |
| Amharic UI and the Ethiopian calendar | Needs translations and a calendar library (Intl cannot do it) | `next/font/local` for an Amharic typeface; a calendar library |
| Server-side CSV for very large exports | The browser export is fine for hundreds of rows | A streaming route handler |
| Order deduplication across servers | Per-process only today | Move `requestId` checking into the database |

## Known weak spots (be ready to say these out loud)

- Orders reset on restart and are not shared between serverless instances, so the deployed site can show different orders on different requests.
- The 8-hour session cannot be revoked before it expires (no server-side store).
- `beyaynet.png` is about 6 MB at source.
- Next.js 16 renamed `middleware` to `proxy`; this project uses `proxy.js`.

## First things to do next

1. Compress `beyaynet.png` and re-measure with Lighthouse.
2. Add a real store behind `lib/orders-store.js`.
3. Move sign-in to Auth.js.
