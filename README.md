# Addis Eats — Next.js Foundations Project

Day 35's Addis Eats (React/Vite), rebuilt on Next.js App Router: file-based routing,
nested layouts, a deliberate rendering strategy per route, server components reading
their own data, and real endpoints/actions behind the UI — per the Day 40 brief.

Full reasoning lives in [`STRATEGY.md`](./STRATEGY.md) (rendering strategy, one line
per route) and [`BOUNDARY.md`](./BOUNDARY.md) (server/client boundary, one line per
component).

## Stack

- Next.js 16.3.6 (App Router, Turbopack)
- React 19.2.8
- zod — shared validation schema, used by both the server action and the route handler
- Real Day 35 data: `public/menu-data.json` (18 dishes), `public/images/`

## Routes

| Route         | Strategy                  | Notes |
|---------------|----------------------------|-------|
| `/`           | Static                     | Today's specials from `lib/dishes.js` |
| `/menu`       | ISR, `revalidate = 3600`   | Category filter is client-side state, not `searchParams` — keeps this static/ISR |
| `/menu/[id]`  | Static via params          | `generateStaticParams` prerenders all 18 dishes; `notFound()` on unknown id |
| `/cart`       | Client (static shell)      | `localStorage`-persisted cart, private to the browser tab |
| `/checkout`   | Dynamic                    | Reads `searchParams` for the confirmation/error state after the server action redirects back |

## Endpoints

Our own pages never call these — they read `lib/dishes.js` / `lib/orders-store.js`
directly, or go through the `placeOrder` server action. These exist for callers
outside our own UI.

### `GET /api/dishes`
Returns the full dish list.

curl localhost:3000/api/dishes
→ `200`, JSON array of 18 dishes.

### `GET /api/dishes/[id]`
Single dish by id.

curl -i localhost:3000/api/dishes/1
curl -i localhost:3000/api/dishes/not-a-dish

→ `200` with the dish, or `404` — `{"error":"Dish not found: not-a-dish"}`

### `GET /api/orders`
Requires a signed-in session. Customers receive only their own orders; staff
receive all orders.

### `POST /api/orders`
Validates with the same `orderSchema` (zod) the server action uses. Recomputes
price and delivery fee from trusted server-side data — never trusts a client-
submitted total. Requires a signed-in session and assigns the order to that
session's user rather than trusting a client-supplied user ID. Unauthenticated
requests receive `401`.

### `GET /api/orders/[id]`
Requires a signed-in session. Customers can read only their own orders; staff
can read any order. Unauthenticated requests receive `401`; missing or
unauthorized orders receive `404`.

Invalid:

$body = '{"name":"Almaz","phone":"0912"}'
curl -i -X POST localhost:3000/api/orders -H "Content-Type: application/json" -d $body

The examples below must be sent with an authenticated session cookie;
otherwise the API returns `401`.

→ `422` —
```json
{"error":"Validation failed.","fieldErrors":{"phone":["Enter a valid Ethiopian phone number (e.g. 0912 345 678)."],"area":["Invalid option: expected one of \"bole\"|\"piazza\"|\"cmc\"|\"megenagna\"|\"sarbet\""],"items":["Invalid input: expected array, received undefined"]}}
```

Valid:

$body = '{"name":"Naga","phone":"0912345678","area":"bole","items":[{"id":1,"quantity":2}]}'
curl -i -X POST localhost:3000/api/orders -H "Content-Type: application/json" -d $body

→ `201` — real order object with server-computed `subtotal`, `deliveryFee`, `total`, a generated `id` (`AE-XXXX`), and `status: "Pending"`.

### `placeOrder` (server action, `app/actions.js`)
Bound directly to the checkout `<form action={placeOrder}>` — a real HTML form
post, not a `fetch` call, so it works with JavaScript disabled. Validates with the
same shared schema as the route handler above, recomputes the trusted total
server-side, saves the order, and redirects to `/checkout?order=<id>` on success
or `/checkout?error=1&field=...&message=...` on failure.

## The six failure checks (run on `npm run build && npm run start`)

| Check | Result |
|---|---|
| Throttle to Slow 3G on `/menu` | `app/menu/loading.js` skeleton shows before real content |
| Throw inside `/menu` (temporarily forced dynamic to test at request time, since `/menu` is normally static) | `app/menu/error.js` renders; header/nav from `app/layout.js` stayed visible around it |
| Open `/menu/not-a-dish` | `app/menu/[id]/not-found.js` renders, no crash |
| Post an invalid phone through the real checkout form | Redirects back with the field-specific error shown beside the phone input |
| Disable JavaScript, submit checkout | Order still places — real `<form action={placeOrder}>`, no `fetch` dependency |
| Search the built bundle for secrets | Nothing sensitive found (no env vars/credentials exist in this project yet) |

## Build output


▲ Next.js 16.3.6 (Turbopack)

Route (app) Revalidate Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/orders
├ ○ /cart
├ ƒ /checkout
├ ○ /menu 1h 1y
└ /menu/[id]
├ ● /menu/1
├ ● /menu/2
├ ● /menu/3
└ ● [+15 more paths]

○ (Static) prerendered as static content
● (SSG) prerendered as static HTML (uses generateStaticParams)
ƒ (Dynamic) server-rendered on demand



