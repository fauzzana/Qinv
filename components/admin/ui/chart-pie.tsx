"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  available: {
    label: "Available",
    color: "var(--chart-1)",
  },
  in_use: {
    label: "In Use",
    color: "var(--chart-2)",
  },
  maintenance: {
    label: "Maintenance",
    color: "var(--chart-3)",
  },
  un_use: {
    label: "Un Use",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

function getStatusLabel(status: number) {
  switch (status) {
    case 1: return "available";
    case 2: return "in_use";
    case 3: return "maintenance";
    case 4: return "un_use";
    default: return "other";
  }
}

export function ChartPieAsset({ data }: { data: { status: number; _count: { status: number } }[] }) {
  const chartData = data.map(item => ({
    status: getStatusLabel(item.status),
    visitors: item._count.status,
    fill: `var(--color-${getStatusLabel(item.status)})`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status Asset</CardTitle>
        <CardDescription>Distribusi status aset</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5 pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" label nameKey="status" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ChartPieItem({ data }: { data: { status: number; _count: { status: number } }[] }) {
  const chartData = data.map(item => ({
    status: getStatusLabel(item.status),
    visitors: item._count.status,
    fill: `var(--color-${getStatusLabel(item.status)})`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status Item</CardTitle>
        <CardDescription>Distribusi status item</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5 pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" label nameKey="status" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
