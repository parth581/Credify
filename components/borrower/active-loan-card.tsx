"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonutChart } from "@/components/charts/donut"
import { RazorpayPayment } from "@/components/razorpay-payment"

export function ActiveLoanCard() {
  const paid = 45
  const remaining = 100 - paid

  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful with ID:", paymentId)
    alert(`Payment successful! Payment ID: ${paymentId}`)
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error)
    alert(`Payment failed: ${error}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Repayment Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <DonutChart
              data={[
                { name: "Paid", value: paid, color: "#00F5D4" },
                { name: "Remaining", value: remaining, color: "#94A3B8" },
              ]}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-semibold">{paid}%</div>
                <div className="text-xs text-muted-foreground">Paid</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Amount Remaining</div>
              <div className="font-medium">$6,600</div>
            </div>
            <div>
              <div className="text-muted-foreground">Next EMI Due</div>
              <div className="font-medium">2025-10-15</div>
            </div>
            <div>
              <div className="text-muted-foreground">EMI Amount</div>
              <div className="font-medium">$220</div>
            </div>
          </div>
          <RazorpayPayment
            amount={220}
            currency="INR"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Pay Next EMI
          </RazorpayPayment>
        </div>
      </CardContent>
    </Card>
  )
}
