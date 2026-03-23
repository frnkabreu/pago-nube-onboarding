import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@nimbus-ds/input";
import { Button } from "@nimbus-ds/button";
import { Spinner } from "@nimbus-ds/spinner";
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
  const location = useLocation();
  const { from } = (location.state as { from?: string }) ?? {};

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const [dateParts, setDateParts] = useState({ day: "", month: "", year: "" });

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
  const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: keyof FormErrors, currentData?: FormData): string | undefined => {
    const data = currentData ?? formData;
    switch (field) {
      case "nombre":
        return !data.nombre.trim() ? "Nombre es obligatorio" : undefined;
      case "apellido":
        return !data.apellido.trim() ? "Apellido es obligatorio" : undefined;
      case "telefono":
        if (!data.telefono.trim()) return "Teléfono es obligatorio";
        if (!/^\d{10}$/.test(data.telefono.replace(/\D/g, ""))) return "Ingresa 10 dígitos";
        return undefined;
      case "fechaNacimiento":
        return !data.fechaNacimiento ? "Fecha de nacimiento es obligatoria" : undefined;
      case "categoria":
        return !data.categoria ? "Selecciona una categoría" : undefined;
      case "calle":
        return !data.calle.trim() ? "Calle es obligatoria" : undefined;
      case "numero":
        return !data.sinNumero && !data.numero.trim()
          ? "Ingresa un número o marca Sin número"
          : undefined;
      case "codigoPostal":
        return !data.codigoPostal || data.codigoPostal.length < 5
          ? "Código postal debe tener 5 dígitos"
          : undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    if (touched[field as keyof FormErrors]) {
      const error = validateField(field as keyof FormErrors, updatedData);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleCodigoPostal = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 5);
    const updatedData: FormData = digits.length === 5
      ? { ...formData, codigoPostal: digits, estado: "Ciudad de México", municipio: "Cuauhtémoc", colonia: "Centro Histórico" }
      : { ...formData, codigoPostal: digits, estado: "", municipio: "", colonia: "" };

    setFormData(updatedData);

    if (touched.codigoPostal) {
      const error = validateField("codigoPostal", updatedData);
      setErrors((prev) => ({ ...prev, codigoPostal: error }));
    }
  };

  const syncFechaNacimiento = (day: string, month: string, year: string) => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      handleChange("fechaNacimiento", `${year}-${month}-${day}`);
    } else {
      handleChange("fechaNacimiento", "");
    }
  };

  const handleDateDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDateParts((prev) => ({ ...prev, day: val }));
    if (val.length === 2) monthRef.current?.focus();
    syncFechaNacimiento(val, dateParts.month, dateParts.year);
  };

  const handleDateMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDateParts((prev) => ({ ...prev, month: val }));
    if (val.length === 2) yearRef.current?.focus();
    syncFechaNacimiento(dateParts.day, val, dateParts.year);
  };

  const handleDateYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setDateParts((prev) => ({ ...prev, year: val }));
    syncFechaNacimiento(dateParts.day, dateParts.month, val);
  };

  const handleDateBlur = () => {
    setTouched((prev) => ({ ...prev, fechaNacimiento: true }));
    const error = validateField("fechaNacimiento");
    setErrors((prev) => ({ ...prev, fechaNacimiento: error }));
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

  const validate = (): FormErrors | null => {
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
    return Object.keys(newErrors).length > 0 ? newErrors : null;
  };

  const handleGuardar = () => {
    navigate("/configuracion/activar-pago-nube", { state: { from } });
  };

  const handleEnviar = () => {
    const validationErrors = validate();
    if (validationErrors) {
      setTouched({
        nombre: true,
        apellido: true,
        telefono: true,
        fechaNacimiento: true,
        categoria: true,
        calle: true,
        numero: true,
        codigoPostal: true,
      });
      const fieldOrder: Array<[keyof FormErrors, string]> = [
        ["nombre", "dpcp-nombre"],
        ["apellido", "dpcp-apellido"],
        ["telefono", "dpcp-telefono"],
        ["fechaNacimiento", "dpcp-fecha"],
        ["categoria", "dpcp-categoria"],
        ["calle", "dpcp-calle"],
        ["numero", "dpcp-numero"],
        ["codigoPostal", "dpcp-cp"],
      ];
      for (const [key, id] of fieldOrder) {
        if (validationErrors[key]) {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("pagoNubeActivated", "true");
      navigate("/configuracion/medios-pago", {
        state: { pagoNubeActivated: true },
      });
    }, 1500);
  };

  return (
    <SettingsShell
      onBack={() => navigate("/configuracion/activar-pago-nube", { state: { from } })}
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
              onBlur={() => handleBlur("nombre")}
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
              onBlur={() => handleBlur("apellido")}
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
                onBlur={() => handleBlur("telefono")}
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
            <label className="dpcp-field-label">Fecha de nacimiento</label>
            <div
              id="dpcp-fecha"
              className={`dpcp-date-parts${errors.fechaNacimiento ? " dpcp-date-parts--danger" : ""}`}
              role="group"
              aria-label="Fecha de nacimiento"
            >
              <input
                ref={dayRef}
                type="text"
                inputMode="numeric"
                className="dpcp-date-part"
                placeholder="DD"
                value={dateParts.day}
                onChange={handleDateDay}
                onBlur={handleDateBlur}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && dateParts.day === "") {
                    dayRef.current?.focus();
                  }
                }}
                maxLength={2}
                aria-label="Día"
              />
              <span className="dpcp-date-sep">/</span>
              <input
                ref={monthRef}
                type="text"
                inputMode="numeric"
                className="dpcp-date-part"
                placeholder="MM"
                value={dateParts.month}
                onChange={handleDateMonth}
                onBlur={handleDateBlur}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && dateParts.month === "") {
                    dayRef.current?.focus();
                  }
                }}
                maxLength={2}
                aria-label="Mes"
              />
              <span className="dpcp-date-sep">/</span>
              <input
                ref={yearRef}
                type="text"
                inputMode="numeric"
                className="dpcp-date-part dpcp-date-part--year"
                placeholder="AAAA"
                value={dateParts.year}
                onChange={handleDateYear}
                onBlur={handleDateBlur}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && dateParts.year === "") {
                    monthRef.current?.focus();
                  }
                }}
                maxLength={4}
                aria-label="Año"
              />
            </div>
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
              onBlur={() => handleBlur("categoria")}
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
              onBlur={() => handleBlur("calle")}
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
              onBlur={() => handleBlur("numero")}
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
              onBlur={() => handleBlur("codigoPostal")}
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
              disabled={!isFormValid || isLoading}
              onClick={handleEnviar}
            >
              {isLoading && <Spinner color="currentColor" size="small" />}
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
