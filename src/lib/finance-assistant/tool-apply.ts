import type { PaymentStatus } from "@/lib/sales-context"
import type { FinanceAssistantDeps } from "./deps"
import { fmtMXN } from "./fmt"
import { extractId } from "./intents"
import type { FinanceToolCall, ProcessCommandResult } from "./types"

const VALID: PaymentStatus[] = ["Aprobado", "Vencido", "Rechazado", "Devolución total", "Devolución parcial"]

function isPaymentStatus(s: string): s is PaymentStatus {
  return (VALID as string[]).includes(s)
}

/**
 * Aplica chamadas de ferramenta devolvidas pelo BFF (Gemini) no estado local.
 */
export function applyFinanceToolCalls(calls: FinanceToolCall[], deps: FinanceAssistantDeps): ProcessCommandResult {
  const lines: string[] = []
  for (const call of calls) {
    const args = call.args ?? {}
    switch (call.name) {
      case "approve_sale": {
        const id = typeof args.saleId === "number" ? args.saleId : Number(args.saleId)
        if (!Number.isFinite(id)) {
          lines.push("approve_sale: saleId inválido")
          break
        }
        const t = deps.getTransactionById(id)
        if (!t) {
          lines.push(`No se encontró la venta #${id}`)
          break
        }
        deps.updateTransactionStatus(id, "Aprobado")
        lines.push(`**✅ Venta #${id} aprobada** — ${t.client} (${fmtMXN(t.value)})`)
        break
      }
      case "reject_sale": {
        const id = typeof args.saleId === "number" ? args.saleId : Number(args.saleId)
        if (!Number.isFinite(id)) {
          lines.push("reject_sale: saleId inválido")
          break
        }
        const t = deps.getTransactionById(id)
        if (!t) {
          lines.push(`No se encontró la venta #${id}`)
          break
        }
        deps.updateTransactionStatus(id, "Rechazado")
        lines.push(`**❌ Venta #${id} rechazada** — ${t.client}`)
        break
      }
      case "bulk_approve_problematic": {
        const problematic = deps.salesDatabase.filter((t) => t.status === "Vencido" || t.status === "Rechazado")
        if (problematic.length === 0) {
          lines.push("No hay transacciones vencidas o rechazadas para aprobar.")
          break
        }
        const ids = problematic.map((t) => t.numericId)
        const count = deps.bulkUpdateStatus(ids, "Aprobado")
        const totalVal = problematic.reduce((s, t) => s + t.value, 0)
        lines.push(`**✅ Aprobación masiva:** ${count} transacciones → Aprobado. Total recuperado: ${fmtMXN(totalVal)}`)
        break
      }
      case "change_sale_status": {
        const id = typeof args.saleId === "number" ? args.saleId : Number(args.saleId)
        const statusRaw = typeof args.newStatus === "string" ? args.newStatus : ""
        if (!Number.isFinite(id) || !statusRaw) {
          lines.push("change_sale_status: saleId o newStatus inválido")
          break
        }
        const matched = VALID.find(
          (s) => s.toLowerCase() === statusRaw.toLowerCase() || s.toLowerCase().includes(statusRaw.toLowerCase()),
        )
        if (!matched || !isPaymentStatus(matched)) {
          lines.push(`Estado no reconocido: ${statusRaw}`)
          break
        }
        const t = deps.getTransactionById(id)
        if (!t) {
          lines.push(`No se encontró la venta #${id}`)
          break
        }
        deps.updateTransactionStatus(id, matched)
        lines.push(`**🔄 Venta #${id}** → ${matched}`)
        break
      }
      case "noop":
        break
      default:
        lines.push(`Ferramenta desconhecida: ${call.name}`)
    }
  }
  return {
    content: lines.length > 0 ? lines.join("\n\n") : "Listo.",
  }
}

/** Se o modelo devolver texto com um comando reconhecível, reenvia ao processCommand rule-based. */
export function tryExtractCommandFromLlmText(text: string): string | null {
  const t = text.trim()
  const id = extractId(t)
  if (/aprobar|aprova|approve/i.test(t) && id) return `aprobar venta #${id}`
  if (/cancelar|cancel|rechazar/i.test(t) && id) return `cancelar venta #${id}`
  return null
}
