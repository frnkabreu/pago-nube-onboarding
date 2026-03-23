import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@nimbus-ds/input";
import { Button } from "@nimbus-ds/button";
import { Spinner } from "@nimbus-ds/spinner";
import { SettingsShell } from "../components/SettingsShell";
import "../styles/activar-pago-nube.css";

export function ActivarPagoNubePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from } = (location.state as { from?: string }) ?? {};
  const [rfc, setRfc] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("pagoNubeActivated");
  }, []);

  const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
  const rfcTrimmed = rfc.trim();
  const isValidFormat = RFC_REGEX.test(rfcTrimmed);
  const isValid = isValidFormat;
  const hasInput = rfcTrimmed.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRfc(e.target.value.toUpperCase());
    if (error) setError("");
  };

  const handleActivar = () => {
    if (!rfcTrimmed) {
      setError("RFC es obligatorio");
      return;
    }
    if (!isValidFormat) {
      setError("Formato de RFC inválido. Ejemplo: XEXX010101000");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      navigate("/configuracion/datos-personales", { state: { from } });
    }, 1500);
  };

  return (
    <SettingsShell onBack={() => (from ? navigate(from) : navigate(-1))} backLabel="Volver">
      <div className="apn-page">
        <h1 className="apn-title">Configurar Pago Nube</h1>

        <div className="apn-card">
          <h2 className="apn-card-title">Ingresa RFC</h2>
          <p className="apn-card-desc">
            Recomendamos que el documento esté vinculado a la cuenta bancaria utilizada en la tienda.
          </p>

          <div className="apn-field">
            <label htmlFor="apn-rfc" className="apn-field-label">RFC</label>
            <Input
              id="apn-rfc"
              appearance={error ? "danger" : "neutral"}
              type="text"
              placeholder="AAAA######AAA"
              value={rfc}
              onChange={handleChange}
              maxLength={13}
              autoComplete="off"
            />
            {error ? (
              <span className="apn-error-text">{error}</span>
            ) : isValidFormat ? (
              <span className="apn-valid-text">
                <svg
                  className="apn-valid-icon"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" fill="#00875a" />
                  <path
                    d="M5 8l2 2 4-4"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                RFC válido
              </span>
            ) : hasInput ? (
              <span className="apn-hint-text">
                <svg
                  className="apn-helper-icon"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M8 7v5M8 5.5v.01"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                Formato incompleto. Ejemplo: XEXX010101000
              </span>
            ) : (
              <span className="apn-helper">
                <svg
                  className="apn-helper-icon"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M8 7v5M8 5.5v.01"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                Ingresa tu RFC sin espacio y sin guiones.
              </span>
            )}
          </div>
        </div>

        <div className="apn-actions">
          <Button
            appearance="neutral"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            appearance="primary"
            type="button"
            disabled={!isValid || isLoading}
            onClick={handleActivar}
          >
            {isLoading && <Spinner color="currentColor" size="small" />}
            {isLoading ? "Verificando..." : "Activar"}
          </Button>
        </div>
      </div>
    </SettingsShell>
  );
}
