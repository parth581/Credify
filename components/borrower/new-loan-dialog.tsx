"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function NewLoanDialog() {
  const [loanType, setLoanType] = useState<"personal" | "business" | "">("")
  const [businessSector, setBusinessSector] = useState<string>("")
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">+ Apply for a New Loan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Loan Amount</Label>
            <Input id="amount" type="number" placeholder="e.g., 5000" />
          </div>
          <div className="grid gap-2">
            <Label>Loan Type</Label>
            <Select onValueChange={(v) => setLoanType(v as "personal" | "business")}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loanType === "business" && (
            <div className="grid gap-2">
              <Label>Business Sector</Label>
              <Select onValueChange={(v) => setBusinessSector(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="tailor">Tailor</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="retail-shop">Small Retail Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Duration</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Max Affordable Interest Rate</Label>
            <Input id="rate" type="number" placeholder="e.g., 12%" />
          </div>
        </form>
        <DialogFooter>
          <Button className="bg-primary text-primary-foreground hover:opacity-90">Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
