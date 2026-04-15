import { Settings, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 36 20" fill="none" className="h-6 w-9">
            <circle cx="10" cy="10" r="8" fill="var(--primary)" />
            <circle cx="26" cy="10" r="8" fill="var(--primary)" />
            <path
              d="M 18 4 A 8 8 0 0 0 18 16"
              fill="var(--primary)"
              stroke="white"
              strokeWidth="2.5"
            />
          </svg>
          <span className="text-xl font-bold text-primary">Pagonube</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Exportar listado
          </Button>
        </div>
      </div>
    </header>
  )
}
