/**
 * Diagnóstico rápido do BFF local (sem passar pelo Vite).
 * Uso: com `npm run assistant-server` em outro terminal → `npm run assistant:probe`
 */
const base = process.env.FINANCE_ASSISTANT_URL || "http://127.0.0.1:8788"

async function main() {
  console.log(`[assistant:probe] GET ${base}/health`)
  try {
    const h = await fetch(`${base}/health`)
    const ht = await h.text()
    console.log(`  status ${h.status}`, ht)
  } catch (e) {
    console.error("  error", e?.message || e)
    console.error("  → ¿Está `npm run assistant-server` en marcha?")
    process.exitCode = 1
    return
  }

  console.log(`[assistant:probe] POST ${base}/chat (mensaje mínimo)`)
  try {
    const r = await fetch(`${base}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "ping" }],
      }),
    })
    const t = await r.text()
    console.log(`  status ${r.status}`, t.slice(0, 500) + (t.length > 500 ? "…" : ""))
    if (!r.ok) process.exitCode = 1
  } catch (e) {
    console.error("  error", e?.message || e)
    process.exitCode = 1
  }
}

main()
