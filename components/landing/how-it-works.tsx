import { Card, CardContent } from "@/components/ui/card"
import { FileText, Users, LineChart } from "lucide-react"

const steps = [
  {
    title: "Create Your Request",
    desc: "Borrowers post their loan needs.",
    Icon: FileText,
  },
  {
    title: "Get Funded by the Community",
    desc: "Lenders fund applications they believe in.",
    Icon: Users,
  },
  {
    title: "Repay & Build Credit",
    desc: "Repay on schedule and build your credit.",
    Icon: LineChart,
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-balance text-center text-2xl font-semibold md:text-3xl">How It Works</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map(({ title, desc, Icon }) => (
          <Card key={title} className="border-border">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Icon className="h-6 w-6 text-foreground" />
              </div>
              <div className="text-lg font-medium">{title}</div>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
