import { Link } from "react-router-dom"
import { TrendingUp, Calendar, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useSales, type Transaction } from "@/lib/sales-context"

const parseTransactionDate = (dateStr: string): Date => {
  const months: Record<string, number> = {
    ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
    jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
  }
  const parts = dateStr.split(" ")
  const day = Number.parseInt(parts[0], 10)
  const month = months[parts[1]] ?? 0
  const year = new Date().getFullYear()
  return new Date(year, month, day)
}

const getSettlementDate = (transaction: Transaction): Date => {
  const baseDate = parseTransactionDate(transaction.date)
  let daysToAdd = 1

  if (transaction.method === "Transferencia") {
    daysToAdd = 1
  } else if (transaction.method === "Tarjeta de crédito") {
    daysToAdd = 14
  } else if (transaction.method === "Tarjeta de débito") {
    daysToAdd = 2
  } else if (transaction.method === "OXXO") {
    daysToAdd = 3
  } else if (transaction.method === "PayPal") {
    daysToAdd = 7
  } else {
    daysToAdd = 1
  }

  const settlementDate = new Date(baseDate)
  settlementDate.setDate(settlementDate.getDate() + daysToAdd)
  return settlementDate
}

export function StatsCards() {
  const { salesDatabase, getApprovedTotal, getProblematicTransactions } = useSales()

  const approvedTotal = getApprovedTotal()
  void getProblematicTransactions()

  const approvedCount = salesDatabase.filter((t) => t.status === "Aprobado").length
  const rejectedCount = salesDatabase.filter((t) => t.status === "Rechazado" || t.status === "Vencido").length
  const refundCount = salesDatabase.filter((t) => t.status === "Devolución total" || t.status === "Devolución parcial").length
  const totalCount = salesDatabase.length

  const approvedPercent = Math.round((approvedCount / totalCount) * 100)
  const rejectedPercent = Math.round((rejectedCount / totalCount) * 100)
  const refundPercent = Math.round((refundCount / totalCount) * 100)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureSettlements = salesDatabase.filter((t) => {
    if (t.status !== "Aprobado") return false
    const settlementDate = getSettlementDate(t)
    return settlementDate > today
  })

  const projectedRevenue = futureSettlements.reduce((sum, t) => sum + t.value, 0)

  const nextSettlementDate = futureSettlements
    .map((t) => getSettlementDate(t))
    .filter((d) => d > today)
    .sort((a, b) => a.getTime() - b.getTime())[0]

  const getNextSettlementText = () => {
    if (!nextSettlementDate) return "Sin liquidaciones pendientes"
    const diffDays = Math.ceil((nextSettlementDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Hoy"
    if (diffDays === 1) return "Mañana"
    return `En ${diffDays} días`
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
      {/* Saldo Total */}
      <Link to="/extracto" className="h-full">
        <Card className="group flex h-full min-h-[120px] cursor-pointer flex-col justify-between border-border bg-card p-4 sm:p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Saldo Total</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-semibold text-card-foreground sm:text-2xl">
                MXN {approvedTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </h3>
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">+8% vs semana pasada</span>
              </div>
            </div>
            <div className="h-10 w-16">
              <svg viewBox="0 0 80 48" className="h-full w-full">
                <path d="M0 40 Q20 35 30 30 T50 25 T80 15" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-success" />
              </svg>
            </div>
          </div>
        </Card>
      </Link>

      {/* Ingreso Previsto */}
      <Link to="/ingresos-previstos" className="h-full">
        <Card className="group flex h-full min-h-[120px] cursor-pointer flex-col justify-between border-border bg-card p-4 sm:p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ingreso Previsto (30 días)</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-semibold text-card-foreground sm:text-2xl">
                MXN {projectedRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Próxima liquidación: {getNextSettlementText()}</span>
              </div>
            </div>
            <div className="flex h-10 items-end gap-[3px]">
              {[40, 60, 30, 80, 55, 70].map((height, i) => (
                <div key={i} className="w-2 rounded-t bg-info/40" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </Card>
      </Link>

      {/* Salud de los Pagos */}
      <Link to="/salud-pagos" className="h-full">
        <Card className="group flex h-full min-h-[120px] cursor-pointer flex-col justify-between border-border bg-card p-4 sm:p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Salud de los Pagos</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-base font-semibold text-card-foreground">{approvedPercent}% Procesado</span>
              <span className="text-sm text-muted-foreground">Hoy</span>
            </div>
            <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full">
              <div className="h-full bg-success" style={{ width: `${approvedPercent}%` }} />
              <div className="h-full bg-destructive" style={{ width: `${rejectedPercent}%` }} />
              <div className="h-full bg-muted" style={{ width: `${refundPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-muted-foreground">Aprobado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Rechazado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted" />
                <span className="text-muted-foreground">Devolución</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}
