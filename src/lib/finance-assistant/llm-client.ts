import type { LlmChatResponse } from "./types"

export type ChatTurn = { role: "user" | "model"; content: string }

export type LlmRequestBody = {
  messages: ChatTurn[]
  /** Resumo opcional dos dados de vendas para contexto do modelo */
  salesSummary?: string
}

/**
 * URL base do BFF (ex.: proxy `/api/finance-assistant` em dev ou deploy separado).
 * Sem variável: modo só regras.
 */
export function getFinanceAssistantApiUrl(): string | undefined {
  const u = import.meta.env.VITE_FINANCE_ASSISTANT_API_URL?.trim()
  return u || undefined
}

export async function postFinanceAssistantLlm(body: LlmRequestBody): Promise<LlmChatResponse> {
  const base = getFinanceAssistantApiUrl()
  if (!base) {
    throw new Error("VITE_FINANCE_ASSISTANT_API_URL no está configurada")
  }
  const url = base.endsWith("/") ? `${base}chat` : `${base}/chat`
  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg === "Failed to fetch" || e instanceof TypeError) {
      throw new Error(
        `${msg}. En local usa \`VITE_FINANCE_ASSISTANT_API_URL=/api/finance-assistant\` (misma origin); evita http://127.0.0.1:8788 desde localhost. ¿\`npm run dev\` y \`npm run assistant-server\` en marcha?`,
      )
    }
    throw e
  }
  if (!res.ok) {
    const errText = (await res.text().catch(() => "")).trim()
    let message: string
    try {
      const j = JSON.parse(errText) as { error?: string }
      message = typeof j?.error === "string" && j.error.trim() ? j.error.trim() : errText
    } catch {
      message = errText
    }
    if (!message) {
      message = `HTTP ${res.status} ${res.statusText || ""} (respuesta vacía). ¿Está \`npm run assistant-server\` en marcha en 127.0.0.1:8788? Prueba: npm run assistant:probe`
    } else if (!message.includes("HTTP ") && res.status >= 400) {
      message = `${message} [HTTP ${res.status}]`
    }
    throw new Error(message)
  }
  return (await res.json()) as LlmChatResponse
}
