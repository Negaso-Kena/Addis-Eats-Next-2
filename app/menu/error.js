"use client";

// Error boundaries in the App Router MUST be client components —
// Next.js requires "use client" here even though nothing else in this
// file needs interactivity; it's how the error boundary itself works.

export default function MenuError({ error, reset }) {
  return (
    <section>
      <h1>Something went wrong loading the menu</h1>
      <p style={{ color: "#721c24" }}>
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          marginTop: "1rem",
          background: "#8b4513",
          color: "#fff",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </section>
  );
}