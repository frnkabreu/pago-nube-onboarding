import type { PaymentStatus, Transaction } from "@/lib/sales-context"

/** Contrato mínimo para o assistente rule-based e para aplicar tools no cliente. */
export interface FinanceAssistantDeps {
  salesDatabase: Transaction[]
  updateTransactionStatus: (id: number, newStatus: PaymentStatus) => void
  bulkUpdateStatus: (ids: number[], newStatus: PaymentStatus) => number
  getProblematicTransactions: () => Transaction[]
  getNonApprovedTransactions: () => Transaction[]
  getApprovedTotal: () => number
  getProblematicTotal: () => number
  getTransactionById: (id: number) => Transaction | undefined
  findTransactionByClient: (name: string) => Transaction[]
}
