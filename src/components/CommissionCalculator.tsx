import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/commission-calculator.css";

// ── Types ────────────────────────────────────────────────────────────────────

type Plan = "gratis" | "basico" | "tiendanube" | "avanzado";
type PaymentMethod = "tarjeta" | "msi" | "oxxo";

interface CommissionRate {
  rate: number;
  fixedFee: number;
}

interface CalculationResult {
  gross: number;
  commission: number;
  iva: number;
  costoTrans: number;
  netReceived: number;
}

// ── Commission tables ────────────────────────────────────────────────────────

const PAGO_NUBE_RATES: Record<Plan, Record<PaymentMethod, CommissionRate | null>> = {
  gratis:     { tarjeta: { rate: 0.035,  fixedFee: 4 }, msi: null,                          oxxo: { rate: 0.0349, fixedFee: 4 } },
  basico:     { tarjeta: { rate: 0.034,  fixedFee: 4 }, msi: { rate: 0.0799, fixedFee: 4 }, oxxo: { rate: 0.0349, fixedFee: 4 } },
  tiendanube: { tarjeta: { rate: 0.033,  fixedFee: 4 }, msi: { rate: 0.0789, fixedFee: 4 }, oxxo: { rate: 0.0349, fixedFee: 4 } },
  avanzado:   { tarjeta: { rate: 0.0319, fixedFee: 4 }, msi: { rate: 0.0789, fixedFee: 4 }, oxxo: { rate: 0.0349, fixedFee: 4 } },
};

const MP_RATES: Record<PaymentMethod, CommissionRate> = {
  tarjeta: { rate: 0.0349, fixedFee: 4 },
  msi:     { rate: 0.0818, fixedFee: 4 },
  oxxo:    { rate: 0.0379, fixedFee: 4 },
};

const MP_COSTO_TRANS_RATES: Record<Plan, number> = {
  gratis:     0,
  basico:     0.02,
  tiendanube: 0.01,
  avanzado:   0.006,
};

const SETTLEMENT: Record<"pn" | "mp", Record<PaymentMethod, string>> = {
  pn: { tarjeta: "1 día", msi: "1 día", oxxo: "1 día" },
  mp: { tarjeta: "En el momento", msi: "En el momento", oxxo: "3 días" },
};

const IVA_RATE = 0.16;
const MIN_AMOUNT = 1000;

// ── Calculation ───────────────────────────────────────────────────────────────

