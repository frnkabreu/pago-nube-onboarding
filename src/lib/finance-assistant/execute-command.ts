import type { PaymentStatus } from "@/lib/sales-context"
import type { FinanceAssistantDeps } from "./deps"
import { fmtMXN } from "./fmt"
import { detectIntent, extractClientName, extractId, extractMonth, findClosestId } from "./intents"
import { CLEAR_CHAT_SENTINEL, type ProcessCommandResult } from "./types"

/**
 * Processa texto do utilizador com regras locais (ES/PT) e muta estado via deps.
 */
export function processCommand(input: string, deps: FinanceAssistantDeps): ProcessCommandResult {
  const {
    salesDatabase,
    updateTransactionStatus,
    bulkUpdateStatus,
    getProblematicTransactions,
    getNonApprovedTransactions,
    getApprovedTotal,
    getProblematicTotal,
    getTransactionById,
    findTransactionByClient,
  } = deps

  const lowerInput = input.toLowerCase().trim()
  const normalizedInput = lowerInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const intent = detectIntent(input)

  // ── SYSTEM ──────────────────────────────────────────────────────────────

  if (intent === "clear") return { content: CLEAR_CHAT_SENTINEL }

  if (intent === "greeting") {
    const approved = salesDatabase.filter((t) => t.status === "Aprobado").length
    const problematic = getProblematicTransactions()
    const greetings = ["¡Hola!", "¡Buenas!", "¡Hey!"]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    let msg = `${greeting} Soy tu asistente financiero.\n\nResumen rápido:\n- Transacciones aprobadas: **${approved}**`
    if (problematic.length > 0) msg += `\n- ⚠️ Pagos problemáticos: **${problematic.length}** (${fmtMXN(getProblematicTotal())})`
    msg += `\n\n¿En qué te puedo ayudar hoy?`
    return {
      content: msg,
      actions: problematic.length > 0
        ? [{ label: "Ver problemáticos", command: "listar pagos vencidos", variant: "outline" }]
        : [{ label: "Ver resumen", command: "resumen general", variant: "outline" }],
    }
  }

  if (intent === "thanks") {
    return { content: "¡Con gusto! Si necesitas algo más, aquí estoy. 😊" }
  }

  if (intent === "farewell") {
    return { content: "¡Hasta luego! Recuerda revisar tus pagos pendientes. 👋" }
  }

  if (intent === "help") {
    return {
      content: `**¿Qué puedo hacer por ti?** (ES/PT)\n\n**💰 Saldo y finanzas:**\n- "¿Cuánto tengo disponible?" / "Quanto tenho?"\n- "Ticket promedio" / "Ticket médio"\n- "Taxa de aprobación" / "Tasa de aprobación"\n- "Valor en riesgo" / "Valor em risco"\n\n**📊 Análisis:**\n- "Resumen general" / "Resumo geral"\n- "Mejores clientes" / "Melhores clientes"\n- "Método más usado" / "Método mais usado"\n- "¿Cuántas ventas tengo?"\n- "Devoluciones" / "Devoluções"\n- "Ventas de octubre" / "Vendas de outubro"\n- "Ventas con tarjeta"\n\n**⚠️ Problemas:**\n- "¿Hay algún problema?" / "Tem algum problema?"\n- "Reporte de ventas no aprobadas"\n\n**✅ Aprobar:**\n- "Aprobar venta #142" / "Aprovar venda #142"\n- "Aprobar todas las pendientes"\n\n**❌ Cancelar:**\n- "Cancelar venta #165"\n- "Cancelar el pedido de Sofía"\n\n**🔍 Buscar:**\n- "Buscar cliente Carlos"\n- "¿Qué tiene Gabriela?"\n\n**🔄 Cambiar estado:**\n- "Marcar venta #200 como Vencido"\n\n**🧹 Sistema:**\n- "/limpiar" — borrar historial`,
    }
  }

  // ── BALANCE ──────────────────────────────────────────────────────────────

  if (intent === "balance") {
    const total = getApprovedTotal()
    const approved = salesDatabase.filter((t) => t.status === "Aprobado")
    const avgTicket = approved.length > 0 ? total / approved.length : 0
    return {
      content: `**💰 Saldo Total Aprobado**\n\n**${fmtMXN(total)}**\n\nTransacciones aprobadas: ${approved.length} de ${salesDatabase.length}\nTicket promedio: ${fmtMXN(avgTicket)}`,
      actions: [{ label: "Ver resumen completo", command: "resumen general", variant: "outline" }],
    }
  }

  // ── REFUNDS ──────────────────────────────────────────────────────────────

  if (intent === "refunds") {
    const refunds = salesDatabase.filter((t) => t.status === "Devolución total" || t.status === "Devolución parcial")
    const total = refunds.reduce((s, t) => s + t.value, 0)
    const full = refunds.filter((t) => t.status === "Devolución total")
    const partial = refunds.filter((t) => t.status === "Devolución parcial")
    return {
      content: `**↩️ Devoluciones**\n\nTotal en devoluciones: **${fmtMXN(total)}**\n\n- Devolución total: ${full.length} ventas (${fmtMXN(full.reduce((s, t) => s + t.value, 0))})\n- Devolución parcial: ${partial.length} ventas (${fmtMXN(partial.reduce((s, t) => s + t.value, 0))})\n\n${refunds.length === 0 ? "¡Sin devoluciones!" : refunds.slice(0, 5).map((t) => `- ${t.id} | ${t.client} | ${fmtMXN(t.value)}`).join("\n")}`,
    }
  }

  // ── BY METHOD ────────────────────────────────────────────────────────────

  if (intent === "by_method") {
    const methodKeywords: Record<string, string> = {
      tarjeta: "Tarjeta",
      transferencia: "Transferencia",
      oxxo: "OXXO",
      paypal: "PayPal",
      efectivo: "Efectivo",
    }
    const matched = Object.entries(methodKeywords).find(([k]) => normalizedInput.includes(k))
    if (matched) {
      const [, method] = matched
      const results = salesDatabase.filter((t) => t.method.toLowerCase().includes(method.toLowerCase()))
      const total = results.filter((t) => t.status === "Aprobado").reduce((s, t) => s + t.value, 0)
      return {
        content: `**💳 Ventas vía ${method}**\n\nTotal de transacciones: ${results.length}\nAprobadas: ${results.filter((t) => t.status === "Aprobado").length}\nTotal aprobado: **${fmtMXN(total)}**\n\n${results.slice(0, 8).map((t) => `- ${t.id} | ${t.client} | ${fmtMXN(t.value)} | ${t.status}`).join("\n")}${results.length > 8 ? `\n... y ${results.length - 8} más` : ""}`,
      }
    }
  }

  // ── BY DATE ──────────────────────────────────────────────────────────────

  if (intent === "by_date") {
    if (normalizedInput.includes("hoy")) {
      const today = new Date()
      const day = today.getDate()
      const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
      const monthKey = monthNames[today.getMonth()]
      const results = salesDatabase.filter((t) => t.date.includes(monthKey) && t.date.includes(String(day)))
      return {
        content: results.length > 0
          ? `**📅 Ventas de hoy (${day} ${monthKey})**\n\n${results.map((t) => `- ${t.id} | ${t.client} | ${fmtMXN(t.value)} | ${t.status}`).join("\n")}`
          : "No encontré ventas registradas para hoy.",
      }
    }
    const month = extractMonth(input)
    if (month) {
      const results = salesDatabase.filter((t) => t.date.toLowerCase().includes(month))
      const total = results.filter((t) => t.status === "Aprobado").reduce((s, t) => s + t.value, 0)
      return {
        content: results.length > 0
          ? `**📅 Ventas de ${month}**\n\n${results.length} transacciones — Aprobado: **${fmtMXN(total)}**\n\n${results.slice(0, 10).map((t) => `- ${t.id} | ${t.client} | ${fmtMXN(t.value)} | ${t.status}`).join("\n")}${results.length > 10 ? `\n... y ${results.length - 10} más` : ""}`
          : `No encontré ventas en ${month}.`,
      }
    }
  }

  // ── TOP SALES ────────────────────────────────────────────────────────────

  if (intent === "top_sales") {
    const top = [...salesDatabase].sort((a, b) => b.value - a.value).slice(0, 5)
    return {
      content: `**🏆 Top 5 Ventas más altas**\n\n${top.map((t, i) => `${i + 1}. ${t.id} | ${t.client}\n   ${fmtMXN(t.value)} | ${t.status}`).join("\n\n")}`,
    }
  }

  // ── STATUS CHECK by ID ───────────────────────────────────────────────────

  if (intent === "status_check") {
    const id = extractId(input)
    if (id) {
      const t = getTransactionById(id)
      if (t) {
        return {
          content: `**📋 Venta #${id}**\n\nCliente: ${t.client}\nMétodo: ${t.method}\nFecha: ${t.date}\nValor: ${fmtMXN(t.value)}\nEstado actual: **${t.status}**`,
          actions: t.status !== "Aprobado"
            ? [{ label: "Aprobar esta venta", command: `aprobar venta #${id}`, variant: "default" }]
            : undefined,
        }
      }
      return { content: `No encontré la venta #${id}.` }
    }
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────

  if (intent === "summary") {
    const total = salesDatabase.length
    const approved = salesDatabase.filter((t) => t.status === "Aprobado")
    const overdue = salesDatabase.filter((t) => t.status === "Vencido")
    const rejected = salesDatabase.filter((t) => t.status === "Rechazado")
    const refunds = salesDatabase.filter((t) => t.status.includes("Devolución"))
    const approvedTotal = getApprovedTotal()
    const atRisk = [...overdue, ...rejected].reduce((s, t) => s + t.value, 0)

    return {
      content: `**📊 Resumen General**\n\n💰 Saldo aprobado: **${fmtMXN(approvedTotal)}**\n⚠️ En riesgo: **${fmtMXN(atRisk)}**\n\n**Por estado:**\n✅ Aprobadas: ${approved.length}\n🔴 Vencidas: ${overdue.length}\n❌ Rechazadas: ${rejected.length}\n↩️ Devoluciones: ${refunds.length}\n\nTotal: ${total} transacciones`,
      actions: [
        { label: "Ver problemáticos", command: "listar pagos vencidos", variant: "outline" },
        { label: "Reporte no aprobadas", command: "reporte de ventas no aprobadas", variant: "outline" },
      ],
    }
  }

  // ── PROBLEMATIC ──────────────────────────────────────────────────────────

  if (intent === "problematic") {
    const problematic = getProblematicTransactions()
    const total = getProblematicTotal()
    if (problematic.length === 0) {
      return { content: "**✅ ¡Todo en orden!**\n\nNo hay pagos problemáticos. Todas tus transacciones están al día." }
    }
    return {
      content: `**⚠️ Pagos Problemáticos**\n\nTotal en riesgo: **${fmtMXN(total)}**\n\n${problematic.slice(0, 15).map((t) => `- ${t.id} | ${t.client}\n  ${fmtMXN(t.value)} | ${t.status}`).join("\n\n")}${problematic.length > 15 ? `\n\n... y ${problematic.length - 15} más` : ""}`,
      actions: [{ label: "Aprobar todos", command: "aprobar todas las pendientes", variant: "default" }],
    }
  }

  // ── NON-APPROVED REPORT ──────────────────────────────────────────────────

  if (intent === "non_approved_report") {
    const nonApproved = getNonApprovedTransactions()
    const totalAtRisk = nonApproved.reduce((s, t) => s + t.value, 0)
    const byStatus: Record<string, { count: number; total: number }> = {}
    for (const t of nonApproved) {
      if (!byStatus[t.status]) byStatus[t.status] = { count: 0, total: 0 }
      byStatus[t.status].count++
      byStatus[t.status].total += t.value
    }
    let report = `**📋 Reporte de Ventas No Aprobadas**\n\nTotal pendientes: **${nonApproved.length}**\nEn riesgo: **${fmtMXN(totalAtRisk)}**\n\n**Por estado:**\n`
    for (const [status, data] of Object.entries(byStatus)) {
      report += `${status}: ${data.count} (${fmtMXN(data.total)})\n`
    }
    report += `\n**Lista:**\n${nonApproved.slice(0, 15).map((t) => `${t.id} | ${t.client} | ${fmtMXN(t.value)}`).join("\n")}`
    if (nonApproved.length > 15) report += `\n... y ${nonApproved.length - 15} más`
    return {
      content: report,
      actions: [{ label: "Recuperar Todos", command: "aprobar todas las pendientes", variant: "default" }],
    }
  }

  // ── BULK APPROVE ─────────────────────────────────────────────────────────

  if (intent === "bulk_approve") {
    const problematic = salesDatabase.filter((t) => t.status === "Vencido" || t.status === "Rechazado")
    if (problematic.length === 0) return { content: "No hay transacciones vencidas o rechazadas para aprobar." }
    const ids = problematic.map((t) => t.numericId)
    const count = bulkUpdateStatus(ids, "Aprobado")
    const totalVal = problematic.reduce((s, t) => s + t.value, 0)
    return {
      content: `**✅ Aprobación Masiva Completada**\n\n${count} transacciones actualizadas a "Aprobado".\nValor recuperado: **${fmtMXN(totalVal)}**\n\nLas filas se destacaron en la tabla.`,
    }
  }

  // ── APPROVE by ID ────────────────────────────────────────────────────────

  if (intent === "approve_id") {
    const id = extractId(input)
    if (!id) return { content: "No encontré el número de venta. Ejemplo: \"Aprobar venta #142\"" }
    const transaction = getTransactionById(id)
    if (!transaction) {
      const closest = findClosestId(salesDatabase, id)
      if (closest) {
        const ct = getTransactionById(closest)
        return {
          content: `No encontré la venta #${id}. ¿Quisiste decir la #${closest}? (${ct?.client})`,
          actions: [{ label: `Sí, aprobar #${closest}`, command: `aprobar venta #${closest}`, variant: "default" }],
        }
      }
      return { content: `No encontré la venta #${id} en el sistema.` }
    }
    updateTransactionStatus(id, "Aprobado")
    return {
      content: `**✅ Venta #${id} Aprobada**\n\n${transaction.client} — ${fmtMXN(transaction.value)}\n\nLa fila se destacó en la tabla.`,
    }
  }

  // ── CANCEL by ID ─────────────────────────────────────────────────────────

  if (intent === "cancel_id") {
    const id = extractId(input)
    if (!id) return { content: "No encontré el número de venta. Ejemplo: \"Cancelar venta #165\"" }
    const transaction = getTransactionById(id)
    if (!transaction) {
      const closest = findClosestId(salesDatabase, id)
      if (closest) {
        const ct = getTransactionById(closest)
        return {
          content: `No encontré la venta #${id}. ¿Quisiste decir la #${closest}? (${ct?.client})`,
          actions: [{ label: `Sí, cancelar #${closest}`, command: `cancelar venta #${closest}`, variant: "destructive" }],
        }
      }
      return { content: `No encontré la venta #${id} en el sistema.` }
    }
    updateTransactionStatus(id, "Rechazado")
    return {
      content: `**❌ Venta #${id} Cancelada**\n\n${transaction.client} — ${fmtMXN(transaction.value)} marcada como "Rechazado".\n\nLa fila se destacó en la tabla.`,
    }
  }

  // ── CANCEL by client ─────────────────────────────────────────────────────

  if (intent === "cancel_by_client") {
    const nameMatch = input.match(/(?:cancel(?:ar|e)|anular)\s+(?:el\s+)?pedido\s+(?:de(?:l?)\s+)?(.+)/i)
    const clientName = nameMatch?.[1]?.trim() ?? ""
    if (!clientName) return { content: "No entendí el nombre del cliente. Ejemplo: \"Cancelar el pedido de Carlos López\"" }
    const results = findTransactionByClient(clientName)
    if (results.length === 0) return { content: `No encontré transacciones para "${clientName}".` }
    if (results.length === 1) {
      updateTransactionStatus(results[0].numericId, "Rechazado")
      return { content: `**❌ Venta #${results[0].numericId} Cancelada**\n\n${results[0].client} — ${fmtMXN(results[0].value)} marcada como "Rechazado".` }
    }
    return {
      content: `Encontré ${results.length} transacciones para "${clientName}". ¿Cuál cancelar?\n\n${results.slice(0, 5).map((t) => `- ${t.id} | ${fmtMXN(t.value)} | ${t.status}`).join("\n")}`,
      actions: results.slice(0, 3).map((t) => ({ label: `Cancelar ${t.id}`, command: `cancelar venta #${t.numericId}`, variant: "destructive" as const })),
    }
  }

  // ── CHANGE STATUS ────────────────────────────────────────────────────────

  if (intent === "change_status") {
    const statusMatch = input.match(
      /(?:cambiar|modificar|actualizar|marcar|poner|marca|pon)\s+(?:(?:el\s+)?estado\s+(?:de\s+)?)?(?:(?:la\s+)?venta\s+)?#?\s*(\d+)\s+(?:a|como|para)\s+(.+)/i,
    )
    if (statusMatch) {
      const id = Number.parseInt(statusMatch[1])
      const newStatusInput = statusMatch[2].trim()
      const transaction = getTransactionById(id)
      if (!transaction) return { content: `No encontré la venta #${id}.` }
      const validStatuses: PaymentStatus[] = ["Aprobado", "Vencido", "Rechazado", "Devolución total", "Devolución parcial"]
      const matchedStatus = validStatuses.find(
        (s) => s.toLowerCase() === newStatusInput.toLowerCase() || s.toLowerCase().includes(newStatusInput.toLowerCase()),
      )
      if (!matchedStatus) return { content: `Estado no reconocido. Los válidos son:\n${validStatuses.join(", ")}` }
      updateTransactionStatus(id, matchedStatus)
      return { content: `**🔄 Estado Actualizado**\n\nVenta #${id} (${transaction.client}) → **${matchedStatus}**\n\nLa fila se destacó en la tabla.` }
    }
    return { content: "No entendí bien el cambio. Ejemplo: \"Marcar venta #200 como Vencido\"" }
  }

  // ── SEARCH CLIENT ────────────────────────────────────────────────────────

  if (intent === "search_client") {
    const clientName = extractClientName(input)
    if (!clientName) return { content: "No entendí el nombre. Ejemplo: \"Buscar cliente Sofía\"" }
    const results = findTransactionByClient(clientName)
    if (results.length === 0) return { content: `No encontré transacciones para "${clientName}".` }
    const approvedTotal = results.filter((t) => t.status === "Aprobado").reduce((s, t) => s + t.value, 0)
    return {
      content: `**🔍 Resultados: "${clientName}"**\n\n${results.length} transacciones — Aprobado: ${fmtMXN(approvedTotal)}\n\n${results.slice(0, 10).map((t) => `- ${t.id} | ${fmtMXN(t.value)} | ${t.status} | ${t.date}`).join("\n")}${results.length > 10 ? `\n... y ${results.length - 10} más` : ""}`,
      actions: results.some((t) => t.status !== "Aprobado")
        ? results.filter((t) => t.status !== "Aprobado").slice(0, 2).map((t) => ({
            label: `Aprobar ${t.id}`,
            command: `aprobar venta #${t.numericId}`,
            variant: "default" as const,
          }))
        : undefined,
    }
  }

  // ── TICKET MÉDIO ─────────────────────────────────────────────────────────

  if (intent === "ticket_avg") {
    const approved = salesDatabase.filter((t) => t.status === "Aprobado")
    if (approved.length === 0) return { content: "No hay ventas aprobadas para calcular el ticket promedio." }
    const total = getApprovedTotal()
    const avg = total / approved.length
    const max = Math.max(...approved.map((t) => t.value))
    const min = Math.min(...approved.map((t) => t.value))
    return {
      content: `**🎯 Ticket Promedio**\n\n**${fmtMXN(avg)}**\n\nBasado en ${approved.length} ventas aprobadas\n- Venta más alta: ${fmtMXN(max)}\n- Venta más baja: ${fmtMXN(min)}`,
    }
  }

  // ── MELHORES CLIENTES ────────────────────────────────────────────────────

  if (intent === "best_clients") {
    const clientMap: Record<string, { total: number; count: number }> = {}
    for (const t of salesDatabase.filter((t) => t.status === "Aprobado")) {
      if (!clientMap[t.client]) clientMap[t.client] = { total: 0, count: 0 }
      clientMap[t.client].total += t.value
      clientMap[t.client].count++
    }
    const ranked = Object.entries(clientMap)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
    if (ranked.length === 0) return { content: "No hay datos de clientes aprobados aún." }
    return {
      content: `**👑 Top 5 Mejores Clientes**\n\n${ranked.map(([name, d], i) => `${i + 1}. **${name}**\n   ${fmtMXN(d.total)} em ${d.count} compra${d.count > 1 ? "s" : ""}`).join("\n\n")}`,
      actions: [{ label: "Ver resumen completo", command: "resumen general", variant: "outline" }],
    }
  }

  // ── TAXA DE APROVAÇÃO ────────────────────────────────────────────────────

  if (intent === "approval_rate") {
    const total = salesDatabase.length
    const approved = salesDatabase.filter((t) => t.status === "Aprobado").length
    const rejected = salesDatabase.filter((t) => t.status === "Rechazado").length
    const overdue = salesDatabase.filter((t) => t.status === "Vencido").length
    const refunds = salesDatabase.filter((t) => t.status.includes("Devolución")).length
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0
    return {
      content: `**📈 Taxa de Aprobación**\n\n**${rate}%** de las transacciones fueron aprobadas\n\n- ✅ Aprobadas: ${approved} (${rate}%)\n- ❌ Rechazadas: ${rejected} (${Math.round((rejected / total) * 100)}%)\n- ⏰ Vencidas: ${overdue} (${Math.round((overdue / total) * 100)}%)\n- ↩️ Devoluciones: ${refunds} (${Math.round((refunds / total) * 100)}%)`,
      actions: rate < 70
        ? [{ label: "Ver problemáticos", command: "listar pagos vencidos", variant: "outline" }]
        : undefined,
    }
  }

  // ── VALOR EM RISCO ───────────────────────────────────────────────────────

  if (intent === "at_risk") {
    const overdue = salesDatabase.filter((t) => t.status === "Vencido")
    const rejected = salesDatabase.filter((t) => t.status === "Rechazado")
    const atRisk = [...overdue, ...rejected]
    const totalRisk = atRisk.reduce((s, t) => s + t.value, 0)
    return {
      content: `**⚠️ Valor en Riesgo**\n\n**${fmtMXN(totalRisk)}** en transacciones problemáticas\n\n- ⏰ Vencidas: ${overdue.length} (${fmtMXN(overdue.reduce((s, t) => s + t.value, 0))})\n- ❌ Rechazadas: ${rejected.length} (${fmtMXN(rejected.reduce((s, t) => s + t.value, 0))})`,
      actions: atRisk.length > 0
        ? [{ label: "Aprobar todas", command: "aprobar todas las pendientes", variant: "default" }]
        : undefined,
    }
  }

  // ── MÉTODO MAIS USADO ────────────────────────────────────────────────────

  if (intent === "method_ranking") {
    const methodMap: Record<string, { count: number; total: number }> = {}
    for (const t of salesDatabase) {
      if (!methodMap[t.method]) methodMap[t.method] = { count: 0, total: 0 }
      methodMap[t.method].count++
      methodMap[t.method].total += t.value
    }
    const ranked = Object.entries(methodMap).sort((a, b) => b[1].count - a[1].count)
    return {
      content: `**💳 Métodos de Pago**\n\n${ranked.map(([method, d], i) => `${i + 1}. **${method}**: ${d.count} transacciones — ${fmtMXN(d.total)}`).join("\n")}`,
    }
  }

  // ── CONTAGEM TOTAL ───────────────────────────────────────────────────────

  if (intent === "total_count") {
    const total = salesDatabase.length
    const approved = salesDatabase.filter((t) => t.status === "Aprobado").length
    const pending = salesDatabase.filter((t) => t.status !== "Aprobado").length
    return {
      content: `**🔢 Total de Transacciones**\n\n**${total}** transacciones en total\n\n- ✅ Aprobadas: **${approved}**\n- ⏳ Pendientes/Problemáticas: **${pending}**`,
      actions: [{ label: "Ver resumen", command: "resumen general", variant: "outline" }],
    }
  }

  // ── UNKNOWN ──────────────────────────────────────────────────────────────

  return {
    content: `No entendí bien tu pregunta 🤔\n\nPuedes preguntarme en español o portugués, por ejemplo:\n\n- "¿Cuánto tengo disponible?" / "Quanto tenho disponível?"\n- "¿Hay algún problema?" / "Tem algum problema?"\n- "Ticket promedio" / "Ticket médio"\n- "Mejores clientes" / "Melhores clientes"\n- "Tasa de aprobación" / "Taxa de aprovação"\n- "Ventas de octubre" / "Vendas de outubro"\n- "Buscar cliente Sofía"\n\nEscribe **ayuda** para ver todo lo que sé hacer.`,
  }
}
