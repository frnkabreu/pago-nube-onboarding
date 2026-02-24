import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeftIcon,
  MoneyIcon,
  TruckIcon,
  LocationIcon,
  MailIcon,
  WhatsappIcon,
  ShoppingCartIcon,
  ChatDotsIcon,
  UserGroupIcon,
  GlobeIcon,
  CodeIcon,
  LinkIcon,
  PencilIcon,
} from "@nimbus-ds/icons";
import "../styles/settings-sidebar.css";

interface SettingsItem {
  label: string;
  icon: React.ComponentType<{ size?: string }>;
  path: string;
  activePaths?: string[];
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const settingsSections: SettingsSection[] = [
  {
    title: "Pagos y envíos",
    items: [
      {
        label: "Métodos de pago",
        icon: MoneyIcon,
        path: "/configuracion/medios-pago",
        activePaths: ["/configuracion/medios-pago", "/configuracion/activar-pago-nube"],
      },
      { label: "Medios de envío", icon: TruckIcon, path: "/configuracion/medios-envio" },
      { label: "Centros de distribución", icon: LocationIcon, path: "/configuracion/centros-distribucion" },
    ],
  },
  {
    title: "Comunicación",
    items: [
      { label: "Información de contacto", icon: MailIcon, path: "/configuracion/contacto" },
      { label: "Botón de WhatsApp", icon: WhatsappIcon, path: "/configuracion/whatsapp" },
    ],
  },
  {
    title: "Checkout",
    items: [
      { label: "Opciones de checkout", icon: ShoppingCartIcon, path: "/configuracion/checkout" },
      { label: "Mensaje para clientes", icon: ChatDotsIcon, path: "/configuracion/mensaje-clientes" },
    ],
  },
  {
    title: "Otros",
    items: [
      { label: "Usuarios y notificaciones", icon: UserGroupIcon, path: "/configuracion/usuarios" },
      { label: "Dominios", icon: GlobeIcon, path: "/configuracion/dominios" },
      { label: "Códigos externos", icon: CodeIcon, path: "/configuracion/codigos" },
      { label: "Idiomas y monedas", icon: GlobeIcon, path: "/configuracion/idiomas" },
      { label: "Redireccionamientos 301", icon: LinkIcon, path: "/configuracion/redirecciones" },
      { label: "Campos personalizados", icon: PencilIcon, path: "/configuracion/campos" },
    ],
  },
];

export function SettingsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="settings-sidebar">
      <div className="settings-sidebar-header">
        <button
          className="settings-sidebar-back"
          onClick={() => navigate("/inicio")}
        >
          <ChevronLeftIcon size="small" />
          <span>Configuración</span>
        </button>
      </div>

      <div className="settings-sidebar-body">
        {settingsSections.map((section) => (
          <div className="settings-sidebar-section" key={section.title}>
            <div className="settings-sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <button
                key={item.label}
                className={`settings-sidebar-item${
                  (item.activePaths ?? [item.path]).includes(location.pathname) ? " active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <span className="settings-sidebar-item-icon">
                  <item.icon size="small" />
                </span>
                <span className="settings-sidebar-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
