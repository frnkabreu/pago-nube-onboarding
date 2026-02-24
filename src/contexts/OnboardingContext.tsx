import { createContext, useContext, useState, type ReactNode } from 'react';

// Payment Method Type
export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  commission: string;
  settlementDays: string;
  category: string;
  description?: string;
}

// Onboarding Data Type
export interface OnboardingData {
  // Step 1: Payment Methods
  selectedMethods: string[];
  
  // Step 2: Personal Info
  businessType?: 'MEI' | 'PF' | 'PJ';
  rfc?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  
  // Step 3: Business Info
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  
  // Step 4: Bank Account
  bankName?: string;
  accountType?: 'corrente' | 'poupanca';
  accountNumber?: string;
  clabe?: string;
  
  // Progress
  currentStep: number;
  completedSteps: number[];
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialData: OnboardingData = {
  selectedMethods: [],
  currentStep: 1,
  completedSteps: []
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const goToStep = (step: number) => {
    setData(prev => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    setData(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };

  const previousStep = () => {
    setData(prev => ({ 
      ...prev, 
      currentStep: Math.max(1, prev.currentStep - 1) 
    }));
  };

  const completeStep = (step: number) => {
    setData(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])]
    }));
  };

  const isStepCompleted = (step: number) => {
    return data.completedSteps.includes(step);
  };

  const resetOnboarding = () => {
    setData(initialData);
  };

  const value: OnboardingContextType = {
    data,
    updateData,
    goToStep,
    nextStep,
    previousStep,
    completeStep,
    isStepCompleted,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
