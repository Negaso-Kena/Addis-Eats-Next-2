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

### 1. Order status
- **File:** `app/orders/[id]/OrderStatus.jsx`
- **Seed:** the order rendered by `app/orders/[id]/page.js`
- **Refresh rule:** recompute status locally every 5 seconds from the order's creation time; stop once the status is `Delivered`
- **Why:** this demo's status is derived from order age rather than updated by a kitchen. Local calculation avoids polling a process-local order store across Vercel instances.

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
| Polling | order status only | the only data that changes without the user doing anything |
| Debounce | 300 ms | long enough to skip keystrokes, short enough to feel instant |
| `revalidateOnFocus` / `revalidateOnReconnect` | left at SWR defaults | menu and order data can change, and a refetch on focus is cheap; turning them off is for data that never changes |
| Server seed | `fallbackData` per query | no loading state for data the server already had |