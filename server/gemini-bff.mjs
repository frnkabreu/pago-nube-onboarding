/**
 * BFF mínimo para o assistente financeiro (Gemini + function calling).
 * Uso: GEMINI_API_KEY=... node server/gemini-bff.mjs
 * Porta: FINANCE_ASSISTANT_PORT (default 8788)
 *
 * Em dev, o Vite faz proxy de /api/finance-assistant → http://127.0.0.1:8788
 *
 * Carrega `.env` na raiz do projeto (sem dependência dotenv): útil para
 * GEMINI_API_KEY no ficheiro — variáveis já definidas no ambiente têm prioridade.
 */
import http from "node:http"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = join(__dirname, "..", ".env")
if (existsSync(envFile)) {
  let raw = readFileSync(envFile, "utf8")
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const eq = t.indexOf("=")
    if (eq <= 0) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    // GEMINI_API_KEY: sempre preferir valor do .env se existir (corrige export GEMINI_API_KEY= vazio no shell)
    if (key === "GEMINI_API_KEY" && val) {
      process.env.GEMINI_API_KEY = val
    } else if (process.env[key] === undefined) {
      process.env[key] = val
    }
  }
}

const PORT = Number(process.env.FINANCE_ASSISTANT_PORT || 8788)
const API_KEY = (process.env.GEMINI_API_KEY ?? "").trim()
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash"

const FUNCTION_DECLARATIONS = [
  {
    name: "approve_sale",
    description: "Aprobar una venta por su ID numérico",
    parameters: {
      type: "object",
      properties: {
        saleId: { type: "number", description: "ID numérico de la venta (ej. 142)" },
      },
      required: ["saleId"],
    },
  },
  {
    name: "reject_sale",
    description: "Rechazar o marcar como rechazada una venta por ID",
    parameters: {
      type: "object",
      properties: {
        saleId: { type: "number" },
      },
      required: ["saleId"],
    },
  },
  {
    name: "bulk_approve_problematic",
    description: "Aprobar en masa todas las ventas con estado Vencido o Rechazado",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "change_sale_status",
    description: "Cambiar el estado de una venta",
    parameters: {
      type: "object",
      properties: {
        saleId: { type: "number" },
        newStatus: {
          type: "string",
          description: "Uno de: Aprobado, Vencido, Rechazado, Devolución total, Devolución parcial",
        },
      },
      required: ["saleId", "newStatus"],
    },
  },
]

function send(res, status, body, headers = {}) {
  const json = typeof body === "string" ? body : JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...headers,
  })
  res.end(json)
}

async function callGemini(contents, toolsEnabled) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`
  const body = {
    systemInstruction: {
      parts: [
        {
          text: `Eres un asistente financiero para comerciantes (Tienda Nube / Pago Nube). Responde en español o portugués según el usuario. Sé breve y profesional. Si el usuario pide acciones sobre ventas, usa las herramientas. No inventes IDs: si faltan datos, pregunta.`,
        },
      ],
    },
    contents,
    ...(toolsEnabled
      ? {
          tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
        }
      : {}),
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await r.json()
  if (!r.ok) {
    const msg = data?.error?.message || JSON.stringify(data)
    throw new Error(msg)
  }
  return data
}

function parseGeminiResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts || []
  const toolCalls = []
  let text = ""
  for (const p of parts) {
    if (p.text) text += p.text
    if (p.functionCall) {
      const fc = p.functionCall
      toolCalls.push({
        name: fc.name,
        args: fc.args && typeof fc.args === "object" ? fc.args : {},
      })
    }
  }
  return { reply: text.trim() || undefined, toolCalls: toolCalls.length ? toolCalls : undefined }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, "")
    return
  }
  if (req.method === "GET" && req.url === "/health") {
    send(res, 200, { ok: true, geminiKeyConfigured: Boolean(API_KEY) })
    return
  }
  if (req.method !== "POST" || req.url !== "/chat") {
    send(res, 404, { error: "Not found" })
    return
  }
  if (!API_KEY) {
    send(res, 503, {
      error:
        "GEMINI_API_KEY no configurada en el proceso del BFF. Pon la clave en `.env` (raíz del proyecto), sin comillas, y reinicia `npm run assistant-server`. Comprueba: curl http://127.0.0.1:8788/health → geminiKeyConfigured: true",
    })
    return
  }

  let raw = ""
  for await (const chunk of req) {
    raw += chunk
  }
  let payload
  try {
    payload = JSON.parse(raw || "{}")
  } catch {
    send(res, 400, { error: "JSON inválido" })
    return
  }

  const { messages = [], salesSummary = "" } = payload
  const contents = []
  if (salesSummary) {
    contents.push({
      role: "user",
      parts: [{ text: `[Contexto de datos simulados]\n${salesSummary}` }],
    })
    contents.push({
      role: "model",
      parts: [{ text: "Entendido. Usaré este contexto cuando sea relevante." }],
    })
  }
  for (const m of messages) {
    if (!m?.role || !m?.content) continue
    contents.push({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: String(m.content) }],
    })
  }

  try {
    const data = await callGemini(contents, true)
    const out = parseGeminiResponse(data)
    send(res, 200, out)
  } catch (e) {
    send(res, 502, { error: String(e?.message || e) })
  }
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[finance-assistant] http://127.0.0.1:${PORT}/chat (Gemini ${MODEL})`)
  if (!API_KEY) {
    console.warn(
      "[finance-assistant] GEMINI_API_KEY ausente: edita `.env` en la raíz o ejecuta GEMINI_API_KEY=... npm run assistant-server",
    )
  }
})