Matches [`STRATEGY.md`](./STRATEGY.md) line for line.

## Running locally

```powershell
npm install
npm run build
npm run start
```

Visit `http://localhost:3000`.

## Day 45 capstone walkthrough

This project carries forward the restaurant menu, ordering flow, private
customer orders, staff kitchen view, and Day 44 metadata/social-preview work.
Day 45 documents server-boundary checks and ownership-scoped order lookups,
seeded SWR menu search, and seeded order-status polling. This repository uses
in-memory demo data; it is not production-ready persistent commerce storage.

### Local verification

1. Install the lockfile dependencies with `npm ci`, then create the production
   bundle with `npm run build -- --webpack`.
2. Start the production app with `npm start`. Sign in with the customer or
   staff demo credentials documented in [AUTH.md](./AUTH.md).
3. As a customer, place an order and verify `/orders` and its detail page show
   only that customer's orders. The order page starts from server-rendered
   data and refreshes status every five seconds until `Delivered`.
4. As staff, verify `/kitchen` shows all orders; as a customer, direct
   navigation to `/kitchen` must be denied.
5. Follow the unauthenticated-action, cross-user-ID, open-redirect, and forged
   owner-ID checks in [AUTH.md](./AUTH.md). Verify menu typing is debounced,
   displays the locally seeded results immediately, and then revalidates from
   `/api/dishes`.
6. Check `sitemap.xml`, `robots.txt`, page metadata, canonical URLs, Open
   Graph images, and dish JSON-LD on the public pages.
7. Review the measurable Day 45 targets and missing evidence in
   [PERF.md](./PERF.md). Run matched Lighthouse tests against the deployed
   production URL; localhost and soft-navigation readings are not deployment
   evidence.

### Deployment checklist

- [ ] Configure a production host and record the real public URL here.
- [ ] Replace the in-memory demo session/order store with durable shared
  storage before using the app across restarts or multiple instances.
- [ ] Set production environment variables and serve only over HTTPS.
- [ ] Verify sign-in, customer/staff authorization, and order ownership against
  the deployed instance.
- [ ] Validate deployed canonical and social-preview URLs with a crawler or
  preview debugger.
- [ ] Record deployed homepage and `/menu` Lighthouse results and verify every
  budget in [PERF.md](./PERF.md).

**Deployment status:** Not deployed as part of this change. No public URL or
deployed verification is claimed.

## Day 44: metadata and discoverability

- The root layout sets `https://addiseats.et` as `metadataBase` and applies
  the `%s · Addis Eats` title template.
- Public pages have route-specific descriptions and canonical URLs. Dish page
  titles, descriptions, canonical URLs, Open Graph previews, and `MenuItem`
  JSON-LD are derived from the same `public/menu-data.json` record rendered
  on the page.
- `app/opengraph-image.js` generates the site-wide 1200 × 630 share image;
  `app/menu/[id]/opengraph-image.js` generates a matching dish-specific image.
- `/sitemap.xml` includes the home page, public menu pages, and dish records.
  `/robots.txt` points to the sitemap and disallows API and account/order
  routes. Cart, checkout, sign-in, kitchen, and order pages are marked
  `noindex`.
- `/menu/browse?page=N` uses `/menu/browse` as its canonical URL. Sign-in and
  checkout query parameters likewise canonicalize to their base routes.

### SEO verification

After `npm run build` and `npm run start`, check these rendered responses:

1. View source on `/`, `/menu`, `/menu/browse?page=2`, and two different
   `/menu/[id]` pages. Check that each title and description is distinct,
   canonical URLs and `og:image` values are absolute, and the two dish pages
   have different generated preview image URLs.
2. Check the generated dish images at `/menu/1/opengraph-image` and
   `/menu/2/opengraph-image`. They should render at 1200 × 630 and show the
   matching dish name and ETB price.
3. Parse the `application/ld+json` script on a dish page and compare its name,
   numeric `offers.price`, and `offers.priceCurrency` with the visible heading
   and price (`ETB`).
4. Open `/sitemap.xml`: it should contain the home/menu/dish URLs and no
   `/cart`, `/checkout`, `/orders`, `/kitchen`, `/signin`, or `/api/` entries.
   Open `/robots.txt` and check its disallow rules and sitemap URL.
5. Check `/cart`, `/checkout`, `/signin`, `/orders`, and `/kitchen` source for
   `noindex`; confirm normal sign-in, checkout, and staff access still work.


## Day 41: live data with SWR

See `DATA.md` for every query, its key and its refresh rule.

### What the network tab shows

- **Typing "tibs" quickly in the menu search: 1 request (/api/dishes?q=tibs), not 4. The 300 ms debounce waits until typing stops.
- **Typing "tib", pausing, then adding "s": 2 requests (q=tib, then q=tibs). The list ended on the "tibs" result.
- **Clearing the search box:** no request; the full menu returns.
- **Order status page:** one request to `/api/orders/AE-xxxx` about every 5 s; they stop once the status is `Delivered`.
- **Changing page in `/menu/browse`:** one request to `/api/dishes?page=N` and no document request; the old page stays on screen (dimmed, "updating…") until the new one arrives.
- **First load of an order page / page 1:** no spinner; the data is already in the server-rendered HTML (view source to confirm).