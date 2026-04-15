/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Senha de acesso à app (cliente; exposta no bundle). Obrigatória para o ecrã de login. */
  readonly VITE_APP_ACCESS_PASSWORD?: string
  /** Base URL do BFF do assistente (ex.: `/api/finance-assistant` com proxy em dev). Sin configurar: só modo regras. */
  readonly VITE_FINANCE_ASSISTANT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
