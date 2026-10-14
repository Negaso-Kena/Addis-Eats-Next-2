"use client";

export default function OrdersError({ error, reset }) {
  return (
    <section role="alert">
      <h1>Your orders could not load</h1>
      <p>{error?.message || "Something went wrong."}</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </section>
  );
}
