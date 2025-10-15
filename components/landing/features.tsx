import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, BarChart as Chart, HandCoins, Users, Repeat } from "lucide-react"
import { BarChart2 } from "lucide-react" // Import BarChart2

const features = [
  { title: "Peer-to-Peer Lending", Icon: HandCoins, desc: "Connect borrowers and lenders directly." },
  { title: "Community Funding", Icon: Users, desc: "Pool resources to back promising applications." },
  { title: "Transparent Rates", Icon: BarChart2, desc: "Clear, fair, and visible to everyone." }, // Use BarChart2 here
  { title: "Secure Transactions", Icon: ShieldCheck, desc: "Best practices for safety and trust." },
  { title: "Portfolio Analytics", Icon: Chart, desc: "Track returns and performance at a glance." },
  { title: "Flexible Repayments", Icon: Repeat, desc: "Repayment schedules that suit your needs." },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-balance text-center text-2xl font-semibold md:text-3xl">Features</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map(({ title, desc, Icon }) => (
          <Card key={title}>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-md bg-secondary p-2">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
