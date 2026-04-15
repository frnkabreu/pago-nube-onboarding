/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL do BFF do assistente (ex.: `/api/finance-assistant` com proxy em dev). Sin configurar: só modo regras. */
  readonly VITE_FINANCE_ASSISTANT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
