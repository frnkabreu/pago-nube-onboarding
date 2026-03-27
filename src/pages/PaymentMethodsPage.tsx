import { useState } from "react";
import { Box } from "@nimbus-ds/box";
import { Text } from "@nimbus-ds/text";
import { Title } from "@nimbus-ds/title";
import { Checkbox } from "@nimbus-ds/checkbox";
import { Tag } from "@nimbus-ds/tag";
import { CreditCardIcon, MoneyIcon } from "@nimbus-ds/icons";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../contexts/OnboardingContext";
import { NavigationButtons, ProgressBar } from "../components/OnboardingComponents";

// Payment methods data from Figma
const PAYMENT_METHODS = [
  {
    id: "credit-debit",
    category: "Tarjetas",
    name: "Crédito o débito",
    icon: <CreditCardIcon />,
    commission: "3.29% + $3 + IVA",
    settlementDays: "2 días",
    description: "Acepta todas las tarjetas principales",
    status: "recommended"
  },
  {
    id: "oxxo",
    category: "Efectivo",
    name: "Efectivo en OXXO",
    icon: <MoneyIcon />,
    commission: "3.49% + $4 + IVA",
    settlementDays: "2 días",
    description: "Tus clientes pagan en efectivo",
    status: "available"
  },
  {
    id: "mercado-pago",
    category: "Wallets",
    name: "Mercado Pago",
    icon: <CreditCardIcon />,
    commission: "4.99%",
    settlementDays: "Variable",
    description: "Wallet digital popular",
    status: "available"
  },
  {
    id: "paypal",
    category: "Wallets",
    name: "PayPal",
    icon: <CreditCardIcon />,
    commission: "5.4% + $3",
    settlementDays: "1-3 días",
    description: "Pagos internacionales",
    status: "available"
  },
  {
    id: "spei",
    category: "Transferencias",
    name: "Transferencia SPEI",
    icon: <MoneyIcon />,
    commission: "2.5%",
    settlementDays: "Inmediato",
    description: "Transferencia bancaria",
    status: "available"
  }
];

export function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { data, updateData, completeStep, previousStep } = useOnboarding();
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    data.selectedMethods || []
  );
  const [filter, setFilter] = useState<"all" | "activated" | "deactivated" | "pending">("all");

  const handleToggleMethod = (methodId: string) => {
    setSelectedMethods(prev => {
      if (prev.includes(methodId)) {
        return prev.filter(id => id !== methodId);
      } else {
        return [...prev, methodId];
      }
    });
  };

  const handleNext = () => {
    updateData({ selectedMethods });
    completeStep(2);
    navigate("/onboarding/datos-personales");
  };

  const handleBack = () => {
    previousStep();
    navigate("/");
  };

  const filteredMethods = PAYMENT_METHODS.filter(method => {
    if (filter === "all") return true;
    if (filter === "activated") return selectedMethods.includes(method.id);
    if (filter === "deactivated") return !selectedMethods.includes(method.id);
    if (filter === "pending") return method.status === "pending";
    return true;
  });

  const isNextDisabled = selectedMethods.length === 0;

  return (
    <Box backgroundColor="neutral-background" minHeight="100vh" padding="6">
      <Box maxWidth="1000px" marginX="auto">
        {/* Progress */}
        <ProgressBar current={2} total={6} />
        
        {/* Header */}
        <Box marginTop="4" marginBottom="6">
          <Title as="h1">Medios de pago</Title>
          <Box marginTop="2">
            <Text color="neutral-textLow">
              Elige al menos un medio de pago para empezar a cobrar
            </Text>
          </Box>
        </Box>

        {/* Filter Tabs */}
        <Box display="flex" gap="2" marginBottom="4">
          <FilterTab
            label="Todos"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterTab
            label="Activados"
            count={selectedMethods.length}
            active={filter === "activated"}
            onClick={() => setFilter("activated")}
          />
          <FilterTab
            label="Desactivados"
            count={PAYMENT_METHODS.length - selectedMethods.length}
            active={filter === "deactivated"}
            onClick={() => setFilter("deactivated")}
          />
        </Box>

        {/* Info Banner */}
        {selectedMethods.length === 0 && (
          <Box
            padding="3"
            borderRadius="2"
            marginBottom="4"
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe"
            }}
          >
            <Text fontSize="caption" style={{ color: "#1e40af" }}>
              💡 Selecciona al menos un método de pago para continuar
            </Text>
          </Box>
        )}

        {/* Payment Methods List */}
        <Box display="flex" flexDirection="column" gap="3">
          {filteredMethods.map(method => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              selected={selectedMethods.includes(method.id)}
              onToggle={() => handleToggleMethod(method.id)}
            />
          ))}
        </Box>

        {/* Navigation */}
        <NavigationButtons
          onNext={handleNext}
          onBack={handleBack}
          nextLabel={`Continuar (${selectedMethods.length} seleccionados)`}
          nextDisabled={isNextDisabled}
        />
      </Box>
    </Box>
  );
}

interface FilterTabProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

function FilterTab({ label, count, active, onClick }: FilterTabProps) {
  return (
    <Box
      as="button"
      paddingX="3"
      paddingY="2"
      borderRadius="1"
      display="flex"
      alignItems="center"
      gap="2"
      style={{
        backgroundColor: active ? "#f3f4f6" : "transparent",
        border: "1px solid transparent",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
      onClick={onClick}
    >
      <Text fontSize="caption" fontWeight={active ? "bold" : "regular"}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <Box
          paddingX="1-5"
          paddingY="0-5"
          borderRadius="full"
          style={{
            backgroundColor: "#e5e7eb",
            minWidth: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text fontSize="caption" fontWeight="bold">
            {count}
          </Text>
        </Box>
      )}
    </Box>
  );
}

interface PaymentMethodCardProps {
  method: typeof PAYMENT_METHODS[0];
  selected: boolean;
  onToggle: () => void;
}

function PaymentMethodCard({ method, selected, onToggle }: PaymentMethodCardProps) {
  return (
    <Box
      padding="4"
      borderRadius="2"
      display="flex"
      alignItems="flex-start"
      gap="3"
      flexWrap="wrap"
      style={{
        backgroundColor: "#fff",
        border: selected ? "2px solid #0059d5" : "1px solid #e5e7eb",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <Box flexShrink="0" style={{ paddingTop: "2px" }}>
        <Checkbox 
          name={method.id}
          checked={selected} 
          onChange={onToggle} 
        />
      </Box>

      {/* Icon */}
      <Box
        width="40px"
        height="40px"
        borderRadius="2"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink="0"
        style={{ backgroundColor: "#f9fafb", color: "#0059d5" }}
      >
        {method.icon}
      </Box>

      {/* Content */}
      <Box flex="1" style={{ minWidth: "160px" }}>
        <Box display="flex" alignItems="center" gap="2" marginBottom="1" flexWrap="wrap">
          <Text fontWeight="bold">{method.name}</Text>
          {method.status === "recommended" && (
            <Tag appearance="success">Recomendado</Tag>
          )}
        </Box>
        <Text fontSize="caption" color="neutral-textLow">
          {method.description}
        </Text>
      </Box>

      {/* Pricing */}
      <Box style={{ minWidth: "80px" }} textAlign="right" flexShrink="0">
        <Text fontSize="caption" color="neutral-textLow">
          Comisión
        </Text>
        <Text fontWeight="bold" color="primary-interactive">
          {method.commission}
        </Text>
        <Text fontSize="caption" color="neutral-textLow">
          Recibe en {method.settlementDays}
        </Text>
      </Box>
    </Box>
  );
}
