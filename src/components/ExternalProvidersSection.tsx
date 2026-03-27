import { useState, useRef } from "react";
import {
  CreditCardIcon,
  WalletIcon,
  BarcodeIcon,
  CheckIcon,
  InfoCircleIcon,
  AppsIcon,
  RocketIcon,
} from "@nimbus-ds/icons";

function CptTooltip() {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setVisible(true);
  };

  const handleMouseLeave = () => setVisible(false);

  return (
    <>
      <span
        ref={iconRef}
        className="ext-cpte-icon"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <InfoCircleIcon size="small" />
      </span>
      {visible && (
        <div
          className="ext-cpt-tooltip"
          style={{
            position: "fixed",
            top: coords.y - 44,
            left: coords.x,
            transform: "translateX(-50%)",
          }}
        >
          Es el costo por venta finalizada de Tiendanube.
        </div>
      )}
    </>
  );
}

type PaymentType = "card" | "wallet" | "cash" | "transfer";
type ProviderStatus = "active" | "inactive";

interface PaymentRow {
  type: PaymentType;
  method: string;
  settlement: string;
  rate: string;
  cpt: string;
}

interface ProviderData {
  name: string;
  status: ProviderStatus;
  description: string;
  badges: string[];
  rows: PaymentRow[];
  link: string;
  isSpecial?: boolean;
  hasUpgradeCTA?: boolean;
}

