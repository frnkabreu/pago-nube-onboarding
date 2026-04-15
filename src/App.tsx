import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/** Base do app (Vite `base`); necessário para GitHub Pages em subpath. */
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { SalesProvider } from "./lib/sales-context";
import { PaymentMethodsPage } from "./pages/PaymentMethodsPage";
import { PersonalDataPage } from "./pages/PersonalDataPage";
import { BankAccountPage } from "./pages/BankAccountPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SuccessPage } from "./pages/SuccessPage";
import { InicioPage } from "./pages/InicioPage";
import { MediosDePagoPage } from "./pages/MediosDePagoPage";
import { PagoNubeLandingPage } from "./pages/PagoNubeLandingPage";
import { ActivarPagoNubePage } from "./pages/ActivarPagoNubePage";
import { DatosPersonalesConfigPage } from "./pages/DatosPersonalesConfigPage";
import DashboardPage from "./pages/DashboardPage";
import FlujoDeCajaPage from "./pages/FlujoDeCajaPage";
import IngresosPrevistos from "./pages/IngresosPrevistos";
import SaludPagosPage from "./pages/SaludPagosPage";
import ExtractoPage from "./pages/ExtractoPage";
import PagosPage from "./pages/PagosPage";
import { LoginPage } from "./pages/LoginPage";
import { isAccessGranted } from "./lib/app-access";

function App() {
  const [unlocked, setUnlocked] = useState(() => isAccessGranted());

  if (!unlocked) {
    return <LoginPage onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <OnboardingProvider>
      <SalesProvider>
        <BrowserRouter basename={routerBasename}>
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<InicioPage />} />
            <Route path="/pago-nube" element={<PagoNubeLandingPage />} />
            <Route path="/configuracion/medios-pago" element={<MediosDePagoPage />} />
            <Route path="/configuracion/activar-pago-nube" element={<ActivarPagoNubePage />} />
            <Route path="/configuracion/datos-personales" element={<DatosPersonalesConfigPage />} />
            <Route path="/onboarding/metodos-pago" element={<PaymentMethodsPage />} />
            <Route path="/onboarding/datos-personales" element={<PersonalDataPage />} />
            <Route path="/onboarding/cuenta-bancaria" element={<BankAccountPage />} />
            <Route path="/onboarding/revision" element={<ReviewPage />} />
            <Route path="/onboarding/sucesso" element={<SuccessPage />} />
            {/* Dashboard financeiro — pós-ativação */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/flujo-de-caja" element={<FlujoDeCajaPage />} />
            <Route path="/ingresos-previstos" element={<IngresosPrevistos />} />
            <Route path="/salud-pagos" element={<SaludPagosPage />} />
            <Route path="/extracto" element={<ExtractoPage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Routes>
        </BrowserRouter>
      </SalesProvider>
    </OnboardingProvider>
  );
}

export default App;
