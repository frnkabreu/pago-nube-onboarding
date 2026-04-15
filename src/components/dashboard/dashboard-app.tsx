import { useMemo, useState, type ReactNode } from "react"
import type { DateRange } from "react-day-picker"
import { CalendarRange } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function formatYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function defaultLastWeekRange(): DateRange {
  const to = new Date()
  to.setHours(12, 0, 0, 0)
  const from = new Date(to)
  from.setDate(from.getDate() - 7)
  return { from, to }
}

function rangeLabel(range: DateRange | undefined): string {
  if (!range?.from) return "Seleccionar fechas"
  if (!range.to) return `${formatYmd(range.from)} → …`
  return `${formatYmd(range.from)} → ${formatYmd(range.to)}`
}

type DashboardAppProps = {
  children: ReactNode
}

/**
 * Layout do dashboard com header de marca e subtítulo interativo (intervalo de datas).
 */
function DashboardApp({ children }: DashboardAppProps) {
  const [range, setRange] = useState<DateRange | undefined>(() => defaultLastWeekRange())

  const label = useMemo(() => rangeLabel(range), [range])

  return (
    <div className="db-root">
      <header className="db-header">
        <div className="db-header-brand">
          <div>
            <p className="db-header-sub">
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="db-header-date-trigger" aria-label="Seleccionar período">
                    <span className="db-header-date-text">{label}</span>
                    <CalendarRange className="db-header-date-icon" aria-hidden />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={2}
                    defaultMonth={range?.from}
                  />
                </PopoverContent>
              </Popover>
            </p>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

DashboardApp.displayName = "DashboardApp"

export { DashboardApp }
