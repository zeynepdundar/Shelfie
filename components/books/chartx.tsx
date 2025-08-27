import { useEffect, useState } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"

import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"

// Initialize chart data with 0 values for all months
const initializeChartData = () => [
  { name: "January", value: 0, pages: 0 },
  { name: "February", value: 0, pages: 0 },
  { name: "March", value: 0, pages: 0 },
  { name: "April", value: 0, pages: 0 },
  { name: "May", value: 0, pages: 0 },
  { name: "June", value: 0, pages: 0 },
  { name: "July", value: 0, pages: 0 },
  { name: "August", value: 0, pages: 0 },
  { name: "September", value: 0, pages: 0 },
  { name: "October", value: 0, pages: 0 },
  { name: "November", value: 0, pages: 0 },
  { name: "December", value: 0, pages: 0 },
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

export function MyChart() {
  const [chartData, setChartData] = useState(initializeChartData())
  const { books } = useSelector((state: RootState) => state.books)

  useEffect(() => {
    if (books.length > 0) {
      // Create a copy of initial data
      const updatedData = initializeChartData()
      
      // Count books completed in each month and sum pages
      books.forEach(book => {
        if (book.isCompleted && book.endDate) {
          const endDate = new Date(book.endDate)
          const monthIndex = endDate.getMonth()
          updatedData[monthIndex].value += 1
          updatedData[monthIndex].pages = (updatedData[monthIndex].pages || 0) + book.pages
        }
      })
      
      setChartData(updatedData)
    }
  }, [books])

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={chartData}>
        <XAxis 
          dataKey="name" 
          label={{ value: "Months", position: "bottom", offset: 0 }}
        />
        <YAxis 
          yAxisId="left"
          label={{ value: "Book Read", angle: -90, position: "insideLeft" }}
          tickFormatter={(value) => Math.round(value).toString()}
        />
        <YAxis 
          yAxisId="right"
          label={{ value: "Number of Pages", angle: -90, position: "insideRight" }}
          tickFormatter={(value) => Math.round(value).toString()}
          orientation="right"
        />
        <Bar dataKey="value" fill="#f59e0b" yAxisId="left" />
        <Bar dataKey="pages" fill="#3b82f6" yAxisId="right" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
