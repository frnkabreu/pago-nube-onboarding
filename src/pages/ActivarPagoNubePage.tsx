import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@nimbus-ds/input";
import { Button } from "@nimbus-ds/button";
import { SettingsShell } from "../components/SettingsShell";
import "../styles/activar-pago-nube.css";

export function ActivarPagoNubePage() {
  const navigate = useNavigate();
  const [rfc, setRfc] = useState("");
  const [error, setError] = useState("");

  const isValid = rfc.trim().length >= 12;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRfc(e.target.value.toUpperCase());
    if (error) setError("");
  };

  const handleActivar = () => {
    if (!rfc.trim()) {
      setError("RFC es obligatorio");
      return;
    }
    if (rfc.trim().length < 12) {
      setError("RFC debe tener al menos 12 caracteres");
      return;
    }
    navigate("/configuracion/datos-personales");
  };

  return (
    <SettingsShell onBack={() => navigate(-1)} backLabel="Volver">
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
              placeholder="AAAA-######-AAA"
              value={rfc}
              onChange={handleChange}
              maxLength={13}
              autoComplete="off"
            />
            {error ? (
              <span className="apn-error-text">{error}</span>
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
            disabled={!isValid}
            onClick={handleActivar}
          >
            Activar
          </Button>
        </div>
      </div>
    </SettingsShell>
  );
}
