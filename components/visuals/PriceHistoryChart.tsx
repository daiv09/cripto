"use client";

import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PriceHistoryChart({ data }: { data: number[][] }) {
  // Format data for Recharts: [time, open, high, low, close] -> { date, price }
  const chartData = data.map((item) => ({
    date: new Date(item[0]).toLocaleDateString(),
    price: item[4], // Using Close price
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          minTickGap={30}
          fontSize={12}
        />
        <YAxis
          domain={["auto", "auto"]}
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            color: "#f8fafc",
          }}
          formatter={(value: number) => [formatCurrency(value), "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#8b5cf6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
