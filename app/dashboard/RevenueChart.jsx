"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { etb } from "@/lib/format";
import styles from "./page.module.css";

// A client leaf: charts measure the DOM to size themselves. It receives five
// small, plain rows from the server page — never the raw orders.
export default function RevenueChart({ data }) {
  return (
    // The wrapper has a real height. A percentage of nothing is nothing.
    <div className={styles.chartBox}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="area" />
          {/* Bars start at zero: the length of a bar is the value. */}
          <YAxis
            domain={[0, "auto"]}
            tickFormatter={(v) => etb.format(v)}
            width={90}
          />
          <Tooltip formatter={(v) => [etb.format(v), "Revenue"]} />
          <Bar dataKey="revenue" name="Revenue" fill="var(--color-accent)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
