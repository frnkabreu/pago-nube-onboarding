import { useNavigate } from "react-router-dom";
import {
  CreditCardIcon,
  BarcodeIcon,
  WalletIcon,
  CheckIcon,
  CheckCircleIcon,
} from "@nimbus-ds/icons";

interface PagoNubeHeroCardProps {
  activated?: boolean;
}

export function PagoNubeHeroCard({ activated = false }: PagoNubeHeroCardProps) {
  const navigate = useNavigate();
  return (
    <div className="pago-nube-hero">
      <div className="pago-nube-hero-left">
        <div className="pago-nube-hero-logo">
          <img
            src="/images/pagonube-logo.png"
            alt="Pagonube"
            width={104}
            height={20}
          />
        </div>

        <h2 className="pago-nube-hero-title">Cobra fácil y gana más</h2>
        <p className="pago-nube-hero-description">
          El procesador nativo de tu tienda ya está preinstalado.{" "}
        </p>

        <img
          src="/images/checkout-illustration.png"
          alt="Checkout de Pago Nube"
          className="pago-nube-hero-illustration-img"
        />
        <img
          src="/images/checkout-acelerado-badge.png"
          alt="Checkout acelerado"
          className="pago-nube-hero-checkout-badge"
        />
        <div className="pago-nube-hero-float-tag pago-nube-hero-float-tag--green">
          ¡Recibe tu<br />dinero en 1 día!
        </div>

        <span className="pago-nube-hero-check-tag pago-nube-hero-check-tag--1">
          <CheckIcon size="small" />
          <span>Checkout acelerado: <strong>3x más rápido </strong></span>
        </span>
        <span className="pago-nube-hero-check-tag pago-nube-hero-check-tag--2">
          <CheckIcon size="small" />
          <span>Ventas internacionales</span>
        </span>
      </div>

      <div className="pago-nube-hero-right">
        {activated ? (
          <div className="pago-nube-activated-alert">
            <CheckCircleIcon size="small" />
            <div className="pago-nube-activated-alert-content">
              <p className="pago-nube-activated-alert-title">¡Pago Nube activado!</p>
              <p className="pago-nube-activated-alert-text">
                Tu cuenta está activa y lista para recibir pagos.
              </p>
              <button
                className="pago-nube-btn-primary pago-nube-btn-ir-pagos"
                onClick={() => navigate("/pago-nube")}
              >
                Ir a pagos
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="pago-nube-hero-success-tag">
              ¡Sin costo por Transacción externa!
            </span>
            <div className="pago-nube-hero-actions">
              <button className="pago-nube-btn-secondary">Más información</button>
              <button
                className="pago-nube-btn-primary"
                onClick={() => navigate("/configuracion/activar-pago-nube")}
              >
                Configurar
              </button>
            </div>
          </>
        )}

        <div className="pago-nube-hero-methods">
          <div className="pago-nube-method-card">
            <div className="pago-nube-method-info">
              <span className="pago-nube-method-icon">
                <CreditCardIcon size="small" />
              </span>
              <span className="pago-nube-method-name">Crédito o débito</span>
            </div>
            <span className="pago-nube-method-commission">
              *Comisión: <strong>3.29% + $3 </strong><span className="iva">+ IVA</span>
            </span>
          </div>

          <div className="pago-nube-method-card">
            <div className="pago-nube-method-info">
              <span className="pago-nube-method-icon">
                <BarcodeIcon size="small" />
              </span>
              <span className="pago-nube-method-name">Efectivo en OXXO</span>
            </div>
            <span className="pago-nube-method-commission">
              *Comisión: <strong>3.29% + $4 </strong><span className="iva">+ IVA</span>
            </span>
          </div>

          <div className="pago-nube-method-card">
            <div className="pago-nube-method-info">
              <span className="pago-nube-method-icon">
                <WalletIcon size="small" />
              </span>
              <span className="pago-nube-method-name">Apple Pay / Google Pay</span>
            </div>
            <span className="pago-nube-method-commission">
              *Comisión: <strong>3.29% + $3 </strong><span className="iva">+ IVA</span>
            </span>
          </div>

          <p className="pago-nube-hero-disclaimer">* En el plan Pago Nube</p>
        </div>
      </div>
    </div>
  );
}
