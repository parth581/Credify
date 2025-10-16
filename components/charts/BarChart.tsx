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

export interface BarChartProps {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      borderWidth?: number
    }>
  }
  options?: any
  stacked?: boolean
  className?: string
}

export default function BarChartComp({ data, options, stacked = false, className }: BarChartProps) {
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
    plugins: {
      legend: { display: true, labels: { color: resolveColor("var(--color-foreground)") } },
    },
    scales: stacked
      ? {
          x: {
            stacked: true,
            ticks: { color: resolveColor("var(--muted-foreground)") },
            grid: { color: resolveColor("var(--border)") },
          },
          y: {
            stacked: true,
            ticks: { color: resolveColor("var(--muted-foreground)") },
            grid: { color: resolveColor("var(--border)") },
          },
        }
      : {
          x: {
            stacked: false,
            ticks: { color: resolveColor("var(--muted-foreground)") },
            grid: { color: resolveColor("var(--border)") },
          },
          y: {
            stacked: false,
            ticks: { color: resolveColor("var(--muted-foreground)") },
            grid: { color: resolveColor("var(--border)") },
          },
        },
  }

  const getCssVariable = (name: string) => (mounted ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : name)

  const normalized = useMemo(() => ({
    labels: data.labels,
    datasets: data.datasets.map((ds) => {
      let bg: string | string[]
      if (Array.isArray(ds.backgroundColor)) {
        bg = ds.backgroundColor.map((c) => (mounted ? resolveColor(c as string) : (c as string)))
      } else if (ds.backgroundColor) {
        bg = mounted ? resolveColor(ds.backgroundColor as string) : (ds.backgroundColor as string)
      } else {
        // default: aqua for value>=1, warning for 0 (for EMI status use-case)
        bg = (ds.data as number[]).map((v) => (v >= 1 ? getCssVariable("--color-secondary-aqua") : getCssVariable("--destructive")))
      }

      const border = Array.isArray(ds.borderColor)
        ? (ds.borderColor as string[]).map((c) => (mounted ? resolveColor(c as string) : (c as string)))
        : (ds.borderColor as string) ?? "transparent"

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


