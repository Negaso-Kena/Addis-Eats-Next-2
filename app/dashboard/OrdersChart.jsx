"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./page.module.css";

export default function OrdersChart({ data }) {
  return (
    <div className={styles.chartBox}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" interval="preserveStartEnd" minTickGap={16} />
          <YAxis allowDecimals={false} width={40} />
          <Tooltip formatter={(v) => [v, "Orders"]} />
          <Line
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
