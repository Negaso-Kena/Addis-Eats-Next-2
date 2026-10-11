# Rendering Strategy — Addis Eats (Next.js)

One line of reasoning per route, per the Day 40 brief (Part 2 §2).

| Route         | Strategy              | Why |
|---------------|------------------------|-----|

| `/`           | Static                 | Nobody in particular is asking; today's specials are the same for every visitor until the next deploy. |

| `/menu`       | ISR, `revalidate = 3600` | Dishes change a few times a day, so an hour of staleness is fine. The category filter lives client-side in `CategoryBar` rather than in `searchParams`, so the route itself never reads a request-time value and stays static/ISR instead of collapsing to dynamic. |

| `/menu/[id]`  | Static via params      | We know every dish id at build time (`getDishes()` reads the local JSON), so `generateStaticParams` prerenders all 18 pages; `notFound()` handles an unknown id without a crash. |

| `/cart`       | Client (static shell)  | The route itself has no server data dependency — it renders one client component (`CartView`) that hydrates entirely from `localStorage` after mount. Cart contents are private to one browser tab and never touch the server until checkout, so there's nothing for the server to render here. |

| `/checkout`   | Dynamic                | Reads `searchParams` (`?order=`, `?error=`, `?field=`, `?message=`) to decide whether to show the form, a validation error, or the order confirmation after `placeOrder` redirects back to this same route. A real `searchParams` read at request time is the brief's own stated trigger for dynamic — this wasn't forced with `export const dynamic`, it's a direct consequence of how the confirmation/error flow was designed. |

## Route I changed my mind about

`/checkout` was originally going to be a plain static form with a client-side `fetch` to `/api/orders` on submit — the more obvious approach. Writing the reasoning down (per the brief's own advice: "writing the sentence usually changes the answer for at least one route") surfaced the problem: a `fetch`-based submit fails the "disable JavaScript, submit" check outright. Switching to `<form action={placeOrder}>` — a real HTML form bound directly to a server action — meant the confirmation/error state now has to live in the URL instead of client state, which is what made the route genuinely dynamic rather than static-with-a-client-effect.

## Verifying against the build output

Route (app)             Revalidate    Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/orders
├ ○ /cart
├ ƒ /checkout  
├ ○ /menu                   1h           1y
└ /menu/[id] 
├ ● /menu/1 … /menu/18


`○ static · ● prerendered from params · ƒ dynamic` — matches every line above.


Matches [`STRATEGY.md`](./STRATEGY.md) line for line.

## Running locally

```powershell
npm install
npm run build
npm run start
```

Visit `http://localhost:3000`.