"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface ChartData {
  name: string
  value: number
}

export function BarChart({ data }: { data: ChartData[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart<"bar"> | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: "Value",
            data: data.map((item) => item.value),
            backgroundColor: "#1e40af",
            borderColor: "#1e40af",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} height="250" />
}

export function PieChart({ data }: { data: ChartData[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart<"pie"> | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            data: data.map((item) => item.value),
            backgroundColor: [
              "#dc2626", // red
              "#1e40af", // blue
              "#9333ea", // purple
              "#0891b2", // cyan
              "#eab308", // yellow
              "#94a3b8", // slate
            ],
            borderWidth: 1,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} height="250" />
}

