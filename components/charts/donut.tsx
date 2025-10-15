"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

type DonutProps = {
  data: { name: string; value: number; color: string }[]
}

export function DonutChart({ data }: DonutProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
