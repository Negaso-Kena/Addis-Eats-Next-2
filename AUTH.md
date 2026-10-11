# Authentication, authorization, and ownership

This is a teaching demo with in-memory users, sessions, and orders. Demo
credentials are not production credentials.

| Role | Phone | Password |
| --- | --- | --- |
| Customer | `0911223344` | `customer123` |
| Ownership-test customer | `0911000000` | `customer456` |
| Staff | `0999887766` | `staff123` |

## Private routes and actions

| Surface | Middleware | Server/page check | Data/action check |
| --- | --- | --- | --- |
| `/checkout` | Requires a `session` cookie | `app/checkout/page.js` calls `getSession()` and redirects if invalid | Confirmation uses `getOrderForUser(orderId, user.id, user.role === "staff")`; `placeOrder` independently requires `getSession()` and assigns the owner from `user.id` |
| `/orders` | Requires a `session` cookie | `app/orders/page.js` calls `getSession()` | Customer list uses `getOrdersByUserId(user.id)`; staff list is intentionally all orders |
| `/orders/[id]` | Requires a `session` cookie | `app/orders/[id]/page.js` calls `getSession()` | `getOrderForUser(id, user.id, user.role === "staff")` returns only an owned order, unless staff |
| `/kitchen` | Requires a `session` cookie | `app/kitchen/page.js` requires a valid session with `role === "staff"` | There are no kitchen mutation actions in this app. |
| `GET /api/orders` | Not run on API routes | Handler calls `getSession()` | Customer list is filtered by `user.id`; staff may see all. |
| `POST /api/orders` | Not run on API routes | Handler calls `getSession()` | Validates the body, recomputes prices, and uses `user.id`; it never accepts an owner id. |
| `GET /api/orders/[id]` | Not run on API routes | Handler calls `getSession()` | `getOrderForUser(id, user.id, user.role === "staff")`; unauthorized and missing orders both return 404. |
| `signIn` server action | Public by design | Verifies demo credentials | Creates a session and validates `next` as a same-origin relative URL. |
| `signOut` server action | Public by design; signing out is safe for any caller | Reads the current cookie | Deletes the corresponding in-memory session if present and expires the cookie. |

Middleware at `middleware.js` is a navigation gate, not authentication:
it checks only that a cookie exists. The page, action, and API layers verify
the session stored by the server. Customer ownership checks are performed in
the store lookup itself, not only after returning an order by id.

The session cookie is set with `httpOnly`, `sameSite: "lax"`, root path, and
a seven-day lifetime; `secure` is enabled in production. Session records
cannot be read by client JavaScript.

## Attack checks

Run these against a running production build. Record the actual response and
the protecting layer when demonstrating them; do not count a hidden UI link as
authorization.

| Attack | Expected result | Protection to point to |
| --- | --- | --- |
| Sign out, then request `GET /api/orders` or `GET /api/orders/AE-2048` | `401 Not signed in` | `getSession()` checks in the API handlers |
| Sign in as a customer, then request another customer's order ID through `/orders/[id]`, `/api/orders/[id]`, or `/checkout?order=<id>` | 404/no order details | `getOrderForUser` enforces ownership during lookup; checkout never renders another user's confirmation |
| Request `/signin?next=https://example.com` or `/signin?next=//example.com`, then sign in | Redirect to `/` | `getSafeRedirectPath` in `app/auth-actions.js` rejects cross-origin destinations |
| Submit `placeOrder` without a valid session | Action refuses; no order is saved | `getSession()` at the start of `app/actions.js` |
| Sign in as a customer and navigate directly to `/kitchen` | Staff access denied | Role check in `app/kitchen/page.js` |
| Send a forged `userId` in `POST /api/orders` | Saved order owner remains the session user | API handler sets `userId: user.id` after validating input |

For the cross-user check, place an order while signed in as `0911223344`, copy
the resulting `AE-...` id, sign out, sign in as the ownership-test customer,
then request `/orders/<id>`, `/api/orders/<id>`, and
`/checkout?order=<id>`. The detail page must be not-found, the API must return
404, and checkout must not reveal the confirmation. Repeat with the original
customer to confirm that their order remains accessible.

### Local production verification

Verified against `npm start` after a successful Webpack production build:

- Signed-out `GET /api/orders` returned 401; signed-out `/orders` and
  `/kitchen` redirected to sign-in.
- Signing in with an external `next` destination redirected to `/`, not the
  external host.
- An order owned by the first customer returned 404 from the other customer's
  order API and detail page; `/checkout?order=<id>` did not show the order
  confirmation.
- The second customer received an empty order list, and direct `/kitchen`
  navigation displayed the staff-only denial.

The order and session store is process-local, so these records are temporary
and are not retained after restarting the server.

The store is in process memory. It is appropriate only for a local/class demo:
sessions and orders are lost on restart, and multi-instance/serverless
deployments do not share this memory. A real deployed application requires
durable shared session and order storage before claiming reliable deployed
authentication or ownership behavior.
