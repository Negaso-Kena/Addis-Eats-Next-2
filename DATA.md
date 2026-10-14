# DATA.md: client-side data in Addis Eats (Day 41)

Library: **SWR**. Every query uses the shared fetcher in `lib/fetcher.js`,
which throws on non-OK responses (with `error.status` and the API's
`{ error }` message), so SWR's `error` state is real.

Server first: the menu, a dish, the checkout confirmation and the first paint
of every page below stay in server components. Only what a server component
cannot cover is a query here.

SWR has no `staleTime`. The equivalent decision is each query's refresh rule below.

## Server and HTTP caching

- `/` and `/menu/[id]` are statically rendered at build time.
- `/menu` uses ISR with `revalidate = 3600`, so a page can be reused for an
  hour before Next.js refreshes it in the background.
- Public `GET /api/dishes` and `GET /api/dishes/[id]` responses send
  `Cache-Control: public, max-age=0, s-maxage=3600,
  stale-while-revalidate=86400`. Query strings (search and page) form distinct
  URL cache keys.
- User/session/order API responses send
  `Cache-Control: private, no-store, max-age=0, must-revalidate`; responses
  containing personal data must not be reused by a browser or shared CDN.

This is route/HTTP and client SWR caching, not a shared persistent database
cache. The dish source is a local JSON file. Orders and sessions remain in
process memory, which is suitable for a single-process demo but not reliable
across serverless instances.

## Queries

### Cart
- **File:** `lib/cart-store.js`
- **Storage:** local storage is partitioned by signed-in user id; signed-out visitors use a separate guest cart
- **Identity changes:** the new account's cart is loaded before it is displayed or persisted, so the previous account's in-memory cart cannot overwrite it
- **Versioning:** `v2` keys intentionally do not reuse earlier cart entries, which may already have been copied across users by the previous account-switch race

### 1. Order status
- **File:** `app/orders/[id]/OrderStatus.jsx`
- **Key:** `/api/orders/${id}`, answered by the session-checked, ownership-scoped route handler (private, no-store)
- **Seed:** the order rendered by `app/orders/[id]/page.js`, passed as `fallbackData` with `revalidateOnMount: false`, so there is no spinner on arrival
- **Refresh rule:** `refreshInterval` of 5 seconds while the order is active; `0` (stop) once it is `Delivered` or `Cancelled`; no refresh while the tab is hidden or offline; focus/reconnect defaults
- **Failure:** the last received status stays on screen with a notice and a retry button; a 401 shows a sign-in link
- **Why:** this is the one piece of data that changes without the person doing anything. Status is still *simulated* (derived from order age on the server), but the browser now really asks the server. Known limit: orders live in one process's memory, so on Vercel a poll can reach a different instance and fail. The UI keeps the last status rather than showing an alarm.

### 2. Menu search
- **File:** `app/menu/SearchBox.jsx`
- **Key:** `/api/dishes?q=${encodeURIComponent(debounced)}`, or `null` when the term is empty
- **Seed:** the server-provided `dishes` prop is filtered locally for the debounced term and passed as `fallbackData`; SWR revalidates the API result behind the immediate list
- **Refresh rule:** no interval; focus/reconnect defaults; input debounced 300 ms; `keepPreviousData: true`
- **Why:** the existing server data avoids a loading spinner while the API revalidates; results depend only on what was typed, debounce stops a request per keystroke, the null key avoids searching for nothing, and `keepPreviousData` stops the list flashing empty between terms.

### 3. Paged dish list
- **File:** `app/menu/browse/PagedDishes.jsx`
- **Key:** `/api/dishes?page=${page}`, where `page` comes from the URL query string
- **Seed:** `fallbackData` from the server, only when the URL's page equals the page the server rendered
- **Refresh rule:** no interval; focus/reconnect defaults; `keepPreviousData: true`
- **Why:** the page number is part of the key so each page has its own cache entry; the page is in the URL so a result can be linked, and the old page stays visible while the next one loads.

## Decisions, in one place

| Decision | Choice | Reason |
|---|---|---|
| Fetcher | one shared `lib/fetcher.js` | one place that turns bad responses into errors |
| Polling | order status only, every 5 s, stops when final | the only data that changes without the user doing anything |
| Debounce | 300 ms | long enough to skip keystrokes, short enough to feel instant |
| `revalidateOnFocus` / `revalidateOnReconnect` | left at SWR defaults | menu and order data can change, and a refetch on focus is cheap; turning them off is for data that never changes |
| Server seed | `fallbackData` per query | no loading state for data the server already had |

## Day 46 — data representation

| Data | Where | Shape | Why |
|---|---|---|---|
| Revenue by neighbourhood | Server (`lib/dashboard-data.js`) | 5 rows: area, orders, revenue | Aggregated before it crosses; charting libraries are client code, so the data must be small. Cancelled orders excluded. |
| Orders per day | Server | 14 rows, zero-filled, grouped by Addis Ababa calendar day | A line answers "are orders growing?". |
| Order table | Server (`app/orders/(list)`) | 8 rows per page | Sort and page are in the URL; a read-only table needs no client JavaScript. |

- Sort keys are whitelisted (`date`, `total`, `status`); anything else falls back to date, newest first. `page` is clamped to the real range.
- Charts: bar axis starts at zero, units named in headings (ETB, orders), colour is never the only key, and each chart has its data as a table beneath it.
- The four states: loading (skeleton the shape of the page), empty (says why and links to the menu), error (`error.js` with retry), loaded.
- Demo data: set `SEED_DEMO_ORDERS=true` to add ten clearly labelled orders (`demo: true`, "Demo customer", no owner, ids `AE-DEMO-NN`). Customers can never open them. They disappear on restart, like every order here.

## Capstone additions

| Data | Mechanism | Refresh rule | Why |
|---|---|---|---|
| Order status on `/orders/[id]` | Server-sent events, falling back to SWR polling | Pushed every 3 s while active; if the stream cannot connect, SWR polls every 5 s; both stop when the order is Delivered or Cancelled | One-directional and frequent: SSE is the simplest mechanism that does the job. WebSockets would add a separate server for nothing. |
| Map | Leaflet, loaded with `dynamic(..., { ssr: false })` | Courier marker moves each second while On the way | Leaflet touches `window` on import, so it can never render on the server |
| Orders CSV | Built in the browser from rows the server already shaped | On click | Hundreds of rows; past a few thousand, stream it from a route handler |

Formatting: every price, date and relative time goes through `lib/format.js`, with the locale (`en-ET`, `en-GB`) and the time zone (`Africa/Addis_Ababa`) named. Money is stored as integer birr.
CSV: values containing a comma, quote or newline are quoted; values beginning with `=`, `+`, `-` or `@` are prefixed with `'` so spreadsheets do not run them as formulas.

