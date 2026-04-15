export type { FinanceAssistantDeps } from "./deps"
export { processCommand } from "./execute-command"
export { fmtMXN } from "./fmt"
export {
  detectIntent,
  extractClientName,
  extractId,
  extractMonth,
  findClosestId,
} from "./intents"
export {
  getFinanceAssistantApiUrl,
  postFinanceAssistantLlm,
  type ChatTurn,
  type LlmRequestBody,
} from "./llm-client"
export { buildSalesSummaryForLlm } from "./sales-summary"
export { escapeHtmlForBot } from "./sanitize"
export { applyFinanceToolCalls, tryExtractCommandFromLlmText } from "./tool-apply"
export {
  CLEAR_CHAT_SENTINEL,
  type FinanceToolCall,
  type LlmChatResponse,
  type MessageAction,
  type ProcessCommandResult,
} from "./types"
