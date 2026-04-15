import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import "../styles/inicio.css";

interface DashboardShellProps {
  children: ReactNode;
  /** Elementos renderizados fora do scroll container (ex: botões fixos, sidebars) */
  overlay?: ReactNode;
}

/**
 * Layout wrapper para todas as páginas do dashboard financeiro de Pago Nube.
 * Reutiliza o app-shell existente (Sidebar + AppHeader) sem o max-width
 * restritivo de page-container (800px), usando settings-page-container.
 *
 * O `overlay` é renderizado fora do settings-page-container para evitar
 * que o overflow:auto clipe elementos com position:fixed.
 */
export function DashboardShell({ children, overlay }: DashboardShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area" style={{ position: "relative" }}>
        <AppHeader />
        <div className="settings-page-container">
          {children}
        </div>
        {overlay}
      </div>
    </div>
  );
}
