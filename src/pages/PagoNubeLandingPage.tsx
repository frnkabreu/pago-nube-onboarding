import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  CreditCardIcon,
  BoxPackedIcon,
  BarcodeIcon,
  CalculatorIcon,
  QuestionCircleIcon,
  ExternalLinkIcon,
} from "@nimbus-ds/icons";
import { Sidebar } from "../components/Sidebar";
import { AppHeader } from "../components/AppHeader";
import "../styles/pago-nube-landing.css";

const benefitCards = [
  {
    icon: ShoppingCartIcon,
    title: "Checkout acelerado y transparente",
    text: "Los pagos se completan dentro de tu tienda con un proceso hasta 3 veces más rápido. Recopila los datos para futuras compras y aumenta tu tasa de conversión.",
  },
  {
    icon: CreditCardIcon,
    title: "Los métodos de pago que tus clientes prefieren",
    text: "Acepta tarjetas de crédito, débito y efectivo en OXXO, además de otros medios como Mercado Pago o PayPal.",
  },
  {
    icon: BoxPackedIcon,
    title: "Comisiones competitivas",
    text: "Con Pago Nube solo pagas una comisión por el método de pago (tarjeta o efectivo), no por procesar la transacción. Así, aumentas la rentabilidad de tu negocio.",
  },
];

const detalleItems = [
  {
    title: "Toma decisiones inteligentes",
    desc: "Consulta las ventas, reembolsos y estados de cuenta en el panel unificado.",
  },
  {
    title: "Automatiza tus cobros",
    desc: "Programa el envío de tu dinero a la cuenta bancaria que prefieras.",
  },
  {
    title: "Ofrece meses sin intereses",
    desc: "Incentiva las ventas con hasta 18 meses sin intereses.",
  },
  {
    title: "Protección por contracargos",
    desc: "Te reembolsamos el monto de la venta al enviar la documentación solicitada. Además, cuentas con tecnología antifraude y soporte especializado.",
  },
  {
    title: "Vende a Estados Unidos",
    desc: "Con Pago Nube, puedes vender en USD a tus clientes en EEUU.",
  },
];

const faqItems = [
  {
    q: "Al activar la solución nativa se desactivan Mercado Pago, PayPal o Kueski?",
    a: "No. Al activar Pago Nube puedes seguir usando otros métodos de pago como Mercado Pago, PayPal o Kueski en tu tienda. Son soluciones complementarias.",
  },
  {
    q: "¿Cómo se protege al comprador y a mi negocio?",
    a: "Pago Nube cuenta con tecnología antifraude avanzada y protección por contracargos. Te reembolsamos el monto de la venta al enviar la documentación solicitada.",
  },
  {
    q: "¿Cuándo veo mi dinero?",
    a: "Los pagos con tarjeta se acreditan en 2 días hábiles. Los pagos con OXXO se acreditan al día siguiente de que el cliente realiza el pago.",
  },
  {
    q: "¿El checkout tiene redirección?",
    a: "No. Con Pago Nube el checkout es transparente: los clientes completan el pago sin salir de tu tienda, lo que mejora la tasa de conversión.",
  },
  {
    q: "¿Cuándo puedo retirar?",
    a: "Puedes programar retiros automáticos a tu cuenta bancaria o realizarlos de forma manual desde el panel de control.",
  },
  {
    q: "¿Cómo sabré por qué se rechazó un pago?",
    a: "Desde el panel de Pago Nube puedes ver el motivo de rechazo de cada pago, lo que te permite tomar acción y contactar al cliente si es necesario.",
  },
  {
    q: "¿Puedo probar sin riesgo?",
    a: "Sí. Puedes activar Pago Nube y probarlo sin compromiso. No hay costos fijos ni cargos por transacciones rechazadas.",
  },
];

