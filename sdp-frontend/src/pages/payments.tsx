import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createCashPayment } from "@/services/paymentService"

const PaymentsPage = () => {
    const [orderId, setOrderId] = useState("")
    const [amount, setAmount] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCash = async () => {
        if (!orderId.trim()) {
        toast.error("Order ID is required")
        return
        }

        const numericAmount = Number(amount)
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
        toast.error("Amount must be a positive number")
        return
        }

        try {
        setIsSubmitting(true)
        const res = await createCashPayment(orderId.trim(), numericAmount)

        toast.success("Cash payment recorded", {
            description: `Paid ${res.amount.toFixed(2)}. Remaining balance: ${res.remainingBalance.toFixed(2)}`,
        })

        setAmount("")
        } catch (err: any) {
        console.error(err)
        toast.error("Failed to create cash payment", {
            description: err?.data || err?.message || "Unknown error",
        })
        } finally {
        setIsSubmitting(false)
        }
    }

    const handleCard = () => {
        toast.info("Card payment flow (not implemented yet)")
    }

    const handleGiftCard = () => {
        toast.info("Gift card payment flow (not implemented yet)")
    }

    return (
        <div className="w-full flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader>
            <CardTitle className="text-2xl text-center">Take a Payment</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
            <p className="text-center text-sm text-gray-600">
                Choose how the customer wants to pay for the current order.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                <label className="text-sm font-medium">Order ID</label>
                <Input
                    placeholder="e.g. ord_123"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                />
                </div>
                <div className="space-y-1">
                <label className="text-sm font-medium">Amount</label>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 25.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Button
                variant="outline"
                className="h-20 flex flex-col justify-center"
                onClick={handleCash}
                disabled={isSubmitting}
                >
                <span className="font-semibold">Pay by cash</span>
                <span className="text-xs text-gray-500">
                    Take cash &amp; give change
                </span>
                </Button>

                <Button
                variant="outline"
                className="h-20 flex flex-col justify-center"
                onClick={handleCard}
                >
                <span className="font-semibold">Pay by card</span>
                <span className="text-xs text-gray-500">
                    Terminal / online card
                </span>
                </Button>

                <Button
                variant="outline"
                className="h-20 flex flex-col justify-center"
                onClick={handleGiftCard}
                >
                <span className="font-semibold">Pay by gift card</span>
                <span className="text-xs text-gray-500">
                    Redeem gift card balance
                </span>
                </Button>
            </div>
            </CardContent>
        </Card>
        </div>
    )
}

export default PaymentsPage
