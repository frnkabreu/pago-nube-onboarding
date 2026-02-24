import { useState } from "react";
import { Box } from "@nimbus-ds/box";
import { Text } from "@nimbus-ds/text";
import { Title } from "@nimbus-ds/title";
import { Input } from "@nimbus-ds/input";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../contexts/OnboardingContext";
import { NavigationButtons, ProgressBar } from "../components/OnboardingComponents";

export function PersonalDataPage() {
  const navigate = useNavigate();
  const { data, updateData, completeStep, previousStep } = useOnboarding();
  
  const [formData, setFormData] = useState({
    businessType: data.businessType || "MEI",
    rfc: data.rfc || "",
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rfc) {
      newErrors.rfc = "RFC es obligatorio";
    } else if (formData.rfc.length < 12) {
      newErrors.rfc = "RFC debe tener al menos 12 caracteres";
    }

    if (!formData.fullName) {
      newErrors.fullName = "Nombre completo es obligatorio";
    }

    if (!formData.email) {
      newErrors.email = "Email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone) {
      newErrors.phone = "Teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Teléfono debe tener 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      updateData(formData);
      completeStep(3);
      navigate("/onboarding/cuenta-bancaria");
    }
  };

  const handleBack = () => {
    previousStep();
    navigate("/onboarding/metodos-pago");
  };

  return (
    <Box backgroundColor="neutral-background" minHeight="100vh" padding="6">
      <Box maxWidth="700px" marginX="auto">
        {/* Progress */}
        <ProgressBar current={3} total={6} />
        
        {/* Header */}
        <Box marginTop="4" marginBottom="6">
          <Title as="h1">Datos personales</Title>
          <Box marginTop="2">
            <Text color="neutral-textLow">
              Ingresa tu información personal para verificar tu identidad
            </Text>
          </Box>
        </Box>

        {/* Business Type Selection */}
        <Box marginBottom="6">
          <Box marginBottom="2">
            <Text fontWeight="bold">
              Tipo de persona
            </Text>
          </Box>
          <Box display="flex" gap="3">
            {[
              { value: "MEI", label: "Persona Física con Actividad Empresarial" },
              { value: "PF", label: "Persona Física" },
              { value: "PJ", label: "Persona Moral" }
            ].map(option => (
              <Box
                key={option.value}
                as="button"
                flex="1"
                padding="3"
                borderRadius="2"
                style={{
                  backgroundColor: formData.businessType === option.value ? "#e8f0fe" : "#fff",
                  border: formData.businessType === option.value ? "2px solid #0059d5" : "1px solid #e5e7eb",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => handleInputChange("businessType", option.value)}
              >
                <Text fontSize="caption" textAlign="center">
                  {option.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Form Fields */}
        <Box display="flex" flexDirection="column" gap="4">
          {/* RFC */}
          <Box>
            <Box marginBottom="2">
              <Text fontWeight="bold">
                RFC *
              </Text>
            </Box>
            <Input
              value={formData.rfc}
              onChange={(e) => handleInputChange("rfc", e.target.value)}
              placeholder="XAXX010101000"
              style={{ borderColor: errors.rfc ? '#dc2626' : undefined }}
            />
            {errors.rfc && (
              <Box marginTop="1">
                <Text fontSize="caption" color="danger-textHigh">
                  {errors.rfc}
                </Text>
              </Box>
            )}
          </Box>

          {/* Full Name */}
          <Box>
            <Box marginBottom="2">
              <Text fontWeight="bold">
                Nombre completo *
              </Text>
            </Box>
            <Input
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Juan Pérez García"
              style={{ borderColor: errors.fullName ? '#dc2626' : undefined }}
            />
            {errors.fullName && (
              <Box marginTop="1">
                <Text fontSize="caption" color="danger-textHigh">
                  {errors.fullName}
                </Text>
              </Box>
            )}
          </Box>

          {/* Email */}
          <Box>
            <Box marginBottom="2">
              <Text fontWeight="bold">
                Email *
              </Text>
            </Box>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="tu@email.com"
              style={{ borderColor: errors.email ? '#dc2626' : undefined }}
            />
            {errors.email && (
              <Box marginTop="1">
                <Text fontSize="caption" color="danger-textHigh">
                  {errors.email}
                </Text>
              </Box>
            )}
          </Box>

          {/* Phone */}
          <Box>
            <Box marginBottom="2">
              <Text fontWeight="bold">
                Teléfono *
              </Text>
            </Box>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(55) 1234-5678"
              style={{ borderColor: errors.phone ? '#dc2626' : undefined }}
            />
            {errors.phone && (
              <Box marginTop="1">
                <Text fontSize="caption" color="danger-textHigh">
                  {errors.phone}
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Navigation */}
        <NavigationButtons
          onNext={handleNext}
          onBack={handleBack}
          nextLabel="Continuar"
        />
      </Box>
    </Box>
  );
}