export function PagoNubeLandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <AppHeader />
        <div className="settings-page-container">
          <div className="lp-page">
            {/* ── Hero ── */}
            <section className="lp-hero">
              <div className="lp-hero-image-wrap">
                <img
                  src="/images/pago-nube-hero.png"
                  alt="Pago Nube hero"
                  className="lp-hero-img"
                />
              </div>
              <div className="lp-hero-content">
                <div className="lp-hero-text">
                  <div className="lp-caption-group">
                    <p className="lp-caption">PAGO NUBE</p>
                    <h1 className="lp-hero-title">
                      Cobra fácil y gana más, sin salir de tu tienda
                    </h1>
                  </div>
                  <p className="lp-hero-subtitle">
                    Todo lo que necesitas para recibir tus pagos está en un solo
                    lugar: rápido, seguro y sin comisiones por transacción.
                  </p>
                </div>
                <div className="lp-hero-actions">
                  <button
                    className="lp-btn-primary"
                    onClick={() => navigate("/configuracion/activar-pago-nube", { state: { from: "/pago-nube" } })}
                  >
                    Configurar
                  </button>
                  <button className="lp-btn-secondary">
                    <CalculatorIcon size="small" />
                    Calculadora de comisiones
                  </button>
                </div>
              </div>
            </section>

            {/* ── Beneficios ── */}
            <section className="lp-beneficios">
              <h2 className="lp-section-title">El aliado ideal para tu tienda</h2>
              <div className="lp-cards-grid">
                {benefitCards.map((card) => (
                  <div className="lp-benefit-card" key={card.title}>
                    <div className="lp-icon-circle-wrap">
                      <div className="lp-icon-circle-bg" />
                      <div className="lp-icon-circle-icon">
                        <card.icon size="small" />
                      </div>
                    </div>
                    <div className="lp-benefit-card-body">
                      <h3 className="lp-benefit-card-title">{card.title}</h3>
                      <p className="lp-benefit-card-text">{card.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Detalle ── */}
            <section className="lp-detalle">
              <h2 className="lp-section-title">Lleva el control fácilmente</h2>
              <div className="lp-detalle-group">
                <div className="lp-accordion-group">
                  {detalleItems.map((item, idx) => (
                    <div
                      className={`lp-accordion-item${idx < detalleItems.length - 1 ? " lp-accordion-item--bordered" : ""}`}
                      key={item.title}
                    >
                      <h4 className="lp-accordion-title">{item.title}</h4>
                      <p className="lp-accordion-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="lp-detalle-image-wrap">
                  <img
                    src="/images/pago-nube-vantagens.png"
                    alt="Panel de pagos"
                    className="lp-detalle-img"
                  />
                </div>
              </div>
            </section>

            {/* ── Planes ── */}
            <section className="lp-planes">
              <h2 className="lp-planes-title">
                Calcula las comisiones y ganancias según el plan que elijas.
              </h2>
              <div className="lp-plan-cards">
                {/* Card Tarjetas */}
                <div className="lp-plan-card">
                  <div className="lp-plan-card-header">
                    <div className="lp-icon-circle-wrap">
                      <div className="lp-icon-circle-bg" />
                      <div className="lp-icon-circle-icon">
                        <CreditCardIcon size="medium" />
                      </div>
                    </div>
                    <h3 className="lp-plan-card-title">
                      Tarjeta de crédito o débito
                    </h3>
                  </div>
                  <div className="lp-plan-card-stats">
                    <div className="lp-plan-stat">
                      <p className="lp-plan-stat-label">Recibe en</p>
                      <p className="lp-plan-stat-value">1 día</p>
                    </div>
                    <div className="lp-plan-stat">
                      <p className="lp-plan-stat-label">
                        Comisión por cobro con tarjeta
                      </p>
                      <p className="lp-plan-stat-value">
                        3.29% + $3{" "}
                        <span className="lp-plan-stat-iva">+ IVA</span>
                      </p>
                    </div>
                  </div>
                  <p className="lp-plan-note">Sin costo por transacción</p>
                </div>

                {/* Card Efectivo */}
                <div className="lp-plan-card">
                  <div className="lp-plan-card-header">
                    <div className="lp-icon-circle-wrap">
                      <div className="lp-icon-circle-bg" />
                      <div className="lp-icon-circle-icon">
                        <BarcodeIcon size="medium" />
                      </div>
                    </div>
                    <h3 className="lp-plan-card-title">Efectivo en OXXO</h3>
                  </div>
                  <div className="lp-plan-card-stats">
                    <div className="lp-plan-stat">
                      <p className="lp-plan-stat-label">Recibe en</p>
                      <p className="lp-plan-stat-value">1 día</p>
                    </div>
                    <div className="lp-plan-stat">
                      <p className="lp-plan-stat-label">
                        Comisión por cobro en efectivo
                      </p>
                      <p className="lp-plan-stat-value">
                        3.49% + $4{" "}
                        <span className="lp-plan-stat-iva">+ IVA</span>
                      </p>
                    </div>
                  </div>
                  <p className="lp-plan-note">Sin costo por transacción</p>
                </div>
              </div>

              <div className="lp-planes-actions">
                <button
                  className="lp-btn-primary"
                  onClick={() => navigate("/configuracion/activar-pago-nube", { state: { from: "/pago-nube" } })}
                >
                  Configurar
                </button>
                <button className="lp-btn-secondary">
                  <CalculatorIcon size="small" />
                  Calculadora de comisiones
                </button>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section className="lp-faq">
              <h2 className="lp-section-title">Preguntas frecuentes</h2>
              <div className="lp-faq-card">
                {faqItems.map((item, idx) => (
                  <div className="lp-faq-item" key={idx}>
                    <button
                      className="lp-faq-question"
                      onClick={() =>
                        setOpenFaq(openFaq === idx ? null : idx)
                      }
                      aria-expanded={openFaq === idx}
                    >
                      <span className="lp-faq-question-text">{item.q}</span>
                      <span
                        className={`lp-faq-chevron${openFaq === idx ? " open" : ""}`}
                      >
                        <ChevronDownSvg />
                      </span>
                    </button>
                    {openFaq === idx && (
                      <p className="lp-faq-answer">{item.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── Footer / Help link ── */}
            <footer className="lp-footer">
              <a href="#" className="lp-help-link">
                <span className="lp-help-link-icon">
                  <QuestionCircleIcon size="small" />
                </span>
                <span className="lp-help-link-text">
                  Más sobre Pago Nube
                  <ExternalLinkIcon size="small" />
                </span>
              </a>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDownSvg() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
