import { ChevronLeftIcon, NotificationIcon, QuestionCircleIcon } from "@nimbus-ds/icons";

interface AppHeaderProps {
  onBack?: () => void;
  backLabel?: string;
}

export function AppHeader({ onBack, backLabel = "Volver" }: AppHeaderProps) {
  return (
    <header className="app-header">
      {onBack ? (
        <button className="header-back-btn" type="button" onClick={onBack}>
          <ChevronLeftIcon size="small" />
          <span>{backLabel}</span>
        </button>
      ) : (
        <div />
      )}
      <div className="header-button-stack">
        <button className="header-icon-btn" aria-label="Notificaciones">
          <NotificationIcon size="small" />
        </button>
        <button className="header-icon-btn" aria-label="Ayuda">
          <QuestionCircleIcon size="small" />
        </button>
        <button className="header-user-btn" aria-label="Tu cuenta">
          <span className="header-avatar">N</span>
          <span>Sua marca</span>
        </button>
      </div>
    </header>
  );
}
