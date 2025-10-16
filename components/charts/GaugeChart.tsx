"use client"

import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend)

export interface GaugeChartProps {
  value: number // 0-100
  options?: any
  className?: string
}

export default function GaugeChart({ value, options, className }: GaugeChartProps) {
  const resolveColor = (c: string) => {
    if (!c) return c
    if (typeof window === "undefined") return c
    if (!c.startsWith("var(")) return c
    const varName = c.slice(4, -1)
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    return resolved || c
  }
  const clamped = Math.max(0, Math.min(100, value))
  const data = {
    labels: ["Score", "Remaining"],
    datasets: [
      {
        data: [clamped, 100 - clamped],
        backgroundColor: [resolveColor("var(--color-secondary-aqua)"), resolveColor("var(--color-background-light)")],
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "70%",
      },
    ],
  }

  const defaultOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    responsive: true,
    maintainAspectRatio: false,
  }

  return (
    <div className={className ?? "h-40 w-full"}>
      <Doughnut data={data as any} options={{ ...defaultOptions, ...options }} />
      <div className="pointer-events-none -mt-16 text-center text-xl font-semibold" style={{ color: resolveColor("var(--color-foreground)") }}>{clamped}</div>
    </div>
  )
}


