export default function MenuLoading() {
  return (
    <section>
      <h1>Menu</h1>
      <p style={{ color: "#666" }}>Loading dishes…</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 180,
              borderRadius: 8,
              background: "#f0ebe3",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}