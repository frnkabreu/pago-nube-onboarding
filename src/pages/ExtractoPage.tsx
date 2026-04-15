import "@/dashboard.css"
import { DashboardShell } from "@/components/DashboardShell"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CreditCard, Banknote, Store, Barcode, ArrowUp, ArrowDown, RotateCcw, ChevronRight, ChevronDown } from "lucide-react"
import { useSales, type Transaction } from "@/lib/sales-context"

const ITEMS_PER_PAGE = 10

// ── Transaction icon (Figma: 40×40 circle + 20×20 status badge bottom-right) ──

function MethodIcon({ method }: { method: string }) {
  const cls = "h-[19px] w-[19px] text-[#5d5d5d]"
  switch (method) {
    case "Tarjeta de crédito":
    case "Tarjeta de débito":
      return <CreditCard className={cls} />
    case "Transferencia":
      return <Banknote className={cls} />
    case "OXXO":
      return <Barcode className={cls} />
    case "PayPal":
      return <Store className={cls} />
    default:
      return <CreditCard className={cls} />
  }
}

function StatusBadge({ status }: { status: string }) {
  const isPositive = status === "Aprobado"
  const isRefund = status === "Devolución total" || status === "Devolución parcial"

  if (isPositive) {
    return (
      <div
        className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full"
        style={{ background: "#00935b" }}
      >
        <ArrowUp className="h-3 w-3 text-white" />
      </div>
    )
  }
  if (isRefund) {
    return (
      <div
        className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full"
        style={{ background: "#6d6d6d" }}
      >
        <RotateCcw className="h-3 w-3 text-white" />
      </div>
    )
  }
  return (
    <div
      className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full"
      style={{ background: "#c80003" }}
    >
      <ArrowDown className="h-3 w-3 text-white" />
    </div>
  )
}

function TransactionIcon({ transaction }: { transaction: Transaction }) {
  return (
    <div className="relative h-10 w-[50px] shrink-0">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: "#f6f6f6" }}
      >
        <MethodIcon method={transaction.method} />
      </div>
      <StatusBadge status={transaction.status} />
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTransactionTitle(transaction: Transaction): string {
  return `Venta #${transaction.numericId}`
}

function getTransactionSubtitle(transaction: Transaction): string {
  switch (transaction.status) {
    case "Aprobado": return "Venta online"
    case "Devolución total": return "Devolución"
    case "Devolución parcial": return "Devolución parcial"
    case "Vencido": return "Pago vencido"
    case "Rechazado": return "Pago rechazado"
    default: return transaction.method
  }
}

