import "@/dashboard.css"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { DashboardShell } from "@/components/DashboardShell"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { useSales } from "@/lib/sales-context"

export default function PagosPage() {
  const { salesDatabase, getApprovedTotal } = useSales()
  const approvedTotal = getApprovedTotal()
  const approvedCount = salesDatabase.filter((t) => t.status === "Aprobado").length

  return (
    <DashboardShell>
      <div className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm font-medium text-foreground">Todos los pagos</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{salesDatabase.length}</span> transacciones
            </span>
            <span>
              <span className="font-semibold text-success">
                MXN {approvedTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>{" "}
              aprobado
            </span>
            <span>
              <span className="font-semibold text-foreground">{approvedCount}</span> aprobadas
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PaymentsTable />
      </main>
    </DashboardShell>
  )
}
