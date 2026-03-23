import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AppsIcon } from "@nimbus-ds/icons";
import { SettingsShell } from "../components/SettingsShell";
import { PagoNubeHeroCard } from "../components/PagoNubeHeroCard";
import { ExternalProvidersSection } from "../components/ExternalProvidersSection";
import "../styles/medios-pago.css";

function ActivadosEmptyState() {
  return (
    <div className="pendientes-empty">
      <div className="pendientes-empty-state">
        <svg
          className="pendientes-empty-icon"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="21" cy="21" r="13" stroke="#9aa0ab" strokeWidth="2.5" />
          <line x1="30.5" y1="30.5" x2="42" y2="42" stroke="#9aa0ab" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="pendientes-empty-text">
          Tu tienda no tiene medios de pago activados
        </p>
        <p className="pendientes-empty-subtitle">
          ¡Revisa los pasos para dejar tu tienda a tu manera!
        </p>
      </div>

      <div className="ext-callout-card">
        <div className="ext-callout-icon">
          <AppsIcon size="medium" style={{ color: "#2563eb" }} />
        </div>
        <div className="ext-callout-content">
          <strong className="ext-callout-title">¿Necesitas más opciones?</strong>
          <span className="ext-callout-text">
            Conoce las apps disponibles en la Tienda de Aplicaciones
          </span>
        </div>
        <span className="ext-callout-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
          </svg>
        </span>
      </div>

      <a href="#" className="ext-bottom-link">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <circle cx="8.5" cy="8.5" r="7.5" stroke="#0050c3" strokeWidth="1.2" />
          <text x="8.5" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0050c3">?</text>
        </svg>
        Más sobre métodos de pago
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M5.5 2.5h6v6m0-6L4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </a>
    </div>
  );
}

function PendientesEmptyState() {
  return (
    <div className="pendientes-empty">
      <div className="pendientes-empty-state">
        <svg
          className="pendientes-empty-icon"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="21" cy="21" r="13" stroke="#9aa0ab" strokeWidth="2.5" />
          <line x1="30.5" y1="30.5" x2="42" y2="42" stroke="#9aa0ab" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="pendientes-empty-text">
          Tu tienda no tiene medios de pago pendientes
        </p>
      </div>

      <div className="ext-callout-card">
        <div className="ext-callout-icon">
          <AppsIcon size="medium" style={{ color: "#2563eb" }} />
        </div>
        <div className="ext-callout-content">
          <strong className="ext-callout-title">¿Necesitas más opciones?</strong>
          <span className="ext-callout-text">
            Conoce las apps disponibles en la Tienda de Aplicaciones
          </span>
        </div>
        <span className="ext-callout-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
          </svg>
        </span>
      </div>

      <a href="#" className="ext-bottom-link">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <circle cx="8.5" cy="8.5" r="7.5" stroke="#0050c3" strokeWidth="1.2" />
          <text x="8.5" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0050c3">?</text>
        </svg>
        Más sobre medios de pago
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M5.5 2.5h6v6m0-6L4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </a>
    </div>
  );
}

const tabs = ["Todos", "Activados", "Desactivados", "Pendientes"];

export function MediosDePagoPage() {
  const { state } = useLocation();

  // Navigation state (true only on the immediate redirect from the form)
  const justActivated = state?.pagoNubeActivated === true;

  // Persistent activation state — reactive so deactivation triggers re-render
  const [activated, setActivated] = useState(
    justActivated || localStorage.getItem("pagoNubeActivated") === "true"
  );

  const handleDeactivate = () => {
    localStorage.removeItem("pagoNubeActivated");
    setActivated(false);
  };

  // Jump to "Activados" tab only on the first redirect after form submission
  const [activeTab, setActiveTab] = useState(justActivated ? "Activados" : "Todos");

  const showPagoNube = activeTab === "Todos" || (activeTab === "Activados" && activated);
  const showActivadosEmpty = activeTab === "Activados" && !activated;
  const showExternalProviders = activeTab === "Todos" || activeTab === "Desactivados";
  const showPendientes = activeTab === "Pendientes";

  return (
    <SettingsShell>
      <div className="medios-pago-page">
        <div className="medios-pago-header">
          <h1 className="medios-pago-title">Métodos de pago</h1>
          <p className="medios-pago-subtitle">
            Elige al menos un medio de pago para empezar a cobrar tus ventas.
          </p>
        </div>

        <div className="medios-pago-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`medios-pago-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Pendientes" ? (
                <>
                  Pendientes
                  <span className="medios-pago-tab-badge">0</span>
                </>
              ) : tab}
            </button>
          ))}
        </div>

        {showPagoNube && <PagoNubeHeroCard activated={activated} onDeactivate={handleDeactivate} />}
        {showActivadosEmpty && <ActivadosEmptyState />}
        {showExternalProviders && <ExternalProvidersSection />}
        {showPendientes && <PendientesEmptyState />}
      </div>
    </SettingsShell>
  );
}
