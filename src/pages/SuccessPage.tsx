import { useEffect } from "react";
import { Box } from "@nimbus-ds/box";
import { Text } from "@nimbus-ds/text";
import { Title } from "@nimbus-ds/title";
import { Button } from "@nimbus-ds/button";
import { CheckCircleIcon } from "@nimbus-ds/icons";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../contexts/OnboardingContext";

export function SuccessPage() {
  const navigate = useNavigate();
  const { completeStep, resetOnboarding } = useOnboarding();

  useEffect(() => {
    completeStep(6);
  }, [completeStep]);

  const handleGoToDashboard = () => {
    // In a real app, this would navigate to the main dashboard
    alert("Redirecionando para o dashboard...");
    resetOnboarding();
    navigate("/");
  };

  const handleStartAgain = () => {
    resetOnboarding();
    navigate("/");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      backgroundColor="neutral-background"
      padding="6"
    >
      <Box
        maxWidth="600px"
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="6"
      >
        {/* Success Icon */}
        <Box
          width="120px"
          height="120px"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ 
            backgroundColor: "#f0fdf4",
            border: "4px solid #b9f8cf",
            color: "#00a63e",
            fontSize: "60px"
          }}
        >
          <CheckCircleIcon />
        </Box>

        {/* Success Message */}
        <Box display="flex" flexDirection="column" alignItems="center" gap="2" textAlign="center">
          <Title as="h1">¡Pago Nube activado!</Title>
          <Text color="neutral-textLow" fontSize="base">
            Tu cuenta ha sido creada exitosamente. Ya puedes empezar a recibir pagos en tu tienda.
          </Text>
        </Box>

        {/* Success Details */}
        <Box
          width="100%"
          padding="4"
          borderRadius="2"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb"
          }}
        >
          <Box display="flex" flexDirection="column" gap="3">
            <Text fontWeight="bold">Próximos pasos:</Text>
            <Box display="flex" alignItems="flex-start" gap="2">
              <Text>1.</Text>
              <Text fontSize="caption" color="neutral-textLow">
                Configura tus métodos de pago en tu tienda
              </Text>
            </Box>
            <Box display="flex" alignItems="flex-start" gap="2">
              <Text>2.</Text>
              <Text fontSize="caption" color="neutral-textLow">
                Realiza tu primera venta de prueba
              </Text>
            </Box>
            <Box display="flex" alignItems="flex-start" gap="2">
              <Text>3.</Text>
              <Text fontSize="caption" color="neutral-textLow">
                Revisa tu dashboard para acompañar los pagos
              </Text>
            </Box>
          </Box>
        </Box>

        {/* CTA Buttons */}
        <Box width="100%" display="flex" flexDirection="column" gap="3" marginTop="4">
          <Button
            appearance="primary"
            onClick={handleGoToDashboard}
            style={{ width: "100%" }}
          >
            Ir al Dashboard
          </Button>
          <Button
            appearance="neutral"
            onClick={handleStartAgain}
            style={{ width: "100%" }}
          >
            Volver al inicio
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
