"use client"

import { useSearchParams } from "next/navigation"
import { BorrowerSidebar } from "@/components/borrower/sidebar"
import { ActiveLoanCard } from "@/components/borrower/active-loan-card"
import { NewLoanDialog } from "@/components/borrower/new-loan-dialog"
import { RazorpayPayment } from "@/components/razorpay-payment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Overview() {
  // Loan details from lender marketplace (assuming borrower took BRW-1024)
  const loanDetails = {
    id: "BRW-1024",
    principal: 300000, // ₹3,00,000
    rate: 12, // 12% per annum
    duration: 12, // 12 months
    purpose: "Bike for delivery"
  }

  // Calculate Simple Interest: SI = (P × R × T) / 100
  const simpleInterest = (loanDetails.principal * loanDetails.rate * loanDetails.duration) / (100 * 12) // Monthly rate
  const totalAmount = loanDetails.principal + simpleInterest
  const monthlyEMI = Math.round(totalAmount / loanDetails.duration)

  // Calculate loan start date (assuming loan started 3 months ago)
  const loanStartDate = new Date('2025-07-15') // 3 months before first payment
  const loanStartDateString = loanStartDate.toISOString().split('T')[0]

  // Calculate next EMI date (assuming last payment was 2025-09-15)
  const lastPaymentDate = new Date('2025-09-15')
  const nextEMIDate = new Date(lastPaymentDate)
  nextEMIDate.setMonth(nextEMIDate.getMonth() + 1) // Add 1 month
  const nextEMIDateString = nextEMIDate.toISOString().split('T')[0] // Format as YYYY-MM-DD

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="text-lg font-semibold">Hello, Parth!</div>
        <NewLoanDialog />
      </header>
      <ActiveLoanCard />
      <section>
        <div className="mb-2 text-sm font-medium">Payment History</div>
        <Card className="transition-all hover:shadow-md hover:ring-1 hover:ring-primary/25">
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
                  { date: "2025-09-15", amount: `₹${monthlyEMI.toLocaleString()}`, status: "Successful" },
                  { date: "2025-08-15", amount: `₹${monthlyEMI.toLocaleString()}`, status: "Successful" },
                  { date: "2025-07-15", amount: `₹${monthlyEMI.toLocaleString()}`, status: "Successful" },
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
  // Loan details from lender marketplace (assuming borrower took BRW-1024)
  const loanDetails = {
    id: "BRW-1024",
    principal: 300000, // ₹3,00,000
    rate: 12, // 12% per annum
    duration: 12, // 12 months
    purpose: "Bike for delivery"
  }

  // Calculate Simple Interest: SI = (P × R × T) / 100
  const simpleInterest = (loanDetails.principal * loanDetails.rate * loanDetails.duration) / (100 * 12) // Monthly rate
  const totalAmount = loanDetails.principal + simpleInterest
  const monthlyEMI = Math.round(totalAmount / loanDetails.duration)

  // Calculate loan start date (assuming loan started 3 months ago)
  const loanStartDate = new Date('2025-07-15') // 3 months before first payment
  const loanStartDateString = loanStartDate.toISOString().split('T')[0]

  // Calculate next EMI date (assuming last payment was 2025-09-15)
  const lastPaymentDate = new Date('2025-09-15')
  const nextEMIDate = new Date(lastPaymentDate)
  nextEMIDate.setMonth(nextEMIDate.getMonth() + 1) // Add 1 month
  const nextEMIDateString = nextEMIDate.toISOString().split('T')[0] // Format as YYYY-MM-DD

  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful with ID:", paymentId)
    // You can add success notification or redirect logic here
    alert(`Payment successful! Payment ID: ${paymentId}`)
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error)
    // You can add error notification logic here
    alert(`Payment failed: ${error}`)
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Loan Start Date: {loanStartDateString}</div>
          <div className="text-sm text-muted-foreground">Next EMI: {nextEMIDateString}</div>
          <div className="text-sm text-muted-foreground">Amount: ₹{monthlyEMI.toLocaleString()}</div>
          <RazorpayPayment
            amount={monthlyEMI}
            currency="INR"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            className="bg-primary text-primary-foreground"
          />
        </CardContent>
      </Card>
      <Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Full Name" />
          <Input placeholder="Email" type="email" />
          <Button className="bg-primary text-primary-foreground">Save</Button>
        </CardContent>
      </Card>
      <Card>
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
  const sp = useSearchParams()
  const tab = sp.get("tab")
  const active = tab === "payments" ? "Payments" : tab === "settings" ? "Settings" : "Overview"

  return (
    <div className="theme-borrower">
      <div className="flex min-h-screen">
        <BorrowerSidebar active={active} />
        <main className="mx-auto flex-1 space-y-6 p-6">
          <div>
            <BackButton />
          </div>
          {active === "Overview" && <Overview />}
          {active === "Payments" && <Payments />}
          {active === "Settings" && <Settings />}
        </main>
      </div>
    </div>
  )
}
