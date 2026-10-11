import { ImageResponse } from "next/og";

export const alt = "Addis Eats — Ethiopian food delivered across Addis Ababa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        color: "#fff8f0",
        background:
          "linear-gradient(135deg, #4c2419 0%, #8b4513 58%, #c16b36 100%)",
      }}
    >
      <div style={{ fontSize: 30, letterSpacing: 8 }}>ADDIS EATS</div>
      <div style={{ marginTop: 28, fontSize: 76, fontWeight: 700 }}>
        Ethiopian food,
      </div>
      <div style={{ fontSize: 76, fontWeight: 700 }}>delivered warm.</div>
      <div style={{ marginTop: 32, fontSize: 32 }}>
        Fresh favourites across Addis Ababa
      </div>
    </div>,
    size
  );
}
