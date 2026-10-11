// One fetcher for every SWR query in the app.
// fetch() does not reject on 404/500, so we throw ourselves —
// otherwise SWR would treat an error body as successful data.
export async function fetcher(url) {
  const res = await fetch(url);

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;

    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // No JSON body — keep the generic message.
    }

    const error = new Error(message);
    error.status = res.status; // lets a component tell 404 from 500 later
    throw error;
  }

  return res.json();
}