import type { Transaction } from "@/lib/sales-context"

export function findClosestId(salesDatabase: Transaction[], targetId: number): number | null {
  const ids = salesDatabase.map((t) => t.numericId).sort((a, b) => Math.abs(a - targetId) - Math.abs(b - targetId))
  if (ids.length > 0 && Math.abs(ids[0] - targetId) <= 10) return ids[0]
  return null
}

/** Extract a numeric ID from any position in text */
export function extractId(text: string): number | null {
  const match = text.match(/#\s*(\d+)|venta\s+(\d+)|pedido\s+(\d+)|n[uú]mero\s+(\d+)|#?(\d{3,})/i)
  const raw = match?.[1] ?? match?.[2] ?? match?.[3] ?? match?.[4] ?? match?.[5]
  return raw ? Number.parseInt(raw) : null
}

/** Detect intent from natural language (ES + PT) */
export function detectIntent(text: string): string {
  const t = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

  // ── SYSTEM ──────────────────────────────────────────────────────────────
  if (/^(hola|hey|buenas|buenos dias|buenas tardes|buenas noches|hi|hello|oi|ola|bom dia|boa tarde|boa noite|e ai|eai)/.test(t)) return "greeting"
  if (/^(gracias|muchas gracias|thanks|ok gracias|listo|perfecto|genial|obrigad|valeu|vlw|show|otimo|excelente)/.test(t)) return "thanks"
  if (/^(adios|hasta luego|bye|chao|nos vemos|tchau|ate logo|falou|xau)/.test(t)) return "farewell"
  if (/\/limpiar|limpiar\s*(el\s*)?chat|borrar\s*(el\s*)?historial|limpar\s*(o\s*)?chat|apagar\s*(o\s*)?historico/.test(t)) return "clear"
  if (/\/ayuda|^ayuda$|^help$|^ajuda$|que\s*(puedes?\s*)?hacer|como\s*(te\s*)?uso|comandos|o que (voce|tu) (faz|sabe|pode)|como (te|voce) uso/.test(t)) return "help"

  if (/listar\s+pagos?\s+vencidos?/.test(t)) return "problematic"

  // ── BALANCE / SALDO ──────────────────────────────────────────────────────
  if (/(saldo|balance|cuanto\s*(tengo|hay|tiene)|dinero\s*(disponible|tengo|hay)|total\s*aprobado|cuanto\s*he\s*(cobrado|vendido|recibido)|ingresos?\s*(totales?|disponibles?)|ganancia\s*total|quanto\s*(tenho|eu\s*tenho|recebi|faturei|ganhei)|meu\s*saldo|dinheiro\s*disponivel|total\s*(aprovado|recebido)|receita\s*(total|disponivel))/.test(t)) return "balance"

  // ── TICKET MÉDIO ─────────────────────────────────────────────────────────
  if (/(ticket\s*(medio|promedio|mediano)|valor\s*(medio|promedio|mediano)\s*(de\s*)?(venta|transac|pedido)|media\s*(de\s*)?(vendas?|transac|pedidos?)|promedio\s*(de\s*)?(ventas?|transac|pedidos?)|qual\s*(e\s*)?(o\s*)?ticket|cuanto\s*es\s*el\s*ticket)/.test(t)) return "ticket_avg"

  // ── MELHOR / PIOR CLIENTE ────────────────────────────────────────────────
  if (/(melhor(es)?\s*cliente|top\s*cliente|cliente\s*(que\s*mais\s*comprou|com\s*mais\s*compra|vip|fiel)|quien\s*(es\s*mi\s*)?mejor\s*cliente|mejor(es)?\s*cliente|cliente\s*(que\s*mas\s*compro|con\s*mayor\s*compra)|top\s*(compradores?|clientes?)|rank(ing)?\s*(de\s*)?client)/.test(t)) return "best_clients"

  // ── TAXA DE APROVAÇÃO ────────────────────────────────────────────────────
  if (/(taxa\s*(de\s*)?(aprovac|aprovad|conversao|sucesso)|tasa\s*(de\s*)?(aprobacion|conversion|exito|exito)|quantos?\s*porcent\s*(aprovad|aprobad)|qual\s*(e\s*)?(a\s*)?(minha\s*)?taxa|como\s*(esta|vai)\s*(a\s*)?(taxa|aprobacion))/.test(t)) return "approval_rate"

  // ── VALOR EM RISCO / PENDENTE ────────────────────────────────────────────
  if (/(valor\s*(em\s*)?risco|en\s*riesgo|quanto\s*(esta|fica)\s*(em\s*risco|pendente|parado)|cuanto\s*esta\s*en\s*riesgo|dinero\s*en\s*riesgo|grana\s*(em\s*)?risco|valor\s*pendente|monto\s*(en\s*riesgo|pendiente))/.test(t)) return "at_risk"

  // ── MÉTODO MAIS USADO ────────────────────────────────────────────────────
  if (/(metodo\s*(mais\s*usado|mais\s*popular|favorito|preferido)|forma\s*(de\s*pagamento\s*)?(mais\s*usada|popular)|qual\s*(e\s*o\s*)?metodo\s*(mais|principal)|que\s*metodo\s*(se\s*usa\s*mas|es\s*el\s*mas\s*usado)|metodo\s*(mas\s*usado|popular|principal))/.test(t)) return "method_ranking"

  // ── CONTAGEM / QUANTAS VENDAS ────────────────────────────────────────────
  if (/(quantas?\s*(vendas?|transac|pedidos?)\s*(tenho|tive|fiz|ha)|cuantas?\s*(ventas?|transacc?|pedidos?)\s*(tengo|hay|hice|existen)|total\s*de\s*(vendas?|transacc?|pedidos?)|numero\s*(de\s*)?(vendas?|transac)|numero\s*de\s*(ventas?|transacc?))/.test(t)) return "total_count"

  // ── PROBLEMATIC LIST ────────────────────────────────────────────────────
  if (/(vencido|vencida|rechazado|problemas?|problema|pagos?\s*(fallidos?|malos?|atrasados?|pendientes?)|transacciones?\s*(malas?|problematicas?)|hay\s*algo\s*mal|algo\s*esta\s*(mal|raro)|alertas?|pagamentos?\s*(atrasados?|problematicos?|ruins?|falhos?)|tem\s*(algum\s*)?(problema|falha|erro)|ta\s*tudo\s*bem|esta\s*tudo\s*(certo|ok)|ha\s*(algo\s*)?(errado|mal))/.test(t)) return "problematic"

  // ── NON-APPROVED REPORT ─────────────────────────────────────────────────
  if (/(reporte|informe|relatorio|resumen)\s*(de\s*)?(ventas?\s*)?(no\s*aprobad|pendiente|sin\s*aprobar|nao\s*aprovad|sem\s*aprovac)/.test(t) ||
      /(ventas?\s*(no\s*aprobad|pendientes?|sin\s*aprobar)|vendas?\s*(nao\s*aprovad|pendentes?|sem\s*aprovac)|pendientes?\s*(de\s*aprobacion)?)/.test(t)) return "non_approved_report"

  // ── SUMMARY ─────────────────────────────────────────────────────────────
  if (/(resumen|resumo|resumen\s*(general|completo|total)|resumo\s*(geral|completo)|cuantas?\s*(ventas?|transacciones?)|estadisticas?|estatisticas?|overview|panorama\s*(general|geral)|como\s*(voy|estoy)|como\s*(estou|to\s*indo|anda)|como\s*(estan|van)\s*(las\s*)?(ventas?|pagos?|transac)|como\s*(estao|andam)\s*(as\s*)?(vendas?|pagamentos?|transac))/.test(t)) return "summary"

  // ── REFUNDS ─────────────────────────────────────────────────────────────
  if (/(devolucion|devoluciones?|reembolso|reembolsos?|estorno|chargebacks?|cuanto\s*(perdi|perdimos?|se\s*fue)\s*(en)?\s*(devoluciones?|reembolsos?)|quanto\s*(perdi|perdemos?)\s*(em)?\s*(devoluc|estorno|reembolso))/.test(t)) return "refunds"

  // ── BY METHOD ───────────────────────────────────────────────────────────
  if (/(ventas?\s*(con|por|via|de|usando?)\s*(tarjeta|transferencia|oxxo|paypal|efectivo|pix|boleto|cartao|credito|debito)|pagos?\s*(con|por|via)\s*(tarjeta|transferencia|oxxo|paypal|efectivo)|vendas?\s*(com|por|via|de|no)\s*(cartao|credito|debito|transferencia|boleto|pix|oxxo|paypal|dinheiro))/.test(t)) return "by_method"

  // ── BY DATE ─────────────────────────────────────────────────────────────
  if (/(ventas?\s*(de|en|del?)\s*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|hoy|ayer|esta\s*semana|este\s*mes)|pagos?\s*(de|en|del?)\s*(enero|febrero|marzo|octubre|noviembre|diciembre)|vendas?\s*(de|em|do|da)\s*(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|hoje|ontem|essa?\s*semana|esse?\s*mes))/.test(t)) return "by_date"

  // ── TOP SALES ───────────────────────────────────────────────────────────
  if (/(mayor(es)?\s*venta|mas\s*(alta|grande|valiosa)|top\s*ventas?|ventas?\s*mas\s*(alta|grande)|maior(es)?\s*(venda|transac|valor)|vendas?\s*(mais\s*(alta|valiosa|cara)|top)|top\s*5\s*(vendas?|transac))/.test(t)) return "top_sales"

  // ── BULK APPROVE ────────────────────────────────────────────────────────
  if (/(apro(bar|ba|bemos?)\s*(todas?|todo|todos?|en\s*masa|los?\s*pendientes?|las?\s*pendientes?)|recuperar\s*(todas?|todo|todos?)|poner\s*(todas?|todo)\s*(como\s*)?aprobad|aprovar\s*(todos?|tudo|todas?|os\s*pendentes?|em\s*massa)|recuperar\s*(todos?|tudo))/.test(t)) return "bulk_approve"

  // ── APPROVE by ID ───────────────────────────────────────────────────────
  if (/(apro(bar|ba|bo|be)\s*(la\s*)?venta|apro(bar|ba|bo|be)\s*#?\d|confirmar\s*(la\s*)?venta|autorizar\s*(la\s*)?venta|poner\s*(la\s*)?venta.*aprobad|validar\s*(la\s*)?venta|aprovar\s*(a\s*)?venda|aprovar\s*#?\d|confirmar\s*(a\s*)?venda)/.test(t)) return "approve_id"

  // ── CANCEL by ID ────────────────────────────────────────────────────────
  if (/(cancel(ar|a|o|e)\s*(la\s*)?venta|cancel(ar|a|o|e)\s*#?\d|rechazar\s*(la\s*)?venta|anular\s*(la\s*)?venta|cancelar\s*(a\s*)?venda|cancelar\s*#?\d|rejeitar\s*(a\s*)?venda)/.test(t)) return "cancel_id"

  // ── CANCEL by client ────────────────────────────────────────────────────
  if (/(cancel(ar|a|o|e)\s*(el\s*)?pedido\s*(de|del?)|cancel(ar|a|o|e)\s*(la\s*)?compra\s*(de|del?)|anular\s*(el\s*)?pedido\s*(de|del?)|cancelar\s*(o\s*)?pedido\s*(de|do|da))/.test(t)) return "cancel_by_client"

  // ── CHANGE STATUS ───────────────────────────────────────────────────────
  if (/(cambiar|modificar|actualizar|marcar|poner|cambiale|ponle|pon|marca|mudar|alterar|atualizar)\s*(el\s*|o\s*)?(estado\s*(de\s*)?)?(la\s*|a\s*)?(venta\s*|venda\s*)?#?\d/.test(t) ||
      /(estado\s*(de\s*)?(la\s*)?venta|status\s*(da\s*)?venda|status\s*(do\s*)?pedido)/.test(t)) return "change_status"

  // ── SEARCH by client ────────────────────────────────────────────────────
  if (/(buscar?|busca|encontrar?|encuentra|mostrar?|muestra|ver|dame|dime|que\s*(tiene|hay|paso)\s*(con|de)|buscar?|procurar?|encontrar?|mostrar?|ver\s*as?)\s*(cliente\s*)?[a-záéíóúñ]{3,}/.test(t) ||
      /(transacciones?\s*(de|del?|para)\s+[a-záéíóúñ]{3,}|ventas?\s*(de|del?|para)\s+[a-záéíóúñ]{3,}|vendas?\s*(de|do|da|para)\s+[a-záéíóúñ]{3,}|pedidos?\s*(de|del?|para)\s+[a-záéíóúñ]{3,})/.test(t)) return "search_client"

  // ── STATUS CHECK for specific ID ────────────────────────────────────────
  if (/(como\s*(esta|quedo|viene|va)\s*(la\s*)?venta|que\s*(paso|ocurrio|estado\s*tiene)\s*(con\s*)?(la\s*)?venta|estado\s*(de\s*)?(la\s*)?venta|qual\s*(e\s*)?(o\s*)?status\s*(da\s*)?venda|como\s*(esta|ficou)\s*(a\s*)?venda|o\s*que\s*aconteceu\s*com\s*(a\s*)?venda)/.test(t)) return "status_check"

  return "unknown"
}

/** Extract client name from natural language */
export function extractClientName(text: string): string {
  const patterns = [
    /(?:buscar?|busca|de|del?|para|cliente)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/,
    /(?:transacciones?|ventas?|compras?|pedidos?)\s+(?:de|del?|para)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
    /(?:que\s+(?:tiene|hay|paso)\s+con)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
    /(?:buscar?\s+cliente\s+)([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) return m[1].trim()
  }
  const fallback = text.replace(/(buscar?|busca|cliente|ventas?|transacciones?|mostrar?|ver|dame|dime)/gi, "").trim()
  return fallback.length > 2 ? fallback : ""
}

/** Extract month keyword */
export function extractMonth(text: string): string {
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  const t = text.toLowerCase()
  for (let i = 0; i < monthNames.length; i++) {
    if (t.includes(monthNames[i]) || t.includes(months[i])) return months[i]
  }
  return ""
}
