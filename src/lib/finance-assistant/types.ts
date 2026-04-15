/** Ações clicáveis no chat (re-executam texto como comando rule-based). */
export type MessageActionVariant = "default" | "destructive" | "outline"

export type MessageAction = {
  label: string
  command: string
  variant: MessageActionVariant
}

/** Resultado de processCommand / ferramentas — conteúdo de mensagem do bot. */
export type ProcessCommandResult = {
  content: string
  actions?: MessageAction[]
}

/** Sentinel interno: o componente de UI limpa o histórico em vez de mostrar isto. */
export const CLEAR_CHAT_SENTINEL = "CLEAR_CHAT"

/** Chamadas de ferramenta devolvidas pelo BFF (Fase híbrida). */
export type FinanceToolName =
  | "approve_sale"
  | "reject_sale"
  | "bulk_approve_problematic"
  | "change_sale_status"
  | "noop"

export type FinanceToolCall = {
  name: FinanceToolName
  args: Record<string, unknown>
}

export type LlmChatResponse = {
  /** Texto livre do modelo (se houver). */
  reply?: string
  /** Ferramentas a aplicar no cliente sobre FinanceAssistantDeps. */
  toolCalls?: FinanceToolCall[]
}
