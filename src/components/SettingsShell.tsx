import type { ReactNode } from "react";
import { SettingsSidebar } from "./SettingsSidebar";
import { AppHeader } from "./AppHeader";
import "../styles/inicio.css";

interface SettingsShellProps {
  children: ReactNode;
  onBack?: () => void;
  backLabel?: string;
}

export function SettingsShell({ children, onBack, backLabel }: SettingsShellProps) {
  return (
    <div className="app-shell">
      <SettingsSidebar />
      <div className="main-area">
        <AppHeader onBack={onBack} backLabel={backLabel} />
        <div className="settings-page-container">{children}</div>
      </div>
    </div>
  );
}
