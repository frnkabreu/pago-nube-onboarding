import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { X, User, Trash2, Plus, Mic, ArrowUp } from "lucide-react"
import { useSales } from "@/lib/sales-context"
import {
  applyFinanceToolCalls,
  buildSalesSummaryForLlm,
  CLEAR_CHAT_SENTINEL,
  escapeHtmlForBot,
  getFinanceAssistantApiUrl,
  postFinanceAssistantLlm,
  processCommand,
  type ChatTurn,
  type FinanceAssistantDeps,
  type MessageAction,
} from "@/lib/finance-assistant"

type Message = {
  id: number
  type: "bot" | "user" | "result"
  content: string
  timestamp: Date
  actions?: MessageAction[]
  /** Mensagens do modelo LLM são escapadas antes do markdown mínimo. */
  botSource?: "rules" | "llm"
}

function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
}

function prepareLineForBot(line: string, contentSource: "rules" | "llm"): string {
  if (contentSource === "llm") {
    return escapeHtmlForBot(line)
  }
  return line
}

function BotMessage({
  content,
  isStreaming,
  contentSource = "rules",
}: {
  content: string
  isStreaming?: boolean
  contentSource?: "rules" | "llm"
}) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={key++} style={{ margin: "4px 0", paddingLeft: "16px", listStyle: "disc" }}>
          {listItems.map((item, i) => (
            <li
              key={i}
              style={{ fontSize: "13px", lineHeight: "1.6" }}
              dangerouslySetInnerHTML={{ __html: boldify(prepareLineForBot(item, contentSource)) }}
            />
          ))}
        </ul>,
      )
      listItems = []
    }
  }

  for (const line of lines) {
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2))
    } else {
      flushList()
      if (line.trim() === "") {
        elements.push(<div key={key++} style={{ height: "6px" }} />)
      } else {
        elements.push(
          <p
            key={key++}
            style={{ margin: "0 0 2px", fontSize: "14px", lineHeight: "1.5" }}
            dangerouslySetInnerHTML={{ __html: boldify(prepareLineForBot(line, contentSource)) }}
          />,
        )
      }
    }
  }
  flushList()

  return (
    <div>
      {elements}
      {isStreaming && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "14px",
            background: "currentColor",
            verticalAlign: "middle",
            marginLeft: "2px",
            animation: "blink 1s step-end infinite",
          }}
        />
      )}
    </div>
  )
}

