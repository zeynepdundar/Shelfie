import { Bar, BarChart, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"

const data = [
  { name: "Ocak", value: 400 },
  { name: "Şubat", value: 300 },
  { name: "Mart", value: 200 },
  { name: "Nisan", value: 278 },
  { name: "Mayıs", value: 189 },
  { name: "Haziran", value: 189 },
  { name: "Temmuz", value: 189 },
  { name: "Ağustos", value: 189 },
  { name: "Eylül", value: 189 },
  { name: "Ekim", value: 189 },
  { name: "Kasım", value: 189 },
  { name: "Aralık", value: 189 },
]

const chartConfig = {
  value: {
    label: "Okunan Kitap Sayısı",
    color: "#f59e0b",
  },
}

export function MyChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <XAxis 
          dataKey="name" 
          label={{ value: "Aylar", position: "bottom", offset: 0 }}
        />
        <YAxis 
          label={{ value: "Kitap Sayısı", angle: -90, position: "insideLeft" }}
        />
        <Bar dataKey="value" fill="#f59e0b" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
