/**
 * Escapa HTML para uso com markdown mínimo (**negrita**) antes de renderizar no bot.
 * Mitiga XSS quando el contenido viene del modelo LLM.
 */
export function escapeHtmlForBot(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
