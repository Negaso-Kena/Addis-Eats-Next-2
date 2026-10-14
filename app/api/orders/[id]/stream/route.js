import { getSession } from "@/lib/session";
import { getOrderForUser } from "@/lib/orders-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FINAL = ["Delivered", "Cancelled"];
const TICK_MS = 3000;
const MAX_LIFETIME_MS = 5 * 60 * 1000; // the browser reconnects on its own

function plain(status, error) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

// Server-sent events: an ordinary HTTP response that never ends. The session
// and ownership are checked here, before the stream opens — not assumed from
// the page that opened it.
export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return plain(401, "Not signed in.");

  const isStaff = user.role === "staff";
  const first = getOrderForUser(id, user.id, isStaff);
  if (!first) return plain(404, "Order not found.");

  const encoder = new TextEncoder();
  let timer;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        try {
          controller.close();
        } catch {}
      };
      // The format is strict: "data: " + payload + TWO newlines.
      const send = (order) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(order)}\n\n`));

      send(first);
      if (FINAL.includes(first.status)) return close();

      const startedAt = Date.now();
      timer = setInterval(() => {
        const order = getOrderForUser(id, user.id, isStaff);
        if (!order) return close();
        send(order);
        if (FINAL.includes(order.status) || Date.now() - startedAt > MAX_LIFETIME_MS) {
          close();
        }
      }, TICK_MS);

      // The person navigated away: stop the timer so connections do not pile up.
      request.signal.addEventListener("abort", close);
    },
    cancel() {
      closed = true;
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
