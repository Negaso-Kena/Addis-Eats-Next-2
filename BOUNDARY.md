# Server / Client Boundary — Addis Eats (Next.js)

One line per component, per the Day 40 brief (Part 2 §3). Client components: 8 before Day 46 (see the Day 46 additions below).

| Component | Side | Why |
|---|---|---|
| `app/layout.js` | server | Root shell; renders the header/nav and passes `children` in. Wraps `Providers` but is not itself a client component. |
| `Providers` | client | Wraps `CartProvider` — context needs client state (`useReducer`). |
| `app/page.js` | server | Reads today's specials from `lib/dishes.js` directly; no interactivity. |
| `app/menu/layout.js` | server | Trivial shell (`<div>{children}</div>`) — the category filter moved into the page itself, not the layout (see STRATEGY.md's "changed my mind" note). |
| `app/menu/page.js` | server | Awaits dish data via `getAvailableDishes()`; renders `CategoryBar` as a child. |
| `CategoryBar` | client | Holds the active-category selection in local `useState` and filters the dish list in the browser — deliberately not URL/`searchParams`-driven, so `/menu` stays static/ISR. |
| `DishList` | server | Markup only — maps dishes to `DishCard`. |
| `DishCard` | server | Markup only; renders `AddToCartButton` as a child (a plain serializable `dish` object crosses the boundary as a prop, not a function). |
| `AddToCartButton` | client | `onClick`, writes to the cart context. |
| `app/menu/[id]/page.js` | server | `generateStaticParams` + `notFound()`; awaits `params` (Next 16 async params). |
| `app/cart/page.js` | server | Thin shell; renders `CartView` as the only child. |
| `CartView` | client | Reads the cart context, renders lines/total/quantity controls, calls `increment`/`decrement`/`removeItem`/`clear`. |
| `CartBadge` | client | Reads cart `count` from context for the header nav link. |
| `lib/cart-store.js` (`CartProvider`) | client | Holds cart state in `useReducer`; hydrates from `localStorage` in a `useEffect` after mount (never during server render, to avoid a hydration mismatch) and persists on every change thereafter. |
| `app/checkout/page.js` | server | Awaits `searchParams`, looks up the order via `getOrderById`, and renders either the confirmation, an error-annotated form, or the form — no client state of its own. |
| `CheckoutForm` | client | Reads cart items from context to serialize into a hidden field and to show the running subtotal; the form itself submits via `<form action={placeOrder}>`, a direct binding to the server action rather than a `fetch` call. |
| `app/actions.js` (`placeOrder`) | server action | `"use server"`. Validates with the shared `orderSchema` (zod), re-looks-up every dish server-side to recompute price/delivery total from trusted data (never trusts the client-submitted total), saves the order, and redirects — this is where authorisation/trust checks live, not in the component that renders the submit button. |
| `app/api/dishes/route.js` | route handler | Lists all dishes — exists for callers outside our own UI (curl, a future client); our own pages never call this, they use `lib/dishes.js` directly. |
| `app/api/dishes/[id]/route.js` | route handler | Single dish by id, `404` on unknown id — the brief's own required curl check. |
| `app/api/orders/route.js` | route handler | `GET` lists orders, `POST` validates with the same `orderSchema` used by `placeOrder` and returns `422` with `fieldErrors` on failure — the "one schema enforced in two places" requirement. |
| `lib/dishes.js` | server-only module | `fs.readFileSync`, never imported by a client component. |
| `lib/validation.js` | shared (imported by both a server action and a route handler) | The single `orderSchema` — one source of truth for validation rules, ported from Day 35's `checkout/validate.js`. |
| `lib/delivery.js` | shared | Delivery area/fee/ETA table, ported from Day 35's `deliveryEstimate.js`. |
| `lib/orders-store.js` | server-only module | In-memory order storage; not imported by any client component. |

### Day 46 additions

| Component | Side | Why |
|---|---|---|
| `app/dashboard/page.js` | server | Staff check, then `summarise(getAllOrders())` so only small summary rows cross the boundary. Also renders the same numbers as tables beneath each chart. |
| `RevenueChart`, `OrdersChart` | client | Recharts measures the DOM to size itself. The only client code on the dashboard; each receives plain serialisable arrays. |
| `app/orders/(list)/page.js` | server | Session, scoped query, `parseSort` (whitelisted from the URL), sort, paginate. |
| `OrderTable`, `Pager` | server | Real table markup and real links: no state, no handlers, no JavaScript shipped. |
| `loading.js`, `error.js` (dashboard and orders list) | server / client | Skeleton shaped like the content; the error boundary must be a client component. |

Client components are now 10.

## Composition notes

`Providers` wraps the entire app and receives server-rendered `children` (the header, `main`, everything) — the one place a client component wraps substantial server content, and it's built to accept `children` from the start rather than needing a later refactor.

`app/checkout/page.js` → `CheckoutForm` is the same pattern as `app/cart/page.js` → `CartView`: a server page that resolves request-scoped data (here, `searchParams`) and hands off all interactivity to exactly one client leaf.

### Capstone additions

| Component | Side | Why |
|---|---|---|
| `OrderStatus`, `MapPanel`, `DeliveryMap` | client | `EventSource`, SWR and Leaflet all need the browser |
| `ExportButton` | client | Builds a Blob and clicks a link |
| `ClearCartOnConfirm` | client | The cart lives in `localStorage`; it must be emptied once the order is placed |
| `CheckoutForm` submit button | client | `useFormStatus` disables it while the action is pending |

Every one of these is a leaf. Pages, tables, charts' data and the order lookup stay on the server.

