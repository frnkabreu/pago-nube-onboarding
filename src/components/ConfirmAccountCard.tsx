import { useState } from "react";
import { InfoCircleIcon, CloseIcon } from "@nimbus-ds/icons";

export function ConfirmAccountCard() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="confirm-card">
      <div className="confirm-card-inner">
        <span className="confirm-card-icon-circle">
          <InfoCircleIcon size="small" />
        </span>
        <div className="confirm-card-content">
          <div className="confirm-card-title">Confirma tu cuenta</div>
          <div className="confirm-card-text">
            Revisa tu correo electrónico testemx@gmail.com y asegura tu acceso.
          </div>
        </div>
        <a href="#" className="confirm-card-link">
          Reenviar e-mail
        </a>
        <button
          className="confirm-card-close"
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
        >
          <CloseIcon size="small" />
        </button>
      </div>
    </div>
  );
}
