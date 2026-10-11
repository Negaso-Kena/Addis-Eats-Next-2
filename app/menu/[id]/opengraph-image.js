import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDishById } from "@/lib/dishes";

export const alt = "Addis Eats dish menu item";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }) {
  const { id } = await params;
  const dish = getDishById(id);

  if (!dish) notFound();

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
      <span style={{ fontSize: 30, letterSpacing: 8 }}>ADDIS EATS · MENU</span>
      <div
        style={{
          display: "flex",
          marginTop: 35,
          maxWidth: 1040,
          fontSize: 76,
          fontWeight: 700,
        }}
      >
        {dish.name}
      </div>
      <span style={{ marginTop: 34, fontSize: 42 }}>
        {dish.price.toLocaleString("en-US")} ETB
      </span>
      <span style={{ marginTop: 18, fontSize: 28 }}>
        Delivered across Addis Ababa
      </span>
    </div>,
    size
  );
}
