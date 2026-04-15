import type { Transaction } from "@/lib/sales-context"

const MAX_LEN = 6000

/**
 * Contexto textual enriquecido para el BFF/Gemini (sin exponer la API key).
 * Incluye conteos por estado, muestras de IDs y top clientes por volumen aprobado.
 */
export function buildSalesSummaryForLlm(db: Transaction[]): string {
  const approved = db.filter((t) => t.status === "Aprobado")
  const sumApproved = approved.reduce((s, t) => s + t.value, 0)

  const statusCounts: Record<string, number> = {}
  for (const t of db) {
    statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1
  }
  const statusLine = Object.entries(statusCounts)
    .map(([k, v]) => `${k}:${v}`)
    .join(", ")

  const clientTotals: Record<string, number> = {}
  for (const t of approved) {
    clientTotals[t.client] = (clientTotals[t.client] ?? 0) + t.value
  }
  const topClients = Object.entries(clientTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => `${name}=${total.toFixed(2)} MXN`)
    .join("; ")

  const problematic = db.filter((t) => t.status === "Vencido" || t.status === "Rechazado")
  const sampleProblem = problematic
    .slice(0, 8)
    .map((t) => `#${t.numericId} ${t.client} ${t.status} ${t.value.toFixed(2)}`)
    .join(" | ")

  const idRange = db.length
    ? `IDs numéricos aprox.: ${Math.min(...db.map((t) => t.numericId))}–${Math.max(...db.map((t) => t.numericId))}`
    : ""

  let text = `[Datos simulados en memoria]
Total transacciones: ${db.length}
Aprobadas: ${approved.length}; suma aprobada: ${sumApproved.toFixed(2)} MXN
Por estado: ${statusLine}
${idRange}
Top clientes (por monto aprobado): ${topClients || "n/d"}
Ejemplos problemáticos (vencido/rechazado): ${sampleProblem || "ninguno"}
`

  if (text.length > MAX_LEN) {
    text = `${text.slice(0, MAX_LEN)}\n…(truncado)`
  }
  return text.trim()
}
