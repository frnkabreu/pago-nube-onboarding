/**
 * Proteção simples por senha (cliente). A senha vem de VITE_APP_ACCESS_PASSWORD
 * e fica exposta no bundle — serve como barreira leve, não como segurança forte.
 */
const STORAGE_KEY = "pago-nube-app-access";

export function isAccessGranted(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function grantAccess(): void {
  sessionStorage.setItem(STORAGE_KEY, "1");
}

export function getConfiguredPassword(): string {
  const raw = import.meta.env.VITE_APP_ACCESS_PASSWORD ?? "";
  // BOM / espaços (ex.: paste no GitHub ou .env)
  return raw.replace(/^\uFEFF/, "").trim();
}

export function verifyPassword(input: string): boolean {
  const expected = getConfiguredPassword();
  if (!expected) return false;
  return input.trim() === expected;
}
