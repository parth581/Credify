"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RazorpayPayment } from "@/components/razorpay-payment"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"

export function ActiveLoanCard() {
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
  
  // Calculate remaining amount and payments
  const paidMonths = 3 // Assuming 3 months paid
  const paidAmount = paidMonths * monthlyEMI
  const remainingAmount = totalAmount - paidAmount
  const remainingMonths = loanDetails.duration - paidMonths
  
  // Calculate loan start date (assuming loan started 3 months ago)
  const loanStartDate = new Date('2025-07-15') // 3 months before first payment
  const loanStartDateString = loanStartDate.toISOString().split('T')[0]
  
  // Calculate next EMI date (assuming last payment was 2025-09-15)
  const lastPaymentDate = new Date('2025-09-15')
  const nextEMIDate = new Date(lastPaymentDate)
  nextEMIDate.setMonth(nextEMIDate.getMonth() + 1) // Add 1 month
  const nextEMIDateString = nextEMIDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
  
  const paid = Math.round((paidAmount / totalAmount) * 100)
  const remaining = 100 - paid

  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful with ID:", paymentId)
    alert(`Payment successful! Payment ID: ${paymentId}`)
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error)
    alert(`Payment failed: ${error}`)
  }

  // Updated chart data
  const loanProgressData = [
    { name: "Paid", value: paid, color: "#00F5D4" },
    { name: "Remaining", value: remaining, color: "#94A3B8" },
  ]

  const paymentTimelineData = [
    { month: "Jun", Paid: monthlyEMI, Expected: monthlyEMI },
    { month: "Jul", Paid: monthlyEMI, Expected: monthlyEMI },
    { month: "Aug", Paid: monthlyEMI, Expected: monthlyEMI },
    { month: "Sep", Paid: 0, Expected: monthlyEMI },
    { month: "Oct", Paid: 0, Expected: monthlyEMI },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Repayment Progress</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart (Paid vs Remaining) */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Loan Status Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={loanProgressData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={50}
                label={(props: { name?: string; percent?: unknown }) => {
                  const name = props.name ?? ""
                  const percentValue = typeof props.percent === "number" ? props.percent : 0
                  return `${name}: ${(percentValue * 100).toFixed(0)}%`
                }}
              >
                {loanProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Info + Payment Button */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Loan Amount</div>
              <div className="font-medium">₹{loanDetails.principal.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Interest Rate</div>
              <div className="font-medium">{loanDetails.rate}% p.a.</div>
            </div>
            <div>
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium">{loanDetails.duration} months</div>
            </div>
            <div>
              <div className="text-muted-foreground">Purpose</div>
              <div className="font-medium">{loanDetails.purpose}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Amount</div>
              <div className="font-medium">₹{totalAmount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Amount Remaining</div>
              <div className="font-medium">₹{remainingAmount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">EMI Amount</div>
              <div className="font-medium">₹{monthlyEMI.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Loan Start Date</div>
              <div className="font-medium">{loanStartDateString}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Next EMI Due</div>
              <div className="font-medium">{nextEMIDateString}</div>
            </div>
          </div>
          <RazorpayPayment
            amount={monthlyEMI}
            currency="INR"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Pay Next EMI
          </RazorpayPayment>
        </div>
      </CardContent>

      {/* Bar Chart for Payment Timeline */}
      <CardContent className="mt-6">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Payment Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paymentTimelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Expected" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Paid" fill="#00F5D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