export function AIAgentSidebar() {
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
    openChatWithRecovery,
    setOpenChatWithRecovery,
  } = useSales()

  const assistantDeps = useMemo<FinanceAssistantDeps>(
    () => ({
      salesDatabase,
      updateTransactionStatus,
      bulkUpdateStatus,
      getProblematicTransactions,
      getNonApprovedTransactions,
      getApprovedTotal,
      getProblematicTotal,
      getTransactionById,
      findTransactionByClient,
    }),
    [
      salesDatabase,
      updateTransactionStatus,
      bulkUpdateStatus,
      getProblematicTransactions,
      getNonApprovedTransactions,
      getApprovedTotal,
      getProblematicTotal,
      getTransactionById,
      findTransactionByClient,
    ],
  )

  /** Com BFF configurado (`VITE_FINANCE_ASSISTANT_API_URL`), abrir já em Gemini. */
  const [assistantMode, setAssistantMode] = useState<"rules" | "llm">(() =>
    getFinanceAssistantApiUrl() ? "llm" : "rules",
  )
  const llmEndpointConfigured = Boolean(getFinanceAssistantApiUrl())
  const [isOpen, setIsOpen] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content:
        "¡Hola! Soy tu asistente financiero 👋\n\nPuedes hablarme en **español o portugués**, por ejemplo:\n\n💬 \"¿Cuánto tengo disponible?\" / \"Quanto tenho?\"\n💬 \"¿Hay algún problema?\" / \"Tem algum problema?\"\n💬 \"Ticket promedio\" / \"Ticket médio\"\n💬 \"Mejores clientes\" / \"Melhores clientes\"\n💬 \"Tasa de aprobación\" / \"Taxa de aprovação\"\n💬 \"Ventas de octubre\" / \"Vendas de outubro\"\n💬 \"Buscar cliente Carlos\"\n💬 \"Aprobar venta #142\"\n\nEscribe **ayuda** para ver todo lo que sé hacer.\n\n**Modo Gemini:** activa \"Gemini\" arriba si tienes el servidor BFF (`npm run assistant-server`) y `VITE_FINANCE_ASSISTANT_API_URL` en `.env`.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleRecoveryContext = useCallback(() => {
    const problematic = getProblematicTransactions()
    const total = getProblematicTotal()

    const recoveryMessage: Message = {
      id: Date.now(),
      type: "bot",
      content: `**Analisis de Recuperacion Iniciado**\n\nEncontre ${problematic.length} transacciones problematicas totalizando $${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}:\n\n${problematic
        .slice(0, 10)
        .map(
          (t) =>
            `- ${t.id} | ${t.client}: MXN ${t.value.toLocaleString("es-MX", { minimumFractionDigits: 2 })} (${t.status})`,
        )
        .join("\n")}${problematic.length > 10 ? `\n\n... y ${problematic.length - 10} mas` : ""}`,
      timestamp: new Date(),
      actions: [
        { label: "Aprobar todas", command: "aprobar todas las pendientes", variant: "default" },
        { label: "Ver reporte completo", command: "reporte de ventas no aprobadas", variant: "outline" },
      ],
    }

    setMessages((prev) => [...prev, recoveryMessage])
  }, [getProblematicTransactions, getProblematicTotal])

  useEffect(() => {
    if (openChatWithRecovery) {
      setIsOpen(true)
      const t = setTimeout(() => {
        handleRecoveryContext()
        setOpenChatWithRecovery(false)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [openChatWithRecovery, setOpenChatWithRecovery, handleRecoveryContext])

  const typewriterEffect = useCallback(
    (fullText: string, messageId: number, actions?: MessageAction[], botSource: "rules" | "llm" = "rules") => {
      let i = 0
      setTypingMessageId(messageId)
      const interval = setInterval(() => {
        i++
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content: fullText.slice(0, i), botSource } : m)),
        )
        if (i >= fullText.length) {
          clearInterval(interval)
          setTypingMessageId(null)
          if (actions) {
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, actions } : m)))
          }
        }
      }, 10)
    },
    [],
  )

  const applyBotResponse = useCallback(
    (response: { content: string; actions?: MessageAction[]; botSource?: "rules" | "llm" }) => {
      if (response.content === CLEAR_CHAT_SENTINEL) {
        setMessages([
          {
            id: 1,
            type: "bot",
            content: "Chat limpio! Los cambios en la base de datos fueron guardados. ¿Como puedo ayudarte?",
            timestamp: new Date(),
            botSource: "rules",
          },
        ])
        setIsTyping(false)
        return
      }
      const msgId = Date.now() + 1
      const src = response.botSource ?? "rules"
      setMessages((prev) => [...prev, { id: msgId, type: "bot", content: "", timestamp: new Date(), botSource: src }])
      setIsTyping(false)
      typewriterEffect(response.content, msgId, response.actions, src)
    },
    [typewriterEffect],
  )

  const executeCommand = useCallback(
    (command: string) => {
      setInputValue("")

      const userMessage: Message = {
        id: Date.now(),
        type: "user",
        content: command,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      const llmUrl = getFinanceAssistantApiUrl()
      const useLlm = assistantMode === "llm" && llmUrl

      if (assistantMode === "llm" && !llmUrl) {
        applyBotResponse({
          content:
            "**Gemini no disponible en el cliente.** Falta `VITE_FINANCE_ASSISTANT_API_URL` en `.env` (p. ej. `/api/finance-assistant`). Guarda el archivo y **reinicia** `npm run dev` para que Vite cargue la variable.",
          botSource: "rules",
        })
        return
      }

      if (useLlm) {
        const turns: ChatTurn[] = messages
          .filter((m) => (m.type === "user" || m.type === "bot") && m.content.trim().length > 0)
          .slice(-12)
          .map((m) => ({
            role: m.type === "user" ? ("user" as const) : ("model" as const),
            content: m.content,
          }))
        turns.push({ role: "user", content: command })

        void (async () => {
          try {
            const res = await postFinanceAssistantLlm({
              messages: turns,
              salesSummary: buildSalesSummaryForLlm(salesDatabase),
            })
            let text = res.reply?.trim() ?? ""
            if (res.toolCalls?.length) {
              const applied = applyFinanceToolCalls(res.toolCalls, assistantDeps)
              text = [text, applied.content].filter(Boolean).join("\n\n")
            }
            if (!text) text = "Sin respuesta del modelo."
            applyBotResponse({ content: text, botSource: "llm" })
          } catch (err) {
            const detail = err instanceof Error ? err.message : String(err)
            const fallback = processCommand(command, assistantDeps)
            applyBotResponse({
              content: `**No se pudo usar Gemini** (${detail})\n\nAsegúrate de tener \`npm run assistant-server\` en marcha y \`GEMINI_API_KEY\` válida en \`.env\`. Mientras tanto, respuesta por **reglas**:\n\n${fallback.content}`,
              actions: fallback.actions,
              botSource: "rules",
            })
          }
        })()
        return
      }

      setTimeout(() => {
        const response = processCommand(command, assistantDeps)
        applyBotResponse({ ...response, botSource: "rules" })
      }, 400)
    },
    [messages, assistantMode, salesDatabase, assistantDeps, applyBotResponse],
  )

  const handleSend = () => {
    if (!inputValue.trim()) return
    executeCommand(inputValue)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Chat limpio! Los cambios en la base de datos fueron guardados. ¿Como puedo ayudarte?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .ai-send-btn {
          background: linear-gradient(135deg, #0059d5 0%, #7c3aed 100%);
          transition: opacity .15s;
        }
        .ai-send-btn:hover { opacity: .88; }
        .ai-send-btn:disabled {
          background: #e7e7e7;
          border: 1px solid #96c1fc;
        }
        .ai-input-wrap {
          border: 1.5px solid #0050c3;
          border-radius: 8px;
          background: #fff;
          transition: box-shadow .15s;
        }
        .ai-input-wrap:focus-within {
          box-shadow: 0 0 0 3px rgba(0,80,195,.15);
        }
      `}</style>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-105"
        style={{ border: "2px solid #0059d5" }}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className="h-5 w-5" style={{ color: "#0059d5" }} />
        ) : (
          <img src="/logos/pagonube-icon.png" alt="Pago Nube" className="h-7 w-7 object-contain" />
        )}
      </button>

      <div
        className="fixed right-6 z-40 w-[calc(100vw-48px)] sm:w-[400px]"
        style={{
          bottom: "88px",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
          transition: "transform .25s cubic-bezier(.32,1.2,.4,1), opacity .2s ease",
          display: "flex",
          flexDirection: "column",
          maxHeight: "70vh",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{
            borderBottom: "1px solid #f0f0f0",
            borderRadius: "16px 16px 0 0",
            background: "#fff",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"
              style={{ border: "1.5px solid #e7e7e7" }}
            >
              <img src="/logos/pagonube-icon.png" alt="Pago Nube" className="h-5 w-5 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#0a0a0a" }}>
                AI Agent Financiero
              </p>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <button
                  type="button"
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${assistantMode === "rules" ? "bg-[#eef5ff] text-[#0059d5]" : "bg-[#f6f6f6] text-[#6d6d6d]"}`}
                  onClick={() => setAssistantMode("rules")}
                >
                  Reglas
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${assistantMode === "llm" ? "bg-[#eef5ff] text-[#0059d5]" : "bg-[#f6f6f6] text-[#6d6d6d]"}`}
                  onClick={() => setAssistantMode("llm")}
                >
                  Gemini
                </button>
              </div>
              {assistantMode === "llm" && !llmEndpointConfigured && (
                <p className="text-[10px] text-amber-700 mt-1 leading-snug">
                  Falta <code className="text-[9px]">VITE_FINANCE_ASSISTANT_API_URL</code> — reinicia <code className="text-[9px]">npm run dev</code>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleClearChat}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f6f6f6]"
              title="Limpiar chat"
            >
              <Trash2 className="h-4 w-4" style={{ color: "#6d6d6d" }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[88%] items-end gap-2 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: message.type === "user" ? "#0059d5" : "#f6f6f6",
                    border: message.type === "user" ? "none" : "1px solid #e7e7e7",
                  }}
                >
                  {message.type === "user" ? (
                    <User className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <img src="/logos/pagonube-icon.png" alt="" className="h-4 w-4 object-contain" />
                  )}
                </div>

                <div>
                  <div
                    className="rounded-2xl px-3 py-2"
                    style={
                      message.type === "user"
                        ? { background: "#0059d5", color: "#fff" }
                        : { background: "#f6f6f6", color: "#0a0a0a" }
                    }
                  >
                    {message.type === "user" ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                    ) : (
                      <BotMessage
                        content={message.content}
                        isStreaming={message.id === typingMessageId}
                        contentSource={message.botSource ?? "rules"}
                      />
                    )}
                  </div>

                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.actions.map((action) => (
                        <button
                          key={action.command}
                          type="button"
                          onClick={() => executeCommand(action.command)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                          style={
                            action.variant === "default"
                              ? { background: "#0059d5", color: "#fff" }
                              : action.variant === "destructive"
                                ? { background: "#c91432", color: "#fff" }
                                : { background: "#fff", color: "#0a0a0a", border: "1px solid #e7e7e7" }
                          }
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="mb-3 flex justify-start">
              <div className="flex items-end gap-2">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#f6f6f6", border: "1px solid #e7e7e7" }}
                >
                  <img src="/logos/pagonube-icon.png" alt="" className="h-4 w-4 object-contain" />
                </div>
                <div className="rounded-2xl px-4 py-3" style={{ background: "#f6f6f6" }}>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6d6d6d]" />
                    <div
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6d6d6d]"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6d6d6d]"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 px-4 py-2" style={{ borderTop: "1px solid #f0f0f0" }}>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {["¿Cuánto tengo?", "¿Hay problemas?", "Ticket promedio", "Mejores clientes", "Ayuda"].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => executeCommand(cmd)}
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: "#f6f6f6",
                  border: "1px solid #e7e7e7",
                  color: "#0059d5",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#eef5ff"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f6f6f6"
                }}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="ai-input-wrap">
            <div className="px-3 pt-2">
              <textarea
                rows={1}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Pregúntame algo…"
                className="w-full resize-none bg-transparent text-sm leading-5 outline-none"
                style={{
                  color: "#0a0a0a",
                  minHeight: "20px",
                  maxHeight: "96px",
                  overflow: "hidden",
                }}
              />
            </div>

            <div className="flex items-center justify-between px-2 pb-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f6f6f6]"
                title="Acciones rápidas"
              >
                <Plus className="h-4 w-4" style={{ color: "#6d6d6d" }} />
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f6f6f6]"
                  title="Voz"
                >
                  <Mic className="h-4 w-4" style={{ color: "#6d6d6d" }} />
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="ai-send-btn flex h-8 w-8 items-center justify-center rounded-full"
                  title="Enviar"
                >
                  <ArrowUp className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
