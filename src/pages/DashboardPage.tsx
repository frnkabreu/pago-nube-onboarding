import { useEffect } from "react"
import "@/dashboard.css"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardApp } from "@/components/dashboard/dashboard-app"
import { AIInsightsBanner } from "@/components/dashboard/ai-insights-banner"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { AIAgentSidebar } from "@/components/dashboard/ai-agent-sidebar"

export default function DashboardPage() {
  useEffect(() => {
    const container = document.querySelector(".settings-page-container")
    if (container) {
      container.scrollTop = 0
    } else {
      window.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [])

  return (
    <DashboardShell overlay={<AIAgentSidebar />}>
      <DashboardApp>
        <main className="db-main mx-auto max-w-[1200px] px-4 py-4 sm:px-6 sm:py-6">
          <AIInsightsBanner />
          <StatsCards />
          <CashFlowChart />
          <PaymentsTable limit={10} />
        </main>
      </DashboardApp>
    </DashboardShell>
  )
}
