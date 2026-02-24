interface NavigationButtonsProps {
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
}

export function NavigationButtons({
  onNext,
  onBack,
  nextLabel = "Continuar",
  backLabel = "Volver",
  nextDisabled = false,
}: NavigationButtonsProps) {
  return (
    <div className="nav-buttons">
      <button className="nav-btn nav-btn--back" onClick={onBack}>
        {backLabel}
      </button>
      <button
        className="nav-btn nav-btn--next"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
      </button>
    </div>
  );
}

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress-bar-wrapper" aria-label={`Paso ${current} de ${total}`}>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-bar-label">
        {current} / {total}
      </span>
    </div>
  );
}
