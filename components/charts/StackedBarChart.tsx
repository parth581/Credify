"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { useEffect, useMemo, useState } from "react"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export interface StackedBarChartProps {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string
      borderColor?: string
      borderWidth?: number
    }>
  }
  options?: any
  className?: string
}

export default function StackedBarChart({ data, options, className }: StackedBarChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const resolveColor = (c: string) => {
    if (!c) return c
    if (typeof window === "undefined") return c
    if (!c.startsWith("var(")) return c
    const varName = c.slice(4, -1)
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    return resolved || c
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: resolveColor("var(--color-foreground)") } } },
    scales: {
      x: { stacked: true, ticks: { color: resolveColor("var(--muted-foreground)") }, grid: { color: resolveColor("var(--border)") } },
      y: { stacked: true, ticks: { color: resolveColor("var(--muted-foreground)") }, grid: { color: resolveColor("var(--border)") } },
    },
  }

  const getCssVariable = (name: string) => (mounted ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : name)

  const normalized = useMemo(() => ({
    labels: data.labels,
    datasets: data.datasets.map((ds, i) => {
      const defaultBg = i === 0 ? getCssVariable("--color-secondary-aqua") : getCssVariable("--color-accent-yellow")
      const bg = Array.isArray(ds.backgroundColor)
        ? (ds.backgroundColor as string[]).map((c) => (mounted ? resolveColor(c) : c))
        : (ds.backgroundColor
            ? (mounted ? resolveColor(ds.backgroundColor as string) : (ds.backgroundColor as string))
            : defaultBg)
      const border = Array.isArray(ds.borderColor)
        ? (ds.borderColor as string[]).map((c) => (mounted ? resolveColor(c) : c))
        : ((ds.borderColor as string) ?? "transparent")
      return {
        ...ds,
        borderWidth: ds.borderWidth ?? 0,
        backgroundColor: bg,
        borderColor: border,
      }
    }),
  }), [data, mounted])

  return (
    <div className={className ?? "h-56 w-full"}>
      {mounted && <Bar data={normalized} options={{ ...defaultOptions, ...options }} />}
    </div>
  )
}


