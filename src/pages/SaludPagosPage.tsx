import "@/dashboard.css"
import { DashboardShell } from "@/components/DashboardShell"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, RotateCcw, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@nimbus-ds/select"
import { useSales, type PaymentStatus } from "@/lib/sales-context"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

const dateFilters = [
  { value: "all", label: "Todas las fechas" },
  { value: "ene", label: "Enero" },
  { value: "feb", label: "Febrero" },
  { value: "mar", label: "Marzo" },
  { value: "oct", label: "Octubre" },
  { value: "nov", label: "Noviembre" },
  { value: "dic", label: "Diciembre" },
]

const getStatusIcon = (status: PaymentStatus) => {
  switch (status) {
    case "Aprobado":
      return <CheckCircle2 className="h-5 w-5 text-success" />
    case "Vencido":
    case "Rechazado":
      return <XCircle className="h-5 w-5 text-destructive" />
    case "Devolución total":
    case "Devolución parcial":
      return <RotateCcw className="h-5 w-5 text-warning" />
    default:
      return <AlertTriangle className="h-5 w-5 text-muted-foreground" />
  }
}

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "Aprobado":
      return "bg-success-muted text-success border-success/30"
    case "Vencido":
    case "Rechazado":
      return "bg-error-muted text-error border-error/30"
    case "Devolución total":
    case "Devolución parcial":
      return "bg-warning-muted text-warning border-warning/30"
    default:
      return "bg-secondary text-muted-foreground border-border"
  }
}

export default function SaludPagosPage() {
  const { salesDatabase } = useSales()
  const [dateFilter, setDateFilter] = useState<string>("all")

  const filteredTransactions = dateFilter === "all"
    ? salesDatabase
    : salesDatabase.filter((t) => t.date.includes(dateFilter))

  const statusStats = {
    Aprobado: filteredTransactions.filter((t) => t.status === "Aprobado"),
    Vencido: filteredTransactions.filter((t) => t.status === "Vencido"),
    Rechazado: filteredTransactions.filter((t) => t.status === "Rechazado"),
    "Devolución total": filteredTransactions.filter((t) => t.status === "Devolución total"),
    "Devolución parcial": filteredTransactions.filter((t) => t.status === "Devolución parcial"),
  }

  const totalTransactions = filteredTransactions.length
  const totalValue = filteredTransactions.reduce((sum, t) => sum + t.value, 0)
  const approvedValue = statusStats.Aprobado.reduce((sum, t) => sum + t.value, 0)
  const rejectedValue = [...statusStats.Vencido, ...statusStats.Rechazado].reduce((sum, t) => sum + t.value, 0)
  const refundValue = [...statusStats["Devolución total"], ...statusStats["Devolución parcial"]].reduce((sum, t) => sum + t.value, 0)

  const approvedPercent = Math.round((statusStats.Aprobado.length / totalTransactions) * 100)
  const rejectedPercent = Math.round(((statusStats.Vencido.length + statusStats.Rechazado.length) / totalTransactions) * 100)
  const refundPercent = Math.round(((statusStats["Devolución total"].length + statusStats["Devolución parcial"].length) / totalTransactions) * 100)

  const pieData = [
    { name: "Aprobado", value: statusStats.Aprobado.length, color: "#10b981" },
    { name: "Vencido", value: statusStats.Vencido.length, color: "#ef4444" },
    { name: "Rechazado", value: statusStats.Rechazado.length, color: "#f97316" },
    { name: "Devolución total", value: statusStats["Devolución total"].length, color: "#f59e0b" },
    { name: "Devolución parcial", value: statusStats["Devolución parcial"].length, color: "#eab308" },
  ]

  const methodStats = filteredTransactions.reduce((acc, t) => {
    if (!acc[t.method]) acc[t.method] = { total: 0, approved: 0, rejected: 0 }
    acc[t.method].total++
    if (t.status === "Aprobado") acc[t.method].approved++
    if (t.status === "Rechazado" || t.status === "Vencido") acc[t.method].rejected++
    return acc
  }, {} as Record<string, { total: number; approved: number; rejected: number }>)

  const barData = Object.entries(methodStats).map(([method, stats]) => ({
    method: method.replace("Tarjeta de ", "T. "),
    tasa: Math.round((stats.approved / stats.total) * 100),
  }))

  const healthScore = Math.round((approvedPercent * 0.6) + ((100 - rejectedPercent) * 0.3) + ((100 - refundPercent) * 0.1))

  return (
    <DashboardShell>
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Salud de los Pagos</h1>
            <p className="text-sm text-muted-foreground">Análisis detallado del estado de tus transacciones</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtrar por fecha:</span>
            <Select
              id="filter-date"
              name="filter-date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <Select.Group label="Fecha">
                {dateFilters.map((filter) => (
                  <Select.Option key={filter.value} value={filter.value} label={filter.label} />
                ))}
              </Select.Group>
            </Select>
          </div>
          {dateFilter !== "all" && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter("all")} className="text-muted-foreground hover:text-foreground">
              Limpiar filtro
            </Button>
          )}
        </div>

        <Card className="mb-6 border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Índice de Salud General</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{healthScore}</span>
                <span className="text-lg text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {healthScore >= 70 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">Buen estado de salud</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-warning" />
                    <span className="text-sm text-warning">Requiere atención</span>
                  </>
                )}
              </div>
            </div>
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: healthScore },
                      { value: 100 - healthScore },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={30} outerRadius={40}
                    startAngle={90} endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill={healthScore >= 70 ? "#10b981" : "#f59e0b"} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-muted">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{approvedPercent}%</p>
                <p className="text-sm text-muted-foreground">Aprobados</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {statusStats.Aprobado.length} transacciones · MXN {approvedValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-muted">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{rejectedPercent}%</p>
                <p className="text-sm text-muted-foreground">Rechazados</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {statusStats.Vencido.length + statusStats.Rechazado.length} transacciones · MXN {rejectedValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-muted">
                <RotateCcw className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{refundPercent}%</p>
                <p className="text-sm text-muted-foreground">Devoluciones</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {statusStats["Devolución total"].length + statusStats["Devolución parcial"].length} transacciones · MXN {refundValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info-muted">
                <AlertTriangle className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{totalTransactions}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Volumen: MXN {totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </Card>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Distribución por Estado</h3>
            <div className="flex items-center gap-6">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} transacciones`, ""]}
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="ml-auto text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Tasa de Aprobación por Método</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="method" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Tasa de aprobación"]}
                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="tasa" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="border-border bg-card p-6">
          <h3 className="mb-5 text-lg font-semibold text-foreground">Desglose Detallado por Estado</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(statusStats).map(([status, transactions]) => {
              const totalForStatus = transactions.reduce((sum, t) => sum + t.value, 0)
              const percent = Math.round((transactions.length / totalTransactions) * 100)
              return (
                <div key={status} className="flex cursor-pointer items-center gap-4 rounded-lg border border-border p-3 transition-all hover:border-primary/50 hover:shadow-sm">
                  {getStatusIcon(status as PaymentStatus)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{status}</span>
                      <Badge variant="outline" className={getStatusColor(status as PaymentStatus)}>
                        {transactions.length} transacciones
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{percent}% del total</span>
                        <span>MXN {totalForStatus.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: status === "Aprobado" ? "#10b981" :
                              status === "Vencido" || status === "Rechazado" ? "#ef4444" : "#f59e0b",
                          }}
                        />
                      </div>
                    </div>
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
