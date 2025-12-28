"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function MarketPerformanceChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(val) => `${val}%`}
        />
        <Tooltip
          cursor={{ fill: "#1e293b", opacity: 0.4 }}
          contentStyle={{
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            color: "#f8fafc",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= 0 ? "#10b981" : "#f43f5e"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
