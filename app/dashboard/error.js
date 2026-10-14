"use client";

// Error boundaries must be client components.
export default function DashboardError({ error, reset }) {
  return (
    <section role="alert">
      <h1>The dashboard could not load</h1>
      <p>{error?.message || "Something went wrong while reading the orders."}</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </section>
  );
}
