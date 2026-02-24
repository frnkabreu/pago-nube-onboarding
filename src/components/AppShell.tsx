import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import "../styles/inicio.css";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <AppHeader />
        <div className="page-container">{children}</div>
      </div>
    </div>
  );
}
