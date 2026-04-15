import { useState } from "react"
import { Search, SlidersHorizontal, Calendar, CreditCard, X } from "lucide-react"
import { Link } from "react-router-dom"
import { Select } from "@nimbus-ds/select"
import { useSales, type PaymentStatus, type PaymentMethod } from "@/lib/sales-context"
import "@/styles/payments-table.css"

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PaymentStatus, { bg: string; text: string; border: string }> = {
  Aprobado:            { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  Vencido:             { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
  Rechazado:           { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  "Devolución total":  { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  "Devolución parcial":{ bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const s = STATUS_STYLES[status] ?? { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" }
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        borderRadius: "20px",
        padding: "2px 10px",
        fontSize: "12px",
        fontWeight: 500,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {status}
    </span>
  )
}

// ── Filter constants ──────────────────────────────────────────────────────────

const months = [
  { value: "all", label: "Todas las fechas" },
  { value: "ene", label: "Enero" },
  { value: "feb", label: "Febrero" },
  { value: "mar", label: "Marzo" },
  { value: "oct", label: "Octubre" },
  { value: "nov", label: "Noviembre" },
  { value: "dic", label: "Diciembre" },
]

const paymentMethodOptions = [
  { value: "all",              label: "Todos los métodos" },
  { value: "Tarjeta de crédito", label: "Tarjeta de crédito" },
  { value: "Tarjeta de débito",  label: "Tarjeta de débito" },
  { value: "Transferencia",    label: "Transferencia" },
  { value: "Efectivo",         label: "Efectivo" },
  { value: "PayPal",           label: "PayPal" },
  { value: "OXXO",             label: "OXXO" },
]

type SortKey = "numericId" | "date" | "client" | "method" | "status" | "value"
type SortDir = "asc" | "desc"

const MONTH_ORDER: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
}

function parseDate(dateStr: string): number {
  const parts = dateStr.split(" ")
  const day = Number.parseInt(parts[0], 10) || 0
  const month = MONTH_ORDER[parts[1]] ?? 0
  return month * 100 + day
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="pt-sort-icon pt-sort-icon--idle">↕</span>
  return <span className="pt-sort-icon pt-sort-icon--active">{dir === "asc" ? "↑" : "↓"}</span>
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaymentsTable({ limit }: { limit?: number } = {}) {
  const { salesDatabase, recentlyChangedIds } = useSales()
  const [searchTerm,   setSearchTerm]   = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [dateFilter,   setDateFilter]   = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all")
  const [showFilters,  setShowFilters]  = useState(false)
  const [sortKey,      setSortKey]      = useState<SortKey>("numericId")
  const [sortDir,      setSortDir]      = useState<SortDir>("desc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const filteredPayments = salesDatabase.filter((p) => {
    const matchSearch =
      searchTerm === "" ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numericId.toString().includes(searchTerm)
    return (
      matchSearch &&
      (statusFilter === "all" || p.status === statusFilter) &&
      (dateFilter   === "all" || p.date.includes(dateFilter)) &&
      (methodFilter === "all" || p.method === methodFilter)
    )
  })

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let cmp = 0
    if (sortKey === "value" || sortKey === "numericId") {
      cmp = a[sortKey] - b[sortKey]
    } else if (sortKey === "date") {
      cmp = parseDate(a.date) - parseDate(b.date)
    } else {
      cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), "es")
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  const activeFilters = [statusFilter, dateFilter, methodFilter].filter(f => f !== "all").length
  const paymentsToShow = limit !== undefined ? sortedPayments.slice(0, limit) : sortedPayments
  const hasMore = limit !== undefined && sortedPayments.length > limit

  const clearAll = () => {
    setStatusFilter("all")
    setDateFilter("all")
    setMethodFilter("all")
    setSearchTerm("")
  }

  return (
    <div className="pt-table">

      {/* Title */}
      <h3 className="pt-title">Pagos</h3>

      {/* Search + Filter bar */}
      <div className="pt-toolbar-wrap">
        <div className="pt-toolbar">
          <div className="pt-search-wrap">
            <Search className="pt-search-icon" size={16} />
            <input
              className="pt-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por pedido, cliente o ID..."
            />
            {searchTerm && (
              <button className="pt-search-clear" onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <button
            className={`pt-filter-btn${showFilters ? " pt-filter-btn--active" : ""}`}
            onClick={() => setShowFilters(v => !v)}
          >
            <SlidersHorizontal size={15} />
            Filtrar
            {activeFilters > 0 && <span className="pt-filter-count">{activeFilters}</span>}
          </button>
        </div>

        {/* Filter panel — absolutely positioned so it doesn't shift layout */}
        {showFilters && (
        <div className="pt-filter-panel">
          <div className="pt-filter-fields">
            <div className="pt-filter-field">
              <label className="pt-filter-label"><Calendar size={13} /> Fecha</label>
              <Select
                id="filter-date"
                name="filter-date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              >
                <Select.Group label="Fecha">
                  {months.map(m => (
                    <Select.Option key={m.value} value={m.value} label={m.label} />
                  ))}
                </Select.Group>
              </Select>
            </div>
            <div className="pt-filter-field">
              <label className="pt-filter-label"><CreditCard size={13} /> Método</label>
              <Select
                id="filter-method"
                name="filter-method"
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value as PaymentMethod | "all")}
              >
                <Select.Group label="Método">
                  {paymentMethodOptions.map(m => (
                    <Select.Option key={m.value} value={m.value} label={m.label} />
                  ))}
                </Select.Group>
              </Select>
            </div>
            <div className="pt-filter-field">
              <label className="pt-filter-label">Estado</label>
              <Select
                id="filter-status"
                name="filter-status"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as PaymentStatus | "all")}
              >
                <Select.Group label="Estado">
                  <Select.Option value="all" label="Todos los estados" />
                  <Select.Option value="Aprobado" label="Aprobado" />
                  <Select.Option value="Vencido" label="Vencido" />
                  <Select.Option value="Rechazado" label="Rechazado" />
                  <Select.Option value="Devolución total" label="Devolución total" />
                  <Select.Option value="Devolución parcial" label="Devolución parcial" />
                </Select.Group>
              </Select>
            </div>
            <div className="pt-filter-actions">
              {activeFilters > 0 && (
                <button className="pt-clear-btn" onClick={clearAll}>
                  <X size={13} /> Limpiar filtros
                </button>
              )}
              <button className="pt-apply-btn" onClick={() => setShowFilters(false)}>
                <X size={14} /> Fechar
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Table */}
      <div className="pt-card">
        <div className="pt-scroll">
          <table className="pt-tbl">
            <colgroup>
              <col />{/* ID */}
              <col />{/* Fecha */}
              <col />{/* Cliente */}
              <col />{/* Método */}
              <col />{/* Estado */}
              <col />{/* Valor */}
            </colgroup>
            <thead>
              <tr className="pt-head-row">
                <th className="pt-th pt-th--sortable" onClick={() => handleSort("numericId")}>
                  ID Transacción <SortIcon active={sortKey === "numericId"} dir={sortDir} />
                </th>
                <th className="pt-th pt-th--sortable" onClick={() => handleSort("date")}>
                  Fecha <SortIcon active={sortKey === "date"} dir={sortDir} />
                </th>
                <th className="pt-th pt-th--sortable" onClick={() => handleSort("client")}>
                  Cliente <SortIcon active={sortKey === "client"} dir={sortDir} />
                </th>
                <th className="pt-th pt-th--sortable" onClick={() => handleSort("method")}>
                  Método <SortIcon active={sortKey === "method"} dir={sortDir} />
                </th>
                <th className="pt-th pt-th--sortable" onClick={() => handleSort("status")}>
                  Estado <SortIcon active={sortKey === "status"} dir={sortDir} />
                </th>
                <th className="pt-th pt-th--right pt-th--sortable" onClick={() => handleSort("value")}>
                  Valor <SortIcon active={sortKey === "value"} dir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentsToShow.map((p) => {
                const highlighted = recentlyChangedIds.includes(p.numericId)
                return (
                  <tr key={p.id} className={`pt-row${highlighted ? " pt-row--highlight" : ""}`}>
                    <td className="pt-td">
                      <a href="#" className="pt-id-link">{p.id}</a>
                    </td>
                    <td className="pt-td pt-td--muted">{p.date}</td>
                    <td className="pt-td pt-td--bold">{p.client}</td>
                    <td className="pt-td pt-td--method">
                      <span className="pt-method-icon">$</span>
                      {p.method}
                    </td>
                    <td className="pt-td">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="pt-td pt-td--right pt-td--bold">
                      MXN {p.value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="pt-td pt-td--empty">
                    No se encontraron transacciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-footer">
          <span>
            Mostrando {paymentsToShow.length} de {salesDatabase.length} transacciones
          </span>
          {hasMore && (
            <Link to="/pagos" className="pt-ver-todos" onClick={() => window.scrollTo({ top: 0 })}>
              Ver todos ({filteredPayments.length})
            </Link>
          )}
        </div>
      </div>

    </div>
  )
}
