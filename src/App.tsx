import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OnboardingProvider } from "./contexts/OnboardingContext";
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

function App() {
  return (
    <OnboardingProvider>
      <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </BrowserRouter>
    </OnboardingProvider>
  );
}

export default App;
