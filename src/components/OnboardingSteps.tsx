import { useState } from "react";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  TagIcon,
  ToolsIcon,
  LocationIcon,
  TruckIcon,
  CreditCardIcon,
} from "@nimbus-ds/icons";

interface StepConfig {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  description?: string;
  cta?: { label: string; href?: string };
  secondaryLink?: { label: string; href: string };
}

const steps: StepConfig[] = [
  {
    id: "add-products",
    title: "Agregar productos",
    icon: TagIcon,
  },
  {
    id: "customize-design",
    title: "Personalizar diseño",
    icon: ToolsIcon,
  },
  {
    id: "set-origin",
    title: "Definir punto de partida de los envíos",
    icon: LocationIcon,
  },
  {
    id: "shipping-methods",
    title: "Configurar medios de envío",
    icon: TruckIcon,
  },
  {
    id: "payment-methods-pago-nube",
    title: "Configurar medios de pago",
    icon: CreditCardIcon,
    description:
      "Cobra tus ventas con el método de pago de Tiendanube: seguro, con alta tasa de aprobación y ¡sin costos por transacción!",
    cta: { label: "Configurar Pago Nube", href: "/configuracion/medios-pago" },
    secondaryLink: { label: "Más información", href: "/pago-nube" },
  },
];

export function OnboardingSteps() {
  const [openStep, setOpenStep] = useState<string | null>(
    "payment-methods-pago-nube"
  );

  const handleToggle = (id: string) => {
    setOpenStep((prev) => (prev === id ? null : id));
  };

  return (
    <div className="onboarding-section">
      <p className="onboarding-subtitle">
        ¡Revisa los pasos para dejar tu tienda a tu manera!
      </p>

      <div className="onboarding-card">
        {/* Completed step */}
        <div className="step-done">
          <div className="step-done-icon">
            <div className="step-done-check">
              <CheckCircleIcon size="small" />
            </div>
          </div>
          <div className="step-done-content">
            <div className="step-done-title">Crear tienda</div>
            <div className="step-done-description">
              ¡Tu tienda está publicada! ¡Deja todo listo para empezar a vender!
            </div>
          </div>
          <a href="#" className="step-done-link">
            Ver tienda <ExternalLinkIcon size="small" />
          </a>
        </div>

        {/* Accordion steps */}
        {steps.map((step) => {
          const isOpen = openStep === step.id;
          return (
            <div className={`accordion-item${isOpen ? " open" : ""}`} key={step.id}>
              <div
                className="accordion-header"
                onClick={() => handleToggle(step.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggle(step.id);
                  }
                }}
              >
                <span
                  className="accordion-icon-wrapper"
                  style={isOpen ? { background: "#ffffff" } : undefined}
                >
                  <step.icon size="small" />
                </span>
                <div className="accordion-header-text">
                  <span className="accordion-title">{step.title}</span>
                  {isOpen && step.description && (
                    <p className="accordion-description">{step.description}</p>
                  )}
                  {isOpen && step.cta && (
                    <div className="accordion-actions" onClick={(e) => e.stopPropagation()}>
                      {step.cta.href ? (
                        <a href={step.cta.href} className="accordion-cta">
                          {step.cta.label}
                        </a>
                      ) : (
                        <button className="accordion-cta">
                          {step.cta.label}
                        </button>
                      )}
                      {step.secondaryLink && (
                        <a href={step.secondaryLink.href} className="accordion-cta-secondary">
                          {step.secondaryLink.label}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <span className={`accordion-chevron${isOpen ? " open" : ""}`}>
                  <ChevronDownIcon size="small" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
