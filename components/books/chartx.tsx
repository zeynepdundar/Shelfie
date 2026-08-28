import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { Book } from "@/types/book"

import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  ChartTooltip,
} from "@/components/ui/chart"

const MONTHS = [
  { name: "Oca", monthIndex: 0 },
  { name: "Şub", monthIndex: 1 },
  { name: "Mar", monthIndex: 2 },
  { name: "Nis", monthIndex: 3 },
  { name: "May", monthIndex: 4 },
  { name: "Haz", monthIndex: 5 },
  { name: "Tem", monthIndex: 6 },
  { name: "Ağu", monthIndex: 7 },
  { name: "Eyl", monthIndex: 8 },
  { name: "Eki", monthIndex: 9 },
  { name: "Kas", monthIndex: 10 },
  { name: "Ara", monthIndex: 11 },
]

const chartConfig = {
  value: {
    label: "Books Read",
    color: "#f59e0b",
  },
  pages: {
    label: "Number of Pages",
    color: "#3b82f6",
  },
}

function getBookDate(book: Book) {
  const rawDate = book.endDate || book.dateRead || book.dateAdded
  const parsedDate = new Date(rawDate)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function MyChart({ year }: { year: number }) {
  const { books } = useSelector((state: RootState) => state.books)

  const chartData = useMemo(
    () =>
      MONTHS.map((month) => {
        const monthlyBooks = books.filter((book) => {
          if (!book.isCompleted) {
            return false
          }

          const bookDate = getBookDate(book)

          return (
            bookDate !== null &&
            bookDate.getFullYear() === year &&
            bookDate.getMonth() === month.monthIndex
          )
        })

        return {
          name: month.name,
          value: monthlyBooks.length,
          pages: monthlyBooks.reduce((sum, book) => sum + (book.pages || 0), 0),
        }
      }),
    [books, year]
  )

  return (
    <ChartContainer config={chartConfig} className="h-[320px] w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(226,232,240,0.18)" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tick={{ fill: "#e2e8f0", fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => Math.round(value).toString()}
          tick={{ fill: "#e2e8f0", fontSize: 12 }}
        />
        <YAxis
          yAxisId="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => Math.round(value).toString()}
          orientation="right"
          tick={{ fill: "#e2e8f0", fontSize: 12 }}
        />
        <Bar dataKey="value" fill="#f59e0b" yAxisId="left" />
        <Bar dataKey="pages" fill="#3b82f6" yAxisId="right" />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <Legend content={<ChartLegendContent />} verticalAlign="bottom" />
      </BarChart>
    </ChartContainer>
  )
}
