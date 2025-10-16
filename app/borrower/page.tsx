"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { BorrowerSidebar } from "@/components/borrower/sidebar"
import { ActiveLoanCard } from "@/components/borrower/active-loan-card"
import { NewLoanDialog } from "@/components/borrower/new-loan-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DonutChart from "@/components/charts/DonutChart"
import BarChartComp from "@/components/charts/BarChart"
import StackedBarChart from "@/components/charts/StackedBarChart"
import GaugeChart from "@/components/charts/GaugeChart"

function Overview() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="text-lg font-semibold">Hello, Alex!</div>
        <NewLoanDialog />
      </header>
      <ActiveLoanCard />
      {/* Charts Section */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-[var(--color-card-background)]">
          <CardHeader>
            <CardTitle>Loan Repayment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={{
                labels: ["Paid", "Remaining"],
                datasets: [
                  {
                    data: [65, 35],
                    backgroundColor: ["var(--color-accent-yellow)", "var(--color-background-light)"],
                  },
                ],
              }}
            />
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-card-background)]">
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart value={78} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[var(--color-card-background)]">
          <CardHeader>
            <CardTitle>EMI Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComp
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    label: "Status",
                    data: [1, 1, 0.5, 1, 0.25, 0],
                    backgroundColor: [
                      "var(--color-secondary-aqua)",
                      "var(--color-secondary-aqua)",
                      "var(--color-accent-yellow)",
                      "var(--color-secondary-aqua)",
                      "var(--color-accent-yellow)",
                      "var(--destructive)",
                    ],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    suggestedMin: 0,
                    suggestedMax: 1,
                    ticks: {
                      stepSize: 0.25,
                      callback: (v: number) => (v === 1 ? "On time" : v === 0 ? "Overdue" : ""),
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[var(--color-card-background)]">
          <CardHeader>
            <CardTitle>Interest vs. Principal (per EMI)</CardTitle>
          </CardHeader>
          <CardContent>
            <StackedBarChart
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  { label: "Principal", data: [200, 220, 240, 260, 280, 300], backgroundColor: "var(--color-secondary-aqua)" },
                  { label: "Interest", data: [100, 95, 90, 85, 80, 75], backgroundColor: "var(--color-accent-yellow)" },
                ],
              }}
              options={{ plugins: { legend: { display: true } } }}
            />
          </CardContent>
        </Card>
      </section>
      <section>
        <div className="mb-2 text-sm font-medium">Payment History</div>
        <Card className="bg-[var(--color-card-background)] transition-all hover:shadow-md hover:ring-1 hover:ring-primary/25">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "2025-09-15", amount: "$220", status: "Successful" },
                  { date: "2025-08-15", amount: "$220", status: "Successful" },
                  { date: "2025-07-15", amount: "$220", status: "Successful" },
                ].map((row) => (
                  <tr key={row.date} className="border-t border-border/70">
                    <td className="px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">{row.amount}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function Payments() {
  return (
    <section className="space-y-4">
      <Card className="bg-[var(--color-card-background)]">
        <CardHeader>
          <CardTitle>Upcoming Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Next EMI: 2025-10-15</div>
          <Button className="bg-primary text-primary-foreground">Pay Now</Button>
        </CardContent>
      </Card>
      <Card className="bg-[var(--color-card-background)]">
        <CardHeader>
          <CardTitle>Saved Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Add new card (mock)" />
          <Button variant="outline">Add</Button>
        </CardContent>
      </Card>
    </section>
  )
}

function Settings() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="bg-[var(--color-card-background)]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Full Name" />
          <Input placeholder="Email" type="email" />
          <Button className="bg-primary text-primary-foreground">Save</Button>
        </CardContent>
      </Card>
      <Card className="bg-[var(--color-card-background)]">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Receive EMI reminders and receipts.</div>
          <Button variant="outline">Update Preferences</Button>
        </CardContent>
      </Card>
    </section>
  )
}

export default function BorrowerDashboard() {
  const router = useRouter()
  const sp = useSearchParams()
  const tab = sp.get("tab")
  const active = tab === "payments" ? "Payments" : tab === "settings" ? "Settings" : "Overview"

  return (
    <div className="theme-borrower">
      <div className="flex min-h-screen">
        <BorrowerSidebar active={active} />
        <main className="mx-auto flex-1 space-y-6 p-6 bg-[var(--color-background-light)]">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => router.push("/")}>Sign Out</Button>
          </div>
          {active === "Overview" && <Overview />}
          {active === "Payments" && <Payments />}
          {active === "Settings" && <Settings />}
        </main>
      </div>
    </div>
  )
}
