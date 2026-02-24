import { useState } from "react";
import { Box } from "@nimbus-ds/box";
import { Text } from "@nimbus-ds/text";
import { Title } from "@nimbus-ds/title";
import { Input } from "@nimbus-ds/input";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../contexts/OnboardingContext";
import { NavigationButtons, ProgressBar } from "../components/OnboardingComponents";

export function BankAccountPage() {
  const navigate = useNavigate();
  const { data, updateData, completeStep, previousStep } = useOnboarding();
  
  const [formData, setFormData] = useState({
    bankName: data.bankName || "",
    accountType: data.accountType || "corrente",
    accountNumber: data.accountNumber || "",
    clabe: data.clabe || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName) newErrors.bankName = "Selecciona un banco";
    if (!formData.clabe) {
      newErrors.clabe = "CLABE es obligatoria";
    } else if (formData.clabe.length !== 18) {
      newErrors.clabe = "CLABE debe tener 18 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      updateData(formData);
      completeStep(4);
      navigate("/onboarding/revision");
    }
  };

  const handleBack = () => {
    previousStep();
    navigate("/onboarding/datos-personales");
  };

  const BANKS = [
    "BBVA", "Santander", "Citibanamex", "Banorte", "HSBC", 
    "Scotiabank", "Inbursa", "Banco Azteca", "Banregio", "Otro"
  ];

  return (
    <Box backgroundColor="neutral-background" minHeight="100vh" padding="6">
      <Box maxWidth="700px" marginX="auto">
        <ProgressBar current={4} total={6} />
        
        <Box marginTop="4" marginBottom="6">
          <Title as="h1">Cuenta bancaria</Title>
          <Box marginTop="2">
            <Text color="neutral-textLow">
              Ingresa los datos de la cuenta donde quieres recibir tu dinero
            </Text>
          </Box>
        </Box>

        {/* Info Banner */}
        <Box
          padding="3"
          borderRadius="2"
          marginBottom="6"
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe"
          }}
        >
          <Text fontSize="caption" style={{ color: "#1e40af" }}>
            💡 Esta cuenta será utilizada para depositar tus ventas automáticamente
          </Text>
        </Box>

        <Box display="flex" flexDirection="column" gap="4">
          {/* Bank Selection */}
          <Box>
            <Box marginBottom="2">
              <Text fontWeight="bold">
                Banco *
              </Text>
            </Box>
            <Box
              as="select"
              padding="2"
              borderRadius="1"
              width="100%"
              style={{
                border: errors.bankName ? "1px solid #dc2626" : "1px solid #d1d5dc",
                fontSize: "14px",
                backgroundColor: "#fff"
              }}
              value={formData.bankName}
              onChange={(e: any) => handleInputChange("bankName", e.target.value)}
            >
              <option value="">Selecciona tu banco</option>
              {BANKS.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </Box>
            {errors.bankName && (
              <Box marginTop="1">
                <Text fontSize="caption" color="danger-textHigh">
                  {errors.bankName}
                </Text>
              </Box>
            )}
          </Box>

          {/* Account Type */}
          <Box>
            <Box marginBottom="2">
              <Text fontWeight="bold">
                Tipo de cuenta
              </Text>
            </Box>
            <Box display="flex" gap="3">
              {[
                { value: "corrente", label: "Cuenta Corriente" },
                { value: "poupanca", label: "Cuenta de Ahorro" }
              ].map(option => (
                <Box
                  key={option.value}
                  as="button"
                  flex="1"
                  padding="3"
                  borderRadius="2"
                  style={{
                    backgroundColor: formData.accountType === option.value ? "#e8f0fe" : "#fff",
                    border: formData.accountType === option.value ? "2px solid #0059d5" : "1px solid #e5e7eb",
                    cursor: "pointer"
                  }}
                  onClick={() => handleInputChange("accountType", option.value)}
                >
                  <Text fontSize="caption">{option.label}</Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* CLABE */}
          <Box>
            <Box marginBottom="2">
              <Text fontWeight="bold">
                CLABE interbancaria *
              </Text>
            </Box>
            <Input
              value={formData.clabe}
              onChange={(e) => handleInputChange("clabe", e.target.value)}
              placeholder="012345678901234567"
              maxLength={18}
              style={{ borderColor: errors.clabe ? '#dc2626' : undefined }}
            />
            {errors.clabe && (
              <Box marginTop="1">
                <Text fontSize="caption" color="danger-textHigh">
                  {errors.clabe}
                </Text>
              </Box>
            )}
            <Box marginTop="1">
              <Text fontSize="caption" color="neutral-textLow">
                18 dígitos de tu CLABE interbancaria
              </Text>
            </Box>
          </Box>
        </Box>

        <NavigationButtons
          onNext={handleNext}
          onBack={handleBack}
        />
      </Box>
    </Box>
  );
}