function AmountDisplay({ transaction }: { transaction: Transaction }) {
  const isPositive = transaction.status === "Aprobado"
  const isNegative = transaction.status === "Vencido" || transaction.status === "Rechazado"
  const signColor = isNegative ? "#530001" : "#0a0a0a"
  const amountColor = isNegative ? "#530001" : "#0a0a0a"
  const sign = isPositive ? "+" : "-"

  return (
    <div className="flex items-center gap-1 shrink-0">
      <span
        className="font-semibold leading-5"
        style={{ fontSize: "14px", color: signColor }}
      >
        {sign}
      </span>
      <span
        className="font-semibold leading-5"
        style={{ fontSize: "14px", color: amountColor }}
      >
        MXN {transaction.value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </span>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ExtractoPage() {
  const { salesDatabase, getApprovedTotal } = useSales()
  const [activeTab, setActiveTab] = useState<"disponible" | "futuros">("disponible")
  const [currentPage, setCurrentPage] = useState(1)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    const container = document.querySelector(".settings-page-container")
    if (container) container.scrollTop = 0
    else window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const saldoTotal = getApprovedTotal()

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

  const getSettlementDate = (transaction: Transaction): Date => {
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

  const futureTransactions = salesDatabase.filter((t) => {
    if (t.status !== "Aprobado") return false
    return getSettlementDate(t) > new Date()
  })

  const filteredTransactions = activeTab === "disponible" ? salesDatabase : futureTransactions

  const groupedByDate = filteredTransactions.reduce(
    (acc, transaction) => {
      const dateKey = transaction.date
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(transaction)
      return acc
    },
    {} as Record<string, Transaction[]>,
  )

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => parseTransactionDate(b).getTime() - parseTransactionDate(a).getTime(),
  )

  const allTransactionsWithDate = sortedDates.flatMap((date) =>
    groupedByDate[date].map((t) => ({ ...t, groupDate: date })),
  )

  const totalPages = Math.ceil(allTransactionsWithDate.length / ITEMS_PER_PAGE)
  const paginatedTransactions = allTransactionsWithDate.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const paginatedGrouped = paginatedTransactions.reduce(
    (acc, transaction) => {
      const dateKey = transaction.groupDate
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(transaction)
      return acc
    },
    {} as Record<string, (Transaction & { groupDate: string })[]>,
  )

  const paginatedDates = Object.keys(paginatedGrouped)

  const formatDateHeader = (dateStr: string): string => {
    const date = parseTransactionDate(dateStr)
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "long" })
  }

  const futureTotal = futureTransactions.reduce((sum, t) => sum + t.value, 0)
  const displayTotal = activeTab === "disponible" ? saldoTotal : futureTotal

  const rangeStart = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, allTransactionsWithDate.length)

  // Page numbers window (max 5)
  const getPageNumbers = (): number[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, 4, 5]
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
  }

  return (
    <DashboardShell>
      {/* Sticky page header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[#5d5d5d] hover:text-[#0a0a0a] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Link>
          <h1 className="text-base font-semibold text-[#0a0a0a]">Extracto de Cuenta</h1>
          <div className="w-[140px]" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[800px] px-6 py-6">

        {/* ── Balance card ── */}
        <div
          className="mb-6 rounded-[8px] bg-white p-6"
          style={{ boxShadow: "0 0 2px 0 #888888" }}
        >
          {/* Segmented control — Nimbus exact spec */}
          <div
            className="mb-8 inline-flex rounded-[8px]"
            style={{ background: "#f6f6f6" }}
          >
            <button
              type="button"
              onClick={() => { setActiveTab("disponible"); setCurrentPage(1) }}
              className="h-[32px] rounded-[8px] px-2 py-[6px] text-[12px] font-medium leading-[16px] transition-all"
              style={
                activeTab === "disponible"
                  ? { background: "#eef5ff", border: "1px solid #0059d5", color: "#0059d5" }
                  : { background: "transparent", border: "1px solid transparent", color: "#0a0a0a" }
              }
            >
              Saldo disponible
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("futuros"); setCurrentPage(1) }}
              className="h-[32px] rounded-[8px] px-2 py-[6px] text-[12px] font-medium leading-[16px] transition-all"
              style={
                activeTab === "futuros"
                  ? { background: "#eef5ff", border: "1px solid #0059d5", color: "#0059d5" }
                  : { background: "transparent", border: "1px solid transparent", color: "#0a0a0a" }
              }
            >
              Lanzamientos futuros
            </button>
          </div>

          {/* Balance + button section */}
          <div className="flex flex-col gap-5 pb-2">
            <div className="flex flex-col gap-1">
              <h2
                className="font-semibold leading-[40px]"
                style={{ fontSize: "32px", color: "#000b19" }}
              >
                MXN {displayTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: "12px", lineHeight: "16px", color: "#5d5d5d" }}>
                Actualizado a las {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {/* Primary CTA */}
            <div>
              <button
                type="button"
                className="rounded-[8px] px-3 py-[6px] text-[14px] font-medium leading-[20px] text-white transition-colors"
                style={{ background: "#0059d5" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0047aa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0059d5")}
              >
                Transferir
              </button>
            </div>
          </div>
        </div>

        {/* ── Transaction list — Card container (Figma: white, rounded, shadow Level 2) ── */}
        <div
          className="overflow-hidden rounded-[8px]"
          style={{ background: "#ffffff", boxShadow: "0 0 2px 0 rgba(117,117,117,0.5)" }}
        >
          {paginatedDates.map((dateKey, dateIdx) => {
            const dayTransactions = paginatedGrouped[dateKey]
            const dayTotal = dayTransactions
              .filter((t) => t.status === "Aprobado")
              .reduce((sum, t) => sum + t.value, 0)

            return (
              <div key={dateKey}>
                {/* Date header — bg #f6f6f6, date left, total + chevron right */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: "#f6f6f6", borderTop: dateIdx > 0 ? "1px solid #f0f0f0" : "none" }}
                >
                  <h3
                    className="font-semibold"
                    style={{ fontSize: "14px", lineHeight: "20px", color: "#0a0a0a" }}
                  >
                    {formatDateHeader(dateKey)}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span
                      className="font-medium"
                      style={{ fontSize: "14px", lineHeight: "20px", color: "#0a0a0a" }}
                    >
                      MXN {dayTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                    <ChevronDown style={{ height: "16px", width: "16px", color: "#5d5d5d" }} />
                  </div>
                </div>

                {/* Transactions for this date */}
                {dayTransactions.map((transaction, txIdx) => (
                  <div key={transaction.id}>
                    {txIdx > 0 && (
                      <div className="mx-4" style={{ height: "1px", background: "#f0f0f0" }} />
                    )}
                    <div
                      className="flex cursor-pointer items-center gap-3 transition-colors"
                      style={{ background: "#ffffff", padding: "12px 16px" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      <TransactionIcon transaction={transaction} />

                      <div className="flex flex-1 min-w-0 items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-[2px]">
                          <p
                            className="truncate font-semibold leading-5"
                            style={{ fontSize: "14px", color: "#0a0a0a" }}
                          >
                            {getTransactionTitle(transaction)}
                          </p>
                          <p
                            className="truncate leading-5"
                            style={{ fontSize: "14px", color: "#5d5d5d" }}
                          >
                            {getTransactionSubtitle(transaction)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <AmountDisplay transaction={transaction} />
                          <ChevronRight
                            className="shrink-0"
                            style={{ height: "16px", width: "14px", color: "#b0b0b0" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          {allTransactionsWithDate.length === 0 && (
            <div className="px-4 py-10 text-center text-sm" style={{ color: "#9ca3af" }}>
              No hay lanzamientos disponibles
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 0 && (
          <div className="mt-4 flex items-center justify-between gap-4">
            {/* Counter */}
            <p className="text-sm" style={{ color: "#5d5d5d" }}>
              Mostrando {rangeStart}–{rangeEnd} de {allTransactionsWithDate.length} lanzamientos
            </p>

            {/* Page buttons — Nimbus style */}
            <div className="flex items-center">
              {/* Prev */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                style={{ color: "#00255a" }}
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => goToPage(pageNum)}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-sm transition-colors"
                  style={
                    currentPage === pageNum
                      ? { background: "#0059d5", color: "#ffffff", borderRadius: "4px" }
                      : { color: "#00255a" }
                  }
                >
                  {pageNum}
                </button>
              ))}

              {/* Next */}
              <button
                type="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                style={{ color: "#00255a" }}
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
  )
}
