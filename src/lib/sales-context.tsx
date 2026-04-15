"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type PaymentStatus = "Aprobado" | "Vencido" | "Rechazado" | "Devolución total" | "Devolución parcial"

export type PaymentMethod = "Tarjeta de crédito" | "Tarjeta de débito" | "Transferencia" | "Efectivo" | "PayPal" | "OXXO"

export type Transaction = {
  id: string
  numericId: number
  date: string
  client: string
  method: PaymentMethod
  status: PaymentStatus
  value: number
}

// Mexican names for realistic data
const mexicanNames = [
  "María García", "José Hernández", "Ana Martínez", "Carlos López", "Laura Rodríguez",
  "Miguel González", "Patricia Pérez", "Fernando Sánchez", "Gabriela Ramírez", "Ricardo Torres",
  "Adriana Flores", "Diego Cruz", "Sofía Morales", "Alejandro Reyes", "Valeria Jiménez",
  "Luis Díaz", "Daniela Vargas", "Juan Mendoza", "Camila Castro", "Roberto Ortiz",
  "Mariana Ruiz", "Eduardo Romero", "Fernanda Herrera", "Andrés Medina", "Lucía Aguilar",
  "Pablo Gutiérrez", "Regina Vega", "Sebastián Navarro", "Ximena Ramos", "Mateo Molina",
  "Isabella Domínguez", "Santiago Suárez", "Valentina Rojas", "Emiliano Guerrero", "Renata Cervantes",
  "Leonardo Campos", "Natalia Delgado", "Nicolás Sandoval", "Paula Contreras", "Daniel Espinoza"
]

const paymentMethods: PaymentMethod[] = [
  "Tarjeta de crédito", "Tarjeta de débito", "Transferencia", "Efectivo", "PayPal", "OXXO"
]

const statuses: PaymentStatus[] = [
  "Aprobado", "Vencido", "Rechazado", "Devolución total", "Devolución parcial"
]

// Weighted status distribution (more approved than problematic)
const statusWeights = [50, 15, 15, 10, 10] // Aprobado: 50%, Vencido: 15%, Rechazado: 15%, Dev total: 10%, Dev parcial: 10%

function getWeightedRandomStatus(): PaymentStatus {
  const random = Math.random() * 100
  let cumulative = 0
  for (let i = 0; i < statuses.length; i++) {
    cumulative += statusWeights[i]
    if (random < cumulative) {
      return statuses[i]
    }
  }
  return "Aprobado"
}

function generateRandomSales(count: number): Transaction[] {
  const sales: Transaction[] = []
  const months = ["ene", "feb", "mar", "dic", "nov", "oct"]
  
  for (let i = 0; i < count; i++) {
    const numericId = 100 + i
    const dayNum = Math.floor(Math.random() * 28) + 1
    const monthIdx = Math.floor(Math.random() * months.length)
    const date = `${dayNum} ${months[monthIdx]}`
    
    const clientIdx = Math.floor(Math.random() * mexicanNames.length)
    const methodIdx = Math.floor(Math.random() * paymentMethods.length)
    
    // Generate realistic values between 150 and 15000 MXN
    const value = Math.round((Math.random() * 14850 + 150) * 100) / 100
    
    sales.push({
      id: `Venta #${numericId}`,
      numericId,
      date,
      client: mexicanNames[clientIdx],
      method: paymentMethods[methodIdx],
      status: getWeightedRandomStatus(),
      value,
    })
  }
  
  return sales
}

// Generate 100 random sales on module load
const initialSalesDatabase: Transaction[] = generateRandomSales(100)

type SalesContextType = {
  salesDatabase: Transaction[]
  updateTransactionStatus: (id: number, newStatus: PaymentStatus) => void
  bulkUpdateStatus: (ids: number[], newStatus: PaymentStatus) => number
  getProblematicTransactions: () => Transaction[]
  getNonApprovedTransactions: () => Transaction[]
  getApprovedTotal: () => number
  getProblematicTotal: () => number
  getTransactionById: (id: number) => Transaction | undefined
  findTransactionByClient: (name: string) => Transaction[]
  recentlyChangedIds: number[]
  bannerDismissed: boolean
  setBannerDismissed: (value: boolean) => void
  openChatWithRecovery: boolean
  setOpenChatWithRecovery: (value: boolean) => void
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

export function SalesProvider({ children }: { children: ReactNode }) {
  const [salesDatabase, setSalesDatabase] = useState<Transaction[]>(initialSalesDatabase)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [openChatWithRecovery, setOpenChatWithRecovery] = useState(false)
  const [recentlyChangedIds, setRecentlyChangedIds] = useState<number[]>([])

  const markChanged = useCallback((ids: number[]) => {
    setRecentlyChangedIds(ids)
    setTimeout(() => setRecentlyChangedIds([]), 2500)
  }, [])

  const updateTransactionStatus = useCallback((numericId: number, newStatus: PaymentStatus) => {
    setSalesDatabase((prev) => prev.map((t) => (t.numericId === numericId ? { ...t, status: newStatus } : t)))
    markChanged([numericId])
    setBannerDismissed(false)
  }, [markChanged])

  const bulkUpdateStatus = useCallback((ids: number[], newStatus: PaymentStatus) => {
    setSalesDatabase((prev) => prev.map((t) => (ids.includes(t.numericId) ? { ...t, status: newStatus } : t)))
    markChanged(ids)
    setBannerDismissed(false)
    return ids.length
  }, [markChanged])

  const getProblematicTransactions = useCallback(() => {
    return salesDatabase.filter((t) => t.status === "Vencido" || t.status === "Rechazado")
  }, [salesDatabase])

  const getApprovedTotal = useCallback(() => {
    return salesDatabase.filter((t) => t.status === "Aprobado").reduce((sum, t) => sum + t.value, 0)
  }, [salesDatabase])

  const getProblematicTotal = useCallback(() => {
    return getProblematicTransactions().reduce((sum, t) => sum + t.value, 0)
  }, [getProblematicTransactions])

  const getTransactionById = useCallback(
    (id: number) => {
      return salesDatabase.find((t) => t.numericId === id)
    },
    [salesDatabase],
  )

  const getNonApprovedTransactions = useCallback(() => {
    return salesDatabase.filter((t) => t.status !== "Aprobado")
  }, [salesDatabase])

  const findTransactionByClient = useCallback(
    (name: string) => {
      const lower = name.toLowerCase()
      return salesDatabase.filter((t) => t.client.toLowerCase().includes(lower))
    },
    [salesDatabase],
  )

  return (
    <SalesContext.Provider
      value={{
        salesDatabase,
        updateTransactionStatus,
        bulkUpdateStatus,
        getProblematicTransactions,
        getNonApprovedTransactions,
        getApprovedTotal,
        getProblematicTotal,
        getTransactionById,
        findTransactionByClient,
        recentlyChangedIds,
        bannerDismissed,
        setBannerDismissed,
        openChatWithRecovery,
        setOpenChatWithRecovery,
      }}
    >
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const context = useContext(SalesContext)
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider")
  }
  return context
}
