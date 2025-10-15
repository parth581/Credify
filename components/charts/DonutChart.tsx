"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { useEffect, useMemo, useState } from "react"

ChartJS.register(ArcElement, Tooltip, Legend)

export interface DonutChartProps {
  data: {
    labels: string[]
    datasets: Array<{
      data: number[]
      backgroundColor?: string[]
      borderColor?: string[]
      borderWidth?: number
    }>
  }
  options?: any
  className?: string
}

export default function DonutChart({ data, options, className }: DonutChartProps) {
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

  const defaultColors = useMemo(
    () => ["var(--color-primary-blue)", "var(--color-secondary-green)", "var(--color-accent-yellow)"].map((c) => (mounted ? resolveColor(c) : c)),
    [mounted]
  )

  const getCssVariable = (name: string) => (mounted ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : name)

  const normalized = useMemo(() => {
    const fallbackColors = [
      getCssVariable("--color-secondary-green"),
      getCssVariable("--color-neutral-light"),
    ]

    return {
      labels: data.labels,
      datasets: data.datasets.map((ds) => {
        const bg = ds.backgroundColor
          ? (ds.backgroundColor as string[]).map((c) => (mounted ? resolveColor(c) : c))
          : fallbackColors
        const border = ds.borderColor
          ? (ds.borderColor as string[]).map((c) => (mounted ? resolveColor(c) : c))
          : ["transparent", "transparent"]
        return {
          ...ds,
          borderWidth: ds.borderWidth ?? 0,
          backgroundColor: bg,
          borderColor: border,
        }
      }),
    }
  }, [data, mounted])

  const defaultOptions = {
    plugins: {
      legend: { display: false, labels: { color: resolveColor("var(--color-foreground)") } },
      tooltip: { enabled: true },
    },
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: false,
  }

  return (
    <div className={className ?? "h-56 w-full"}>
      {mounted && <Doughnut data={normalized} options={{ ...defaultOptions, ...options }} />}
    </div>
  )
}


