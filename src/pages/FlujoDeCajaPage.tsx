import "@/dashboard.css"
import { DashboardShell } from "@/components/DashboardShell"
import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, CreditCard, Building2, Banknote, Wallet, LayoutGrid, List, BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSales } from "@/lib/sales-context"

type ViewMode = "sideBySide" | "timeline" | "comparison"
type TimelineFilter = "all" | "ingresos" | "gastos"

export default function FlujoDeCajaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("sideBySide")
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("all")
  const { salesDatabase } = useSales()

  const ingresos = useMemo(() => {
    return salesDatabase
      .filter((t) => t.status === "Aprobado")
      .map((t) => ({
        id: t.id,
        concepto: `Venta - ${t.client}`,
        metodo: t.method,
        fecha: t.date,
        monto: t.value,
      }))
  }, [salesDatabase])

  const gastos = useMemo(() => {
    const commissions = salesDatabase.map((t) => ({
      id: `COM-${t.numericId}`,
      concepto: `Comisión - ${t.id}`,
      metodo: t.method,
      fecha: t.date,
      monto: Math.round(t.value * 0.035 * 100) / 100,
    }))

    const refunds = salesDatabase
      .filter((t) => t.status === "Devolución total" || t.status === "Devolución parcial")
      .map((t) => ({
        id: `DEV-${t.numericId}`,
        concepto: `${t.status} - ${t.client}`,
        metodo: t.method,
        fecha: t.date,
        monto: t.status === "Devolución total" ? t.value : Math.round(t.value * 0.5 * 100) / 100,
      }))

    return [...commissions, ...refunds]
  }, [salesDatabase])

  const totalIngresos = useMemo(() => ingresos.reduce((sum, i) => sum + i.monto, 0), [ingresos])
  const totalGastos = useMemo(() => gastos.reduce((sum, g) => sum + g.monto, 0), [gastos])
  const balanceNeto = totalIngresos - totalGastos

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Tarjeta de crédito":
      case "Tarjeta de débito":
        return <CreditCard className="h-4 w-4" />
      case "Transferencia":
        return <Building2 className="h-4 w-4" />
      case "Efectivo":
      case "OXXO":
        return <Banknote className="h-4 w-4" />
      case "PayPal":
        return <Wallet className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
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
          <h1 className="text-xl font-semibold text-foreground">Detalle de Flujo de Caja</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ingresos</p>
                <h3 className="mt-1 text-2xl font-semibold text-success">
                  MXN {totalIngresos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-muted">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gastos y Comisiones</p>
                <h3 className="mt-1 text-2xl font-semibold text-destructive">
                  MXN {totalGastos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-error-muted">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance Neto</p>
                <h3 className={`mt-1 text-2xl font-semibold ${balanceNeto >= 0 ? "text-success" : "text-destructive"}`}>
                  MXN {balanceNeto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${balanceNeto >= 0 ? "bg-success-muted" : "bg-error-muted"}`}>
                <DollarSign className={`h-4 w-4 ${balanceNeto >= 0 ? "text-success" : "text-destructive"}`} />
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Detalle de Movimientos</h2>
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {(["sideBySide", "timeline", "comparison"] as ViewMode[]).map((mode) => {
              const labels: Record<ViewMode, { label: string; Icon: typeof LayoutGrid }> = {
                sideBySide: { label: "Lado a Lado", Icon: LayoutGrid },
                timeline: { label: "Timeline", Icon: List },
                comparison: { label: "Comparativo", Icon: BarChart3 },
              }
              const { label, Icon } = labels[mode]
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content area — w-full garante que a largura não encolhe ao trocar de aba */}
        <div className="w-full">

        {/* Side by Side */}
        {viewMode === "sideBySide" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <h2 className="text-lg font-semibold text-foreground">Ingresos (Entradas)</h2>
                  <span className="ml-auto text-sm text-muted-foreground">{ingresos.length} transacciones</span>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Concepto</th>
                      <th className="px-4 py-3 font-medium">Método</th>
                      <th className="px-4 py-3 font-medium text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.map((ingreso) => (
                      <tr key={ingreso.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{ingreso.concepto}</p>
                            <p className="text-xs text-muted-foreground">{ingreso.fecha}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getMethodIcon(ingreso.metodo)}
                            <span className="hidden sm:inline">{ingreso.metodo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-success">
                            +MXN {ingreso.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="border-border bg-card">
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <h2 className="text-lg font-semibold text-foreground">Gastos y Comisiones</h2>
                  <span className="ml-auto text-sm text-muted-foreground">{gastos.length} transacciones</span>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Concepto</th>
                      <th className="px-4 py-3 font-medium">Método</th>
                      <th className="px-4 py-3 font-medium text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map((gasto) => (
                      <tr key={gasto.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{gasto.concepto}</p>
                            <p className="text-xs text-muted-foreground">{gasto.fecha}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getMethodIcon(gasto.metodo)}
                            <span className="hidden sm:inline">{gasto.metodo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-destructive">
                            -MXN {gasto.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Timeline */}
        {viewMode === "timeline" && (
          <Card className="border-border bg-card">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Timeline de Movimientos</h3>
                <div className="flex gap-2">
                  {(["all", "ingresos", "gastos"] as TimelineFilter[]).map((f) => {
                    const filterColors: Record<TimelineFilter, string> = {
                      all: "border-primary bg-primary/10 text-primary",
                      ingresos: "border-success bg-success/10 text-success",
                      gastos: "border-destructive bg-destructive/10 text-destructive",
                    }
                    const filterLabels: Record<TimelineFilter, string> = {
                      all: "Todos",
                      ingresos: "Ingresos",
                      gastos: "Gastos",
                    }
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setTimelineFilter(f)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          timelineFilter === f ? filterColors[f] : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f !== "all" && <div className={`h-2 w-2 rounded-full ${f === "ingresos" ? "bg-success" : "bg-destructive"}`} />}
                        {filterLabels[f]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-4">
              <div className="relative space-y-0">
                {[
                  ...ingresos.map(i => ({ ...i, tipo: "ingreso" as const })),
                  ...gastos.map(g => ({ ...g, tipo: "gasto" as const })),
                ]
                  .filter((item) => {
                    if (timelineFilter === "all") return true
                    if (timelineFilter === "ingresos") return item.tipo === "ingreso"
                    return item.tipo === "gasto"
                  })
                  .sort((a, b) => a.fecha.localeCompare(b.fecha))
                  .map((item, index, arr) => {
                    const isIngreso = item.tipo === "ingreso"
                    const showDateHeader = index === 0 || item.fecha !== arr[index - 1].fecha
                    return (
                      <div key={item.id}>
                        {showDateHeader && (
                          <div className="sticky top-0 z-10 -mx-4 bg-secondary/80 px-4 py-2 backdrop-blur-sm">
                            <span className="text-sm font-medium text-foreground">{item.fecha}</span>
                          </div>
                        )}
                        <div className={`flex items-center gap-4 border-l-4 py-3 pl-4 ${
                          isIngreso ? "border-success bg-success/5" : "border-destructive bg-destructive/5"
                        }`}>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isIngreso ? "bg-success-muted text-success" : "bg-error-muted text-destructive"
                          }`}>
                            {isIngreso ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{item.concepto}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {getMethodIcon(item.metodo)}
                              <span>{item.metodo}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-semibold ${isIngreso ? "text-success" : "text-destructive"}`}>
                              {isIngreso ? "+" : "-"}MXN {item.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </Card>
        )}

        {/* Comparison */}
        {viewMode === "comparison" && (
          <div className="space-y-6">
            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Comparativa Visual</h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Proporción Ingresos vs Gastos</span>
                    <span className="font-medium">
                      {Math.round((totalIngresos / (totalIngresos + totalGastos)) * 100)}% /{" "}
                      {Math.round((totalGastos / (totalIngresos + totalGastos)) * 100)}%
                    </span>
                  </div>
                  <div className="flex h-8 overflow-hidden rounded-lg">
                    <div
                      className="flex items-center justify-center bg-success text-xs font-medium text-white"
                      style={{ width: `${(totalIngresos / (totalIngresos + totalGastos)) * 100}%` }}
                    >
                      Ingresos
                    </div>
                    <div
                      className="flex items-center justify-center bg-destructive text-xs font-medium text-white"
                      style={{ width: `${(totalGastos / (totalIngresos + totalGastos)) * 100}%` }}
                    >
                      Gastos
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Por Método de Pago</h3>
              <div className="space-y-4">
                {["Tarjeta de crédito", "Tarjeta de débito", "Transferencia", "OXXO", "PayPal", "Efectivo"].map((method) => {
                  const methodIngresos = ingresos.filter(i => i.metodo === method).reduce((sum, i) => sum + i.monto, 0)
                  const methodGastos = gastos.filter(g => g.metodo === method).reduce((sum, g) => sum + g.monto, 0)
                  const methodTotal = methodIngresos + methodGastos
                  if (methodTotal === 0) return null
                  return (
                    <div key={method} className="rounded-lg border border-border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(method)}
                          <span className="font-medium text-foreground">{method}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Neto:{" "}
                          <span className={methodIngresos - methodGastos >= 0 ? "text-success" : "text-destructive"}>
                            MXN {(methodIngresos - methodGastos).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </span>
                      </div>
                      <div className="mb-2 flex h-6 overflow-hidden rounded-md">
                        {methodIngresos > 0 && (
                          <div className="bg-success" style={{ width: `${(methodIngresos / methodTotal) * 100}%` }} />
                        )}
                        {methodGastos > 0 && (
                          <div className="bg-destructive" style={{ width: `${(methodGastos / methodTotal) * 100}%` }} />
                        )}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-success">+MXN {methodIngresos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                        <span className="text-destructive">-MXN {methodGastos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Métricas Resumen</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-success-muted p-4 text-center">
                  <p className="text-2xl font-bold text-success">{ingresos.length}</p>
                  <p className="text-sm text-muted-foreground">Total Ingresos</p>
                </div>
                <div className="rounded-lg bg-error-muted p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{gastos.length}</p>
                  <p className="text-sm text-muted-foreground">Total Gastos</p>
                </div>
                <div className="rounded-lg bg-success-muted p-4 text-center">
                  <p className="text-2xl font-bold text-success">
                    MXN {(totalIngresos / ingresos.length).toLocaleString("es-MX", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Promedio Ingreso</p>
                </div>
                <div className="rounded-lg bg-error-muted p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">
                    MXN {(totalGastos / gastos.length).toLocaleString("es-MX", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Promedio Gasto</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        </div>{/* end content area */}
      </main>
    </DashboardShell>
  )
}
