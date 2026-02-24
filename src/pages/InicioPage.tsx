import { QuestionCircleIcon, ExternalLinkIcon } from "@nimbus-ds/icons";
import { AppShell } from "../components/AppShell";
import { OnboardingSteps } from "../components/OnboardingSteps";
import { ConfirmAccountCard } from "../components/ConfirmAccountCard";

export function InicioPage() {
  return (
    <AppShell>
      <div className="page-header">
        <h1 className="page-title">Inicio</h1>
      </div>
      <div className="page-body">
        <div className="onboarding-group">
          <OnboardingSteps />
          <ConfirmAccountCard />
        </div>
        <div className="help-link-container">
          <a href="#" className="help-link">
            <span className="help-link-icon">
              <QuestionCircleIcon size="small" />
            </span>
            <span className="help-link-text">
              Más sobre cómo armar una tienda online
              <ExternalLinkIcon size="small" />
            </span>
          </a>
        </div>
      </div>
    </AppShell>
  );
}