function PaymentIcon({ type }: { type: PaymentType }) {
  if (type === "card") return <CreditCardIcon size="small" />;
  if (type === "wallet") return <WalletIcon size="small" />;
  if (type === "cash") return <BarcodeIcon size="small" />;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM2 13V6h12v7H2zm12-8H2V3h12v2z" />
      <path d="M4 9h3v2H4z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
    >
      <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M9.5 1.5h3v3m0-3L7 7m-1-4H2a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const pagosPersonalizados: ProviderData = {
  name: "Pagos personalizados",
  status: "inactive",
  description: "",
  badges: [],
  rows: [
    { type: "cash", method: "A convenir", settlement: "En el momento", rate: "sin costo", cpt: "2%" },
  ],
  link: "#",
  isSpecial: true,
  hasUpgradeCTA: true,
};

const aplazo: ProviderData = {
  name: "Aplazo",
  status: "inactive",
  description: "",
  badges: ["Tasas exclusivas para clientes de Tiendanube"],
  rows: [
    { type: "card", method: "Tarjeta de crédito, Tarjeta de débito", settlement: "7 días", rate: "5.00%", cpt: "2%" },
  ],
  link: "#",
  isSpecial: true,
};

const externalProviders: ProviderData[] = [
  {
    name: "Clip",
    status: "inactive",
    description: "Acepta todas las tarjetas. Solución simple para pagos presenciales y a distancia.",
    badges: ["Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "cash", method: "Redes de pago en efectivo, Tarjeta de débito, Tarjeta de crédito", settlement: "1 día", rate: "3.60% + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "ClubPago",
    status: "inactive",
    description: "",
    badges: ["Gateway"],
    rows: [
      { type: "card", method: "Tarjeta de débito, Tarjeta de crédito", settlement: "3 días", rate: "3.50% + IVA", cpt: "2%" },
      { type: "transfer", method: "Transferencia o depósito", settlement: "2 días", rate: "$7.50 + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Conekta",
    status: "inactive",
    description: "Pagos en efectivo en OXXO y transferencias SPEI en tiempo real.",
    badges: ["Gateway", "Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "card", method: "Tarjeta de crédito, Tarjeta de débito", settlement: "2 días", rate: "3.40% + $3.00 + IVA", cpt: "2%" },
      { type: "cash", method: "Redes de pago en efectivo", settlement: "3 días", rate: "3.70% + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Creditea",
    status: "inactive",
    description: "Soluciones de crédito y pago flexibles para tu negocio.",
    badges: ["Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "wallet", method: "Billetera Virtual", settlement: "1 día", rate: "$0.00 + IVA", cpt: "2%" },
      { type: "transfer", method: "Transferencia o depósito", settlement: "1 día", rate: "3.50% + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Dapp",
    status: "inactive",
    description: "Interoperabilidad de pagos con código QR y transferencias.",
    badges: ["Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "cash", method: "Redes de pago en efectivo", settlement: "3 días", rate: "2.10% + $2.00 + IVA", cpt: "2%" },
      { type: "transfer", method: "Transferencia o depósito", settlement: "3 días", rate: "$8.00 + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Ecart Pay",
    status: "inactive",
    description: "",
    badges: ["Gateway", "Tasas exclusivas para clientes de Tiendanube", "Ventas internacionales", "Checkout transparente"],
    rows: [
      { type: "card", method: "Tarjeta de crédito, Tarjeta de débito", settlement: "2 días", rate: "2.90% + $3.70 + IVA", cpt: "2%" },
      { type: "transfer", method: "Transferencia o depósito", settlement: "2 días", rate: "$12.50 + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Klarna",
    status: "inactive",
    description: "Ofrece pagos flexibles a tus clientes. Compra ahora, paga después.",
    badges: ["Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "card", method: "Tarjeta de débito, Tarjeta de crédito", settlement: "2 días", rate: "5.80% + IVA", cpt: "2%" },
      { type: "card", method: "Tarjeta de débito, Tarjeta de crédito", settlement: "8 días", rate: "2.80% + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Kueski Pay",
    status: "inactive",
    description: "Permite a tus clientes comprar ahora y pagar después sin necesidad de tarjeta.",
    badges: [],
    rows: [
      { type: "transfer", method: "Transferencia o depósito", settlement: "7 días", rate: "6.50% + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Mercado Pago",
    status: "inactive",
    description: "Recibe pagos con la plataforma líder de América Latina. Seguridad y rapidez.",
    badges: ["Gateway", "Checkout transparente"],
    rows: [
      { type: "card", method: "Tarjeta de crédito, Tarjeta de débito, Billetera Virtual", settlement: "En el momento", rate: "3.49% + $4.00", cpt: "2%" },
      { type: "cash", method: "Redes de pago en efectivo", settlement: "3 días", rate: "3.79% + $4.00", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Openpay",
    status: "inactive",
    description: "Plataforma de pagos integral. Tarjetas, efectivo y transferencias.",
    badges: ["Gateway", "Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "card", method: "Tarjeta de débito, Tarjeta de crédito, Redes de pago en efectivo", settlement: "3 días", rate: "2.90% + $2.50 + IVA", cpt: "2%" },
      { type: "transfer", method: "Transferencia o depósito", settlement: "3 días", rate: "$8.00 + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "PayPal",
    status: "inactive",
    description: "PayPal ofrece una forma segura y rápida de pagar en línea, aceptado mundialmente.",
    badges: ["Ventas internacionales"],
    rows: [
      { type: "wallet", method: "Billetera Virtual, Tarjeta de crédito, Tarjeta de débito", settlement: "En el momento", rate: "3.95% + $4.00 + IVA", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "Stripe by Wava",
    status: "inactive",
    description: "La infraestructura de pagos para internet. Acepta pagos de todo el mundo.",
    badges: ["Gateway", "Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "card", method: "Tarjeta de crédito, Tarjeta de débito", settlement: "En el momento", rate: "4.00% + $4.50", cpt: "2%" },
    ],
    link: "#",
  },
  {
    name: "YoloPago",
    status: "inactive",
    description: "",
    badges: ["Gateway", "Tasas exclusivas para clientes de Tiendanube"],
    rows: [
      { type: "card", method: "Tarjeta de crédito, Tarjeta de débito", settlement: "1 día", rate: "2.90% + $3.00 + IVA", cpt: "2%" },
    ],
    link: "#",
  },
];

function ProviderCard({ provider }: { provider: ProviderData }) {
  const [open, setOpen] = useState(false);
  const isSpecial = provider.isSpecial;

  return (
    <div className={isSpecial ? "ext-card ext-card--special" : "ext-card"}>
      <button
        className="ext-card-summary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="ext-card-name">{provider.name}</span>
        <div className="ext-card-summary-right">
          <span className="ext-tag ext-tag--warning">
            CPT: 2%
          </span>
          <span
            className={
              provider.status === "active"
                ? "ext-tag ext-tag--active"
                : "ext-tag ext-tag--inactive"
            }
          >
            {provider.status === "active" ? "Activado" : "Desactivado"}
          </span>
          <span className="ext-card-chevron">
            <ChevronIcon open={open} />
          </span>
        </div>
      </button>

      {open && (
        <div className="ext-card-content">
          {provider.badges.length > 0 && (
            <div className="ext-card-badges">
              {provider.badges.map((badge) => (
                <span key={badge} className="ext-card-badge">
                  <CheckIcon size="small" />
                  {badge}
                </span>
              ))}
            </div>
          )}

          <div className="ext-table">
            <div className="ext-table-header">
              <div className="ext-table-col ext-table-col--method">
                <span className="ext-table-label">En ventas con</span>
              </div>
              <div className="ext-table-col ext-table-col--settlement">
                <span className="ext-table-label">Recibe en</span>
              </div>
              <div className="ext-table-col ext-table-col--rate">
                <span className="ext-table-label">Tasas</span>
              </div>
              <div className="ext-table-col ext-table-col--cpte">
                <span className="ext-table-label ext-table-label--cpte">
                  CPT <CptTooltip />
                </span>
              </div>
            </div>

            {provider.rows.map((row, idx) => (
              <div key={idx} className="ext-table-row">
                <div className="ext-table-col ext-table-col--method">
                  <span className="ext-method-icon">
                    <PaymentIcon type={row.type} />
                  </span>
                  <span className="ext-method-text">{row.method}</span>
                </div>
                <div className="ext-table-col ext-table-col--settlement">
                  <span className="ext-settlement-text">{row.settlement}</span>
                </div>
                <div className="ext-table-col ext-table-col--rate">
                  <span className="ext-rate-text">{row.rate}</span>
                </div>
                <div className="ext-table-col ext-table-col--cpte">
                  <span className="ext-cpte-text">{row.cpt}</span>
                </div>
              </div>
            ))}
          </div>

          {provider.hasUpgradeCTA && (
            <div className="ext-upgrade-cta">
              <div className="ext-upgrade-icon-wrap">
                <RocketIcon size="medium" />
              </div>
              <div className="ext-upgrade-text">
                <strong>¡Agrega nuevas opciones de pago personalizado!</strong>
                <span>Sube de plan y ofrece a tus clientes la posibilidad de pagar en efectivo o por transferencia.</span>
              </div>
              <span className="ext-upgrade-chevron">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
                </svg>
              </span>
            </div>
          )}

          <div className={`ext-card-footer${provider.hasUpgradeCTA ? " ext-card-footer--end" : ""}`}>
            {!provider.hasUpgradeCTA && (
              <a href={provider.link} className="ext-card-link">
                <ExternalLinkIcon />
                Ir a {provider.name}
              </a>
            )}
            <button className="ext-more-info-btn">Más información</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExternalProvidersSection() {
  return (
    <section className="ext-section">
      <div className="ext-section-header">
        <h2 className="ext-section-title">Conecta con otras opciones de pago</h2>
        <p className="ext-section-subtitle">
          Vincular procesadores externos (sujeto a comisión por transacción de Tiendanube).
        </p>
      </div>

      <div className="ext-providers-list">
        <ProviderCard provider={pagosPersonalizados} />

        <div className="ext-providers-group">
          <ProviderCard provider={aplazo} />

          <div className="ext-providers-subgroup">
            {externalProviders.map((provider) => (
              <ProviderCard key={provider.name} provider={provider} />
            ))}
          </div>
        </div>
      </div>

      <div className="ext-callout-card">
        <div className="ext-callout-icon">
          <AppsIcon size="medium" style={{ color: "#2563eb" }} />
        </div>
        <div className="ext-callout-content">
          <strong className="ext-callout-title">¿Necesitas más opciones?</strong>
          <span className="ext-callout-text">Conoce las apps disponibles en la Tienda de Aplicaciones</span>
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
    </section>
  );
}
