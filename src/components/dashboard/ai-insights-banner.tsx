import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSales } from "@/lib/sales-context"

export function AIInsightsBanner() {
  const {
    getProblematicTransactions,
    getProblematicTotal,
    bannerDismissed,
    setBannerDismissed,
    setOpenChatWithRecovery,
  } = useSales()

  const problematicTransactions = getProblematicTransactions()
  const problematicTotal = getProblematicTotal()

  if (bannerDismissed || problematicTransactions.length === 0) {
    return null
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl bg-accent px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card">
          <img src="/logos/pagonube-icon.png" alt="Pago Nube" className="h-8 w-8 object-contain" />
        </div>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              AI Insights Financieros
            </span>
          </div>
          <p className="text-sm text-foreground/80">
            Detecté{" "}
            <span className="font-semibold text-destructive">
              ${problematicTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>{" "}
            en pagos con problemas.{" "}
            <span className="font-medium text-primary">{problematicTransactions.length}</span> transacciones requieren
            atención.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setOpenChatWithRecovery(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Iniciar Recuperación
        </Button>
        <button
          onClick={() => setBannerDismissed(true)}
          className="rounded-full p-1 text-muted-foreground hover:bg-card/50"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
