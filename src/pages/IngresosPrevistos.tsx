import "@/dashboard.css"
import { DashboardShell } from "@/components/DashboardShell"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Calendar, DollarSign, CreditCard, Filter, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@nimbus-ds/select"
import { useSales } from "@/lib/sales-context"

const dateRangeFilters = [
  { value: "all", label: "Todas las fechas" },
  { value: "today", label: "Hoy" },
  { value: "tomorrow", label: "Mañana" },
  { value: "week", label: "Próximos 7 días" },
  { value: "month", label: "Próximos 30 días" },
]

const monthFilters = [
  { value: "all", label: "Todos los meses" },
  { value: "0", label: "Enero" },
  { value: "1", label: "Febrero" },
  { value: "2", label: "Marzo" },
  { value: "3", label: "Abril" },
  { value: "9", label: "Octubre" },
  { value: "10", label: "Noviembre" },
  { value: "11", label: "Diciembre" },
]

export default function IngresosPrevistos() {
  const { salesDatabase } = useSales()
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")

  const approvedTransactions = salesDatabase.filter((t) => t.status === "Aprobado")

  const parseTransactionDate = (dateStr: string): Date => {
    const monthMap: Record<string, number> = {
      ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
      jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
    }
    const parts = dateStr.split(" ")
    const day = Number.parseInt(parts[0], 10)
    const month = monthMap[parts[1]] ?? 0
    const year = new Date().getFullYear()
    return new Date(year, month, day)
  }

  const getSettlementDate = (transaction: (typeof salesDatabase)[0]) => {
    const baseDate = parseTransactionDate(transaction.date)
    let daysToAdd = 1
    if (transaction.method === "Transferencia") daysToAdd = 1
    else if (transaction.method === "Tarjeta de crédito") daysToAdd = 14
    else if (transaction.method === "Tarjeta de débito") daysToAdd = 2
    else if (transaction.method === "OXXO") daysToAdd = 3
    else if (transaction.method === "PayPal") daysToAdd = 7
    const settlementDate = new Date(baseDate)
    settlementDate.setDate(settlementDate.getDate() + daysToAdd)
    return settlementDate
  }

  const groupedByDate = approvedTransactions.reduce(
    (groups, transaction) => {
      const settlementDate = getSettlementDate(transaction)
      const dateKey = settlementDate.toISOString().split("T")[0]
      if (!groups[dateKey]) {
        groups[dateKey] = { date: settlementDate, transactions: [], total: 0 }
      }
      groups[dateKey].transactions.push(transaction)
      groups[dateKey].total += transaction.value
      return groups
    },
    {} as Record<string, { date: Date; transactions: (typeof salesDatabase)[0][]; total: number }>,
  )

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const monthFromNow = new Date(today)
  monthFromNow.setDate(monthFromNow.getDate() + 30)

  const filteredDates = sortedDates.filter((dateKey) => {
    const date = new Date(dateKey)
    if (dateRangeFilter === "today" && date.toDateString() !== today.toDateString()) return false
    if (dateRangeFilter === "tomorrow" && date.toDateString() !== tomorrow.toDateString()) return false
    if (dateRangeFilter === "week" && (date < today || date > weekFromNow)) return false
    if (dateRangeFilter === "month" && (date < today || date > monthFromNow)) return false
    if (monthFilter !== "all" && date.getMonth() !== Number.parseInt(monthFilter)) return false
    return true
  })

  const filteredTransactions = filteredDates.flatMap((dateKey) => groupedByDate[dateKey].transactions)
  const totalIngresos = filteredTransactions.reduce((sum, t) => sum + t.value, 0)
  const totalTransactions = filteredTransactions.length
  const hasActiveFilters = dateRangeFilter !== "all" || monthFilter !== "all"

  const clearFilters = () => {
    setDateRangeFilter("all")
    setMonthFilter("all")
  }

  const formatDate = (date: Date) => {
    const todayCheck = new Date()
    const tomorrowCheck = new Date(todayCheck)
    tomorrowCheck.setDate(tomorrowCheck.getDate() + 1)
    if (date.toDateString() === todayCheck.toDateString()) return "Hoy"
    if (date.toDateString() === tomorrowCheck.toDateString()) return "Mañana"
    return date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
  }

  return (
    <DashboardShell>
      <header className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-xl font-semibold text-foreground">Ingresos Previstos</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total por Liquidar</p>
                <p className="text-xl font-semibold text-foreground">
                  MXN {totalIngresos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <CreditCard className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transacciones Pendientes</p>
                <p className="text-xl font-semibold text-foreground">{totalTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próxima Liquidación</p>
                <p className="text-xl font-semibold text-foreground">
                  {filteredDates.length > 0 ? formatDate(groupedByDate[filteredDates[0]].date) : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-6 border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtros:</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Rango de fecha</label>
              <Select
                id="filter-date-range"
                name="filter-date-range"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
              >
                <Select.Group label="Rango de fecha">
                  {dateRangeFilters.map((f) => (
                    <Select.Option key={f.value} value={f.value} label={f.label} />
                  ))}
                </Select.Group>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Mes</label>
              <Select
                id="filter-month"
                name="filter-month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <Select.Group label="Mes">
                  {monthFilters.map((f) => (
                    <Select.Option key={f.value} value={f.value} label={f.label} />
                  ))}
                </Select.Group>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto gap-1.5 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </Card>

        <Card className="border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Calendario de Liquidaciones</h2>
            <p className="text-sm text-muted-foreground">Ingresos organizados por fecha de liquidación</p>
          </div>
          <div className="divide-y divide-border">
            {filteredDates.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-foreground">No hay liquidaciones</p>
                <p className="text-sm text-muted-foreground">No se encontraron liquidaciones con los filtros seleccionados</p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 bg-transparent">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
            {filteredDates.map((dateKey) => {
              const group = groupedByDate[dateKey]
              return (
                <div key={dateKey} className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold capitalize text-foreground">{formatDate(group.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-success">
                        +MXN {group.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">{group.transactions.length} transacciones</p>
                    </div>
                  </div>
                  <div className="ml-5 space-y-2 border-l-2 border-border pl-8">
                    {group.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-foreground">{transaction.id}</p>
                            <p className="text-sm text-muted-foreground">{transaction.client}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{transaction.method}</span>
                          <span className="font-medium text-foreground">
                            MXN {transaction.value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </main>
    </DashboardShell>
  )
}