function calculate(gross: number, rate: CommissionRate, costoTransPct: number): CalculationResult {
  const commission = gross * rate.rate + rate.fixedFee;
  const iva = commission * IVA_RATE;
  const costoTrans = gross * costoTransPct;
  const netReceived = gross - commission - iva - costoTrans;
  return { gross, commission, iva, costoTrans, netReceived };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatRate(rate: number): string {
  return parseFloat((rate * 100).toFixed(2)).toString();
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCalc() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5h6M5 8h2M9 8h2M5 11h2M9 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1.5l1.2 2.4 2.7.4-1.95 1.9.46 2.7L6 7.5l-2.41 1.4.46-2.7L2.1 4.3l2.7-.4L6 1.5z"
        stroke="#00875a"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


// ── Result Card ───────────────────────────────────────────────────────────────

interface ResultCardProps {
  provider: "pn" | "mp";
  result: CalculationResult;
  method: PaymentMethod;
  pnRate: CommissionRate;
  mpRate: CommissionRate;
  costoTransPct: number;
  savings: number;
}

function ResultCard({ provider, result, method, pnRate, mpRate, costoTransPct, savings }: ResultCardProps) {
  const [open, setOpen] = useState(false);
  const isPn = provider === "pn";
  const rate = isPn ? pnRate : mpRate;

  return (
    <div className={`cc-result-card ${isPn ? "cc-result-card--pn" : "cc-result-card--mp"}`}>

      {/* Provider row: logo + badge */}
      <div className="cc-card-provider-row">
        {isPn ? (
          <h3 className="cc-provider-name-pn">Pagonube</h3>
        ) : (
          <img
            src="/logos/mercado-pago-logo.png"
            alt="Mercado Pago"
            className="cc-provider-logo"
          />
        )}
        {isPn && (
          <span className="cc-badge-best">
            <IconStar />
            Mejor opción
          </span>
        )}
      </div>

      {/* Label: same for both cards per Figma */}
      <p className="cc-card-receives-label">RECIBES</p>

      {/* Amount + Detalles on same row */}
      <div className="cc-card-amount-row">
        <p className={`cc-card-amount ${isPn ? "cc-card-amount--pn" : "cc-card-amount--mp"}`}>
          MXN {fmt(result.netReceived)}
        </p>
        <button
          type="button"
          className={`cc-detalles-toggle ${isPn ? "cc-detalles-toggle--pn" : "cc-detalles-toggle--mp"}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Detalles
          <IconChevron open={open} />
        </button>
      </div>

      {/* Details table */}
      {open && (
        <div className="cc-details-table">
          <div className="cc-dt-divider" />

          <div className="cc-dt-row cc-dt-row--bold">
            <span>Monto de la venta</span>
            <span>MXN {fmt(result.gross)}</span>
          </div>

          <div className="cc-dt-row">
            <span>Plazo de liberación</span>
            <span className="cc-dt-val--highlight">{SETTLEMENT[provider][method]}</span>
          </div>

          {method === "msi" && (
            <div className="cc-dt-row">
              <span>Meses sin intereses</span>
              <span>3 MSI</span>
            </div>
          )}

          <div className="cc-dt-row">
            <span>Tasa ({formatRate(rate.rate)}%) + MXN {fmt(rate.fixedFee)}</span>
            <span className="cc-dt-val--neg">-MXN {fmt(result.commission)}</span>
          </div>

          <div className="cc-dt-row">
            <span>IVA (16%)</span>
            <span className="cc-dt-val--neg">-MXN {fmt(result.iva)}</span>
          </div>

          {isPn ? (
            <>
              <div className="cc-dt-row">
                <span>Costo por transacción (0%)</span>
                <span className="cc-dt-val--pos">Gratis</span>
              </div>
              <div className="cc-dt-row cc-dt-row--savings">
                <span />
                <span className="cc-dt-savings">Ahorras MXN {fmt(savings)}</span>
              </div>
            </>
          ) : (
            <div className="cc-dt-row">
              <span>Costo por transacción ({formatRate(costoTransPct)}%)</span>
              {result.costoTrans > 0 ? (
                <span className="cc-dt-val--red">-MXN {fmt(result.costoTrans)}</span>
              ) : (
                <span>MXN 0.00</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<Plan, string> = {
  gratis: "Gratis",
  basico: "Básico",
  tiendanube: "Tiendanube",
  avanzado: "Avanzado",
};

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "tarjeta", label: "Tarjeta de débito o crédito en un solo pago" },
  { value: "msi",     label: "Meses sin intereses" },
  { value: "oxxo",    label: "Efectivo en OXXO" },
];

const METHOD_LABELS: Record<PaymentMethod, string> = {
  tarjeta: "Tarjeta de débito o crédito en un solo pago",
  msi:     "Meses sin intereses",
  oxxo:    "Efectivo en OXXO",
};

interface CommissionCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Amount input helpers ──────────────────────────────────────────────────────

/** Remove thousand separators and parse to float */
function parseInput(val: string): number {
  return parseFloat(val.replace(/,/g, "")) || 0;
}

/** Format number with Mexican locale: 1,000.00 */
function fmtMXN(num: number): string {
  return num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CommissionCalculator({ isOpen, onClose }: CommissionCalculatorProps) {
  const navigate = useNavigate();

  const [view, setView] = useState<"form" | "results">("form");
  // displayAmount holds what the text input shows (formatted or raw while editing)
  const [displayAmount, setDisplayAmount] = useState(fmtMXN(MIN_AMOUNT));
  const [amountError, setAmountError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("basico");
  const [method, setMethod] = useState<PaymentMethod>("tarjeta");

  const [pnResult, setPnResult] = useState<CalculationResult | null>(null);
  const [mpResult, setMpResult] = useState<CalculationResult | null>(null);
  const [activePnRate, setActivePnRate] = useState<CommissionRate | null>(null);

  if (!isOpen) return null;

  const gross = parseInput(displayAmount);
  const pnRate = PAGO_NUBE_RATES[plan][method];
  const methodAvailable = pnRate !== null;

  const getAmountError = (val: string): string | null => {
    const num = parseInput(val);
    if (!val || num <= 0) return "Ingresa un monto válido.";
    if (num < MIN_AMOUNT) return "El monto mínimo es MXN 1,000.00.";
    return null;
  };

  // Real-time validation on every keystroke
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and one decimal period while typing
    const raw = e.target.value.replace(/[^\d.]/g, "");
    // Prevent more than one decimal separator
    const parts = raw.split(".");
    const cleaned = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;
    setDisplayAmount(cleaned);
    setAmountError(getAmountError(cleaned));
  };

  // On focus: strip formatting so the user can type freely (e.g. "1000" not "1,000.00")
  const handleAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const num = parseInput(e.target.value);
    if (!isNaN(num) && num > 0) {
      setDisplayAmount(num.toString());
    }
    e.target.select();
  };

  // On blur: apply Mexican formatting
  const handleAmountBlur = () => {
    const num = parseInput(displayAmount);
    if (!isNaN(num) && num > 0) {
      setDisplayAmount(fmtMXN(num));
    }
    // Keep error visible after blur if still invalid
    setAmountError(getAmountError(displayAmount));
  };

  const validate = (): boolean => {
    const err = getAmountError(displayAmount);
    setAmountError(err);
    return err === null;
  };

  const handleCalcular = () => {
    if (!validate() || !pnRate) return;
    const pn = calculate(gross, pnRate, 0);
    const mp = calculate(gross, MP_RATES[method], MP_COSTO_TRANS_RATES[plan]);
    setPnResult(pn);
    setMpResult(mp);
    setActivePnRate(pnRate);
    setView("results");
  };

  const handleReset = () => {
    setView("form");
    setPnResult(null);
    setMpResult(null);
    setDisplayAmount(fmtMXN(MIN_AMOUNT));
    setAmountError(null);
  };

  const resetAll = () => {
    setView("form");
    setDisplayAmount(fmtMXN(MIN_AMOUNT));
    setAmountError(null);
    setPlan("basico");
    setMethod("tarjeta");
    setPnResult(null);
    setMpResult(null);
    setActivePnRate(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const savings = mpResult ? mpResult.costoTrans : 0;
  const costoTransPct = MP_COSTO_TRANS_RATES[plan];

  return (
    <div className="cc-overlay" role="dialog" aria-modal="true" onClick={handleOverlay}>
      <div className="cc-modal">

        {/* ── Header ── */}
        <div className="cc-header">
          <div className="cc-header-left">
            <div className="cc-header-icon"><IconCalc /></div>
            <h2 className="cc-header-title">Calculadora de comisiones</h2>
          </div>
          <button type="button" className="cc-close-btn" onClick={handleClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </div>

        <p className="cc-subtitle">
          Compara las tarifas de Pago Nube y Mercado Pago para conocer tu ganancia en cada venta.
        </p>

        {/* ══════ FORM VIEW ══════ */}
        {view === "form" && (
          <div className="cc-form">

            {/* Amount */}
            <div className="cc-field">
              <label className="cc-field-label">Monto de la venta</label>
              <div className={`cc-mxn-input${amountError ? " cc-mxn-input--error" : ""}`}>
                <span className="cc-mxn-prefix">MXN</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="cc-mxn-number"
                  placeholder="1,000.00"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  onFocus={handleAmountFocus}
                  onBlur={handleAmountBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleCalcular()}
                  autoFocus
                />
              </div>
              {amountError && <p className="cc-field-error">{amountError}</p>}
            </div>

            {/* Plan */}
            <div className="cc-field">
              <label className="cc-field-label cc-field-label--light">¿Cuál es tu plan de Tiendanube?</label>
              <select
                className="cc-select"
                value={plan}
                onChange={(e) => setPlan(e.target.value as Plan)}
              >
                {(Object.keys(PLAN_LABELS) as Plan[]).map((p) => (
                  <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                ))}
              </select>
            </div>

            {/* Method */}
            <div className="cc-field">
              <label className="cc-field-label cc-field-label--light">¿Qué forma de pago querés ofrecer?</label>
              <select
                className="cc-select"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                {METHOD_OPTIONS.map((opt) => {
                  const unavailable = PAGO_NUBE_RATES[plan][opt.value] === null;
                  return (
                    <option key={opt.value} value={opt.value} disabled={unavailable}>
                      {opt.label}{unavailable ? " (no disponible)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* CTA */}
            <div className="cc-form-footer">
              <button
                type="button"
                className="cc-btn-calcular"
                onClick={handleCalcular}
                disabled={!methodAvailable}
              >
                Calcular tasas
              </button>
            </div>

          </div>
        )}

        {/* ══════ RESULTS VIEW ══════ */}
        {view === "results" && pnResult && mpResult && activePnRate && (
          <div className="cc-results">

            {/* Method info bar */}
            <div className="cc-method-bar">
              Método de pago: <strong>{METHOD_LABELS[method]}</strong>
            </div>

            {/* PN card */}
            <ResultCard
              provider="pn"
              result={pnResult}
              method={method}
              pnRate={activePnRate}
              mpRate={MP_RATES[method]}
              costoTransPct={costoTransPct}
              savings={savings}
            />

            {/* MP card */}
            <ResultCard
              provider="mp"
              result={mpResult}
              method={method}
              pnRate={activePnRate}
              mpRate={MP_RATES[method]}
              costoTransPct={costoTransPct}
              savings={savings}
            />

            {/* Footer: two buttons side by side */}
            <div className="cc-results-footer">
              <button type="button" className="cc-btn-recalculate" onClick={handleReset}>
                <IconCalc />
                Calcular otra cantidad
              </button>
              <button
                type="button"
                className="cc-btn-activate"
                onClick={() => {
                  handleClose();
                  navigate("/configuracion/activar-pago-nube", { state: { from: "/pago-nube" } });
                }}
              >
                Activar Pago Nube
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
