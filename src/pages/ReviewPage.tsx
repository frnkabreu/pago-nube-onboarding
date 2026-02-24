import { Box } from "@nimbus-ds/box";
import { Text } from "@nimbus-ds/text";
import { Title } from "@nimbus-ds/title";
import { Card } from "@nimbus-ds/card";
import { CheckCircleIcon, CreditCardIcon, UserCircleIcon, WalletIcon } from "@nimbus-ds/icons";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../contexts/OnboardingContext";
import { NavigationButtons, ProgressBar } from "../components/OnboardingComponents";

export function ReviewPage() {
  const navigate = useNavigate();
  const { data, completeStep, previousStep } = useOnboarding();

  const handleNext = () => {
    completeStep(5);
    navigate("/onboarding/sucesso");
  };

  const handleBack = () => {
    previousStep();
    navigate("/onboarding/cuenta-bancaria");
  };

  const handleEdit = (page: string) => {
    navigate(page);
  };

  return (
    <Box backgroundColor="neutral-background" minHeight="100vh" padding="6">
      <Box maxWidth="700px" marginX="auto">
        <ProgressBar current={5} total={6} />
        
        <Box marginTop="4" marginBottom="6">
          <Title as="h1">Revisa tu información</Title>
          <Box marginTop="2">
            <Text color="neutral-textLow">
              Confirma que todos los datos sean correctos antes de enviar
            </Text>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap="4">
          {/* Payment Methods */}
          <Card>
            <Card.Body>
              <Box display="flex" flexDirection="column" gap="3">
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap="2" style={{ color: "#0059d5" }}>
                    <CreditCardIcon />
                    <Text fontWeight="bold">Medios de pago</Text>
                  </Box>
                  <Box
                    as="button"
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#0059d5",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500
                    }}
                    onClick={() => handleEdit("/onboarding/metodos-pago")}
                  >
                    Editar
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap="1">
                  {data.selectedMethods.length > 0 ? (
                    data.selectedMethods.map(method => (
                      <Box key={method} display="flex" alignItems="center" gap="2">
                        <CheckCircleIcon size="small" color="success-textHigh" />
                        <Text fontSize="caption">{method}</Text>
                      </Box>
                    ))
                  ) : (
                    <Text fontSize="caption" color="neutral-textLow">
                      Ningún método seleccionado
                    </Text>
                  )}
                </Box>
              </Box>
            </Card.Body>
          </Card>

          {/* Personal Data */}
          <Card>
            <Card.Body>
              <Box display="flex" flexDirection="column" gap="3">
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap="2" style={{ color: "#0059d5" }}>
                    <UserCircleIcon />
                    <Text fontWeight="bold">Datos personales</Text>
                  </Box>
                  <Box
                    as="button"
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#0059d5",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500
                    }}
                    onClick={() => handleEdit("/onboarding/datos-personales")}
                  >
                    Editar
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap="1">
                  <InfoRow label="RFC" value={data.rfc} />
                  <InfoRow label="Nombre" value={data.fullName} />
                  <InfoRow label="Email" value={data.email} />
                  <InfoRow label="Teléfono" value={data.phone} />
                </Box>
              </Box>
            </Card.Body>
          </Card>

          {/* Bank Account */}
          <Card>
            <Card.Body>
              <Box display="flex" flexDirection="column" gap="3">
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap="2" style={{ color: "#0059d5" }}>
                    <WalletIcon />
                    <Text fontWeight="bold">Cuenta bancaria</Text>
                  </Box>
                  <Box
                    as="button"
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#0059d5",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500
                    }}
                    onClick={() => handleEdit("/onboarding/cuenta-bancaria")}
                  >
                    Editar
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap="1">
                  <InfoRow label="Banco" value={data.bankName} />
                  <InfoRow label="Tipo" value={data.accountType === "corrente" ? "Cuenta Corriente" : "Cuenta de Ahorro"} />
                  <InfoRow label="CLABE" value={data.clabe ? `****${data.clabe.slice(-4)}` : undefined} />
                </Box>
              </Box>
            </Card.Body>
          </Card>
        </Box>

        <NavigationButtons
          onNext={handleNext}
          onBack={handleBack}
          nextLabel="Confirmar y activar"
        />
      </Box>
    </Box>
  );
}

interface InfoRowProps {
  label: string;
  value?: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Box display="flex" justifyContent="space-between" paddingY="1">
      <Text fontSize="caption" color="neutral-textLow">
        {label}
      </Text>
      <Text fontSize="caption" fontWeight="medium">
        {value || "—"}
      </Text>
    </Box>
  );
}
