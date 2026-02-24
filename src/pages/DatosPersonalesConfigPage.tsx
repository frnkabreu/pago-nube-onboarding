import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@nimbus-ds/input";
import { Button } from "@nimbus-ds/button";
import { SettingsShell } from "../components/SettingsShell";
import "../styles/datos-personales-config.css";

const PREFIJOS = ["+52", "+1", "+54", "+55", "+57", "+58"];

const CATEGORIAS = [
  "Moda y accesorios",
  "Electrónicos y tecnología",
  "Hogar y jardín",
  "Salud y belleza",
  "Deportes y fitness",
  "Juguetes y bebés",
  "Alimentos y bebidas",
  "Arte y artesanías",
  "Libros y educación",
  "Mascotas",
  "Servicios",
  "Otro",
];

interface FormData {
  nombre: string;
  apellido: string;
  prefijo: string;
  telefono: string;
  fechaNacimiento: string;
  categoria: string;
  calle: string;
  numero: string;
  sinNumero: boolean;
  codigoPostal: string;
  estado: string;
  municipio: string;
  colonia: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fechaNacimiento?: string;
  categoria?: string;
  calle?: string;
  numero?: string;
  codigoPostal?: string;
}

export function DatosPersonalesConfigPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    prefijo: "+52",
    telefono: "",
    fechaNacimiento: "",
    categoria: "",
    calle: "",
    numero: "",
    sinNumero: false,
    codigoPostal: "",
    estado: "",
    municipio: "",
    colonia: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCodigoPostal = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 5);
    setFormData((prev) => ({ ...prev, codigoPostal: digits }));
    if (errors.codigoPostal) {
      setErrors((prev) => ({ ...prev, codigoPostal: undefined }));
    }
    // Mock auto-fill for Estado/Municipio/Colonia when 5 digits are entered
    if (digits.length === 5) {
      setFormData((prev) => ({
        ...prev,
        codigoPostal: digits,
        estado: "Ciudad de México",
        municipio: "Cuauhtémoc",
        colonia: "Centro Histórico",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        codigoPostal: digits,
        estado: "",
        municipio: "",
        colonia: "",
      }));
    }
  };

  const isFormValid =
    formData.nombre.trim() !== "" &&
    formData.apellido.trim() !== "" &&
    /^\d{10}$/.test(formData.telefono.replace(/\D/g, "")) &&
    formData.fechaNacimiento !== "" &&
    formData.categoria !== "" &&
    formData.calle.trim() !== "" &&
    (formData.sinNumero || formData.numero.trim() !== "") &&
    formData.codigoPostal.length === 5;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "Nombre es obligatorio";
    if (!formData.apellido.trim()) newErrors.apellido = "Apellido es obligatorio";
    if (!formData.telefono.trim()) {
      newErrors.telefono = "Teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ""))) {
      newErrors.telefono = "Ingresa 10 dígitos";
    }
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Fecha de nacimiento es obligatoria";
    if (!formData.categoria) newErrors.categoria = "Selecciona una categoría";
    if (!formData.calle.trim()) newErrors.calle = "Calle es obligatoria";
    if (!formData.sinNumero && !formData.numero.trim()) newErrors.numero = "Ingresa un número o marca Sin número";
    if (!formData.codigoPostal || formData.codigoPostal.length < 5) {
      newErrors.codigoPostal = "Código postal debe tener 5 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = () => {
    navigate("/configuracion/activar-pago-nube");
  };

  const handleEnviar = () => {
    if (validate()) {
      localStorage.setItem("pagoNubeActivated", "true");
      navigate("/configuracion/medios-pago", {
        state: { pagoNubeActivated: true },
      });
    }
  };

  return (
    <SettingsShell
      onBack={() => navigate("/configuracion/activar-pago-nube")}
      backLabel="Volver"
    >
      <div className="dpcp-page">
        <h1 className="dpcp-title">Configurar Pago Nube</h1>
        <p className="dpcp-subtitle">
          Necesitamos algunos datos para completar el registro.
        </p>

        {/* Card: Datos personales */}
        <div className="dpcp-card">
          <h2 className="dpcp-card-title">Datos personales</h2>

          {/* Nombre */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-nombre" className="dpcp-field-label">
              Nombre
            </label>
            <Input
              id="dpcp-nombre"
              appearance={errors.nombre ? "danger" : "neutral"}
              type="text"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              autoComplete="given-name"
            />
            {errors.nombre && (
              <span className="dpcp-error-text">{errors.nombre}</span>
            )}
          </div>

          {/* Apellido */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-apellido" className="dpcp-field-label">
              Apellido
            </label>
            <Input
              id="dpcp-apellido"
              appearance={errors.apellido ? "danger" : "neutral"}
              type="text"
              placeholder="Ingresa tu apellido"
              value={formData.apellido}
              onChange={(e) => handleChange("apellido", e.target.value)}
              autoComplete="family-name"
            />
            {errors.apellido && (
              <span className="dpcp-error-text">{errors.apellido}</span>
            )}
          </div>

          {/* Prefijo + Teléfono */}
          <div className="dpcp-grid-2">
            <div className="dpcp-field">
              <label htmlFor="dpcp-prefijo" className="dpcp-field-label">
                Prefijo
              </label>
              <select
                id="dpcp-prefijo"
                className="dpcp-select"
                value={formData.prefijo}
                onChange={(e) => handleChange("prefijo", e.target.value)}
              >
                {PREFIJOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="dpcp-field">
              <label htmlFor="dpcp-telefono" className="dpcp-field-label">
                Teléfono
              </label>
              <Input
                id="dpcp-telefono"
                appearance={errors.telefono ? "danger" : "neutral"}
                type="tel"
                placeholder="222 222 2222"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                maxLength={10}
                autoComplete="tel"
              />
              {errors.telefono && (
                <span className="dpcp-error-text">{errors.telefono}</span>
              )}
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-fecha" className="dpcp-field-label">
              Fecha de nacimiento
            </label>
            <input
              id="dpcp-fecha"
              type="date"
              className={`dpcp-date-input${errors.fechaNacimiento ? " dpcp-date-input--danger" : ""}`}
              value={formData.fechaNacimiento}
              min="1900-01-01"
              max="9999-12-31"
              onChange={(e) => {
                const val = e.target.value;
                const year = val.split("-")[0];
                if (year && year.length > 4) return;
                handleChange("fechaNacimiento", val);
              }}
            />
            {errors.fechaNacimiento && (
              <span className="dpcp-error-text">{errors.fechaNacimiento}</span>
            )}
          </div>

          {/* Categoría de tu tienda */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-categoria" className="dpcp-field-label">
              Categoría de tu tienda
            </label>
            <select
              id="dpcp-categoria"
              className={`dpcp-select${errors.categoria ? " dpcp-select--danger" : ""}`}
              value={formData.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <span className="dpcp-error-text">{errors.categoria}</span>
            )}
          </div>
        </div>

        {/* Card: Lugar de residencia */}
        <div className="dpcp-card">
          <h2 className="dpcp-card-title">Lugar de residencia</h2>

          {/* Calle */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-calle" className="dpcp-field-label">
              Calle
            </label>
            <Input
              id="dpcp-calle"
              appearance={errors.calle ? "danger" : "neutral"}
              type="text"
              placeholder=""
              value={formData.calle}
              onChange={(e) => handleChange("calle", e.target.value)}
              autoComplete="street-address"
            />
            {errors.calle && (
              <span className="dpcp-error-text">{errors.calle}</span>
            )}
          </div>

          {/* Número + Sin número */}
          <div className="dpcp-numero-row">
            <label htmlFor="dpcp-numero" className="dpcp-field-label">
              Número
            </label>
            <Input
              id="dpcp-numero"
              appearance={errors.numero ? "danger" : "neutral"}
              type="text"
              placeholder="0"
              value={formData.sinNumero ? "" : formData.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
              disabled={formData.sinNumero}
            />
            <div className="dpcp-checkbox-row">
              <input
                id="dpcp-sin-numero"
                type="checkbox"
                checked={formData.sinNumero}
                onChange={(e) => {
                  handleChange("sinNumero", e.target.checked);
                  if (e.target.checked) {
                    handleChange("numero", "");
                    setErrors((prev) => ({ ...prev, numero: undefined }));
                  }
                }}
              />
              <label htmlFor="dpcp-sin-numero">Sin número</label>
            </div>
            {errors.numero && (
              <span className="dpcp-error-text">{errors.numero}</span>
            )}
          </div>

          {/* Código postal */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-cp" className="dpcp-field-label">
              Código postal
            </label>
            <Input
              id="dpcp-cp"
              appearance={errors.codigoPostal ? "danger" : "neutral"}
              type="text"
              placeholder=""
              value={formData.codigoPostal}
              onChange={(e) => handleCodigoPostal(e.target.value)}
              maxLength={5}
              autoComplete="postal-code"
            />
            {errors.codigoPostal && (
              <span className="dpcp-error-text">{errors.codigoPostal}</span>
            )}
          </div>

          {/* Estado */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-estado" className="dpcp-field-label">
              Estado
            </label>
            <div
              id="dpcp-estado"
              className="dpcp-input-disabled"
              aria-disabled="true"
            >
              {formData.estado}
            </div>
          </div>

          {/* Municipio */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-municipio" className="dpcp-field-label">
              Municipio
            </label>
            <div
              id="dpcp-municipio"
              className="dpcp-input-disabled"
              aria-disabled="true"
            >
              {formData.municipio}
            </div>
          </div>

          {/* Colonia */}
          <div className="dpcp-field">
            <label htmlFor="dpcp-colonia" className="dpcp-field-label">
              Colonia
            </label>
            <div
              id="dpcp-colonia"
              className="dpcp-input-disabled"
              aria-disabled="true"
            >
              {formData.colonia}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dpcp-footer">
          <p className="dpcp-terms">
            Al enviar, estás aceptando los{" "}
            <a href="#terminos" onClick={(e) => e.preventDefault()}>
              términos y condiciones
            </a>{" "}
            y el{" "}
            <a href="#stripe" onClick={(e) => e.preventDefault()}>
              acuerdo de servicio de Stripe
            </a>
            .
          </p>
          <div className="dpcp-actions">
            <Button
              appearance="neutral"
              type="button"
              onClick={handleGuardar}
            >
              Guardar y salir
            </Button>
            <Button
              appearance="primary"
              type="button"
              disabled={!isFormValid}
              onClick={handleEnviar}
            >
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
