"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  XAxis,
  YAxis,
} from "recharts"
import { useSelector } from "react-redux"
import { useTranslations } from "next-intl"

import { RootState } from "@/lib/store"
import { Book } from "@/types/book"
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart"

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

/* Grafik renkleri temadan gelir; yüzey açık/koyu olduğunda kendiliğinden uyar. */
const CHART_ACCENT = "var(--chart-1)"
const CHART_SECOND = "var(--chart-2)"
const CHART_TICK = "var(--sf-chart-tick)"
const CHART_GRID = "var(--sf-chart-grid)"

/** Üzerine gelinmeyen sütunlar soluklaşsın, aktif olan öne çıksın. */
const DIMMED = 0.35

const chartConfig = {
  value: {
    label: "Books Read",
    color: CHART_ACCENT,
  },
  pages: {
    label: "Number of Pages",
    color: CHART_SECOND,
  },
}

function getBookDate(book: Book) {
  const rawDate = book.endDate || book.dateRead || book.dateAdded
  const parsedDate = new Date(rawDate)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function MyChart({ year }: { year: number }) {
  const { books } = useSelector((state: RootState) => state.books)
  const t = useTranslations("overview.chart")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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
          titles: monthlyBooks.map((book) => book.title),
        }
      }),
    [books, year]
  )

  const active = activeIndex === null ? null : chartData[activeIndex]

  return (
    <div>
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          onMouseMove={(state: { activeTooltipIndex?: number }) => {
            const next = state?.activeTooltipIndex
            setActiveIndex(typeof next === "number" ? next : null)
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fill: CHART_TICK, fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => Math.round(value).toString()}
            tick={{ fill: CHART_TICK, fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => Math.round(value).toString()}
            orientation="right"
            tick={{ fill: CHART_TICK, fontSize: 12 }}
          />
          <Bar dataKey="value" yAxisId="left" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`books-${entry.name}`}
                fill={CHART_ACCENT}
                fillOpacity={
                  activeIndex === null || activeIndex === index ? 1 : DIMMED
                }
              />
            ))}
          </Bar>
          <Bar dataKey="pages" yAxisId="right" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`pages-${entry.name}`}
                fill={CHART_SECOND}
                fillOpacity={
                  activeIndex === null || activeIndex === index ? 1 : DIMMED
                }
              />
            ))}
          </Bar>
          <Legend content={<ChartLegendContent />} verticalAlign="bottom" />
        </BarChart>
      </ChartContainer>

      {/* Hover detay şeridi — sadece bir aya gelindiğinde görünür.
          Dış kapsayıcı yüksekliği ayırdığı için grafik zıplamaz. */}
      <div className="mt-3 min-h-[3.25rem]">
        {active && (
          <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-3 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:gap-8">
            <div>
              <p className="text-xs text-white/45">
                {active.name} {year}
              </p>
              <p className="mt-0.5 text-sm font-medium text-white">
                {t("monthBooks", { count: active.value })}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/45">{t("totalPages")}</p>
              <p className="mt-0.5 text-sm font-medium text-white">
                {active.pages.toLocaleString("tr-TR")}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs text-white/45">{t("booksThatMonth")}</p>
              <p className="mt-0.5 truncate text-sm text-white/80">
                {active.titles.length > 0 ? active.titles.join(", ") : t("none")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
