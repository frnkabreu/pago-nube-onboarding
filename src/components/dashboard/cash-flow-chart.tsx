import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChevronRight } from "lucide-react"
import { useSales, type Transaction } from "@/lib/sales-context"

const MONTH_ORDER: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
}

function parseDateToOrdinal(dateStr: string): number {
  const [dayStr, monthStr] = dateStr.split(" ")
  const month = MONTH_ORDER[monthStr?.toLowerCase()] ?? 0
  return month * 31 + parseInt(dayStr, 10)
}

function buildChartData(days: number, transactions: Transaction[]) {
  const points = days <= 7 ? days : days <= 15 ? 7 : days <= 30 ? 8 : 10
  const buckets: { date: string; ingresos: number; gastos: number }[] = []

  const sorted = [...transactions].sort(
    (a, b) => parseDateToOrdinal(a.date) - parseDateToOrdinal(b.date)
  )

  const chunkSize = Math.ceil(sorted.length / points)

  for (let i = 0; i < points; i++) {
    const slice = sorted.slice(i * chunkSize, (i + 1) * chunkSize)
    const ingresos = slice
      .filter((t) => t.status === "Aprobado")
      .reduce((s, t) => s + t.value, 0)
    const gastos = slice
      .filter((t) => t.status !== "Aprobado")
      .reduce((s, t) => s + t.value * 0.045, 0) +
      ingresos * 0.036

    const label = slice[0]?.date ?? `Día ${i + 1}`
    buckets.push({
      date: label,
      ingresos: Math.round(ingresos),
      gastos: Math.round(gastos),
    })
  }

  return buckets
}

const PERIOD_OPTIONS = [
  { value: "7", label: "7 días" },
  { value: "15", label: "15 días" },
  { value: "30", label: "30 días" },
  { value: "90", label: "90 días" },
]

export function CashFlowChart() {
  const [period, setPeriod] = useState("30")
  const { salesDatabase } = useSales()

  const chartData = useMemo(
    () => buildChartData(parseInt(period, 10), salesDatabase),
    [period, salesDatabase]
  )

  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "30 días"

  return (
    <Card className="group mb-6 border-border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-card-foreground">Flujo de Caja en Tiempo Real</h3>
            <Link
              to="/flujo-de-caja"
              className="flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100"
            >
              Ver detalles <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Últimos {periodLabel}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-sm text-destructive">Gastos y Comisiones</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-success">Ingresos (Entradas)</span>
        </div>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`MXN ${(value as number).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, ""]}
            />
            <Line type="monotone" dataKey="ingresos" stroke="var(--success)" strokeWidth={2} dot={false} name="Ingresos" />
            <Line type="monotone" dataKey="gastos" stroke="var(--destructive)" strokeWidth={2} dot={false} name="Gastos" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
