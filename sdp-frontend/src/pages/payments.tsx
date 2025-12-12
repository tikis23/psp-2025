import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    createCashPayment,
    createGiftCardPayment,
    createGiftCard,
} from "@/services/paymentService"

const PaymentsPage = () => {
    const [orderId, setOrderId] = useState("")
    const [amount, setAmount] = useState("")
    const [giftCardCode, setGiftCardCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateOrderAndAmount = () => {
        if (!orderId.trim()) {
            toast.error("Order ID is required")
            return false
        }

        const numericAmount = Number(amount)
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            toast.error("Amount must be a positive number")
            return false
        }

        return true
    }

    const handleCash = async () => {
        if (!validateOrderAndAmount()) return

        const numericAmount = Number(amount)

        try {
            setIsSubmitting(true)
            const res = await createCashPayment(orderId.trim(), numericAmount)

            toast.success("Cash payment recorded", {
                description: `Paid ${res.amount.toFixed(
                    2
                )}. Remaining balance: ${res.remainingBalance.toFixed(2)}`,
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

    const handleGiftCard = async () => {
        if (!validateOrderAndAmount()) return

        if (!giftCardCode.trim()) {
            toast.error("Gift card code is required")
            return
        }

        const numericAmount = Number(amount)

        try {
            setIsSubmitting(true)
            const res = await createGiftCardPayment(
                orderId.trim(),
                numericAmount,
                giftCardCode.trim()
            )

            toast.success("Gift card payment recorded", {
                description: `Charged ${res.amount.toFixed(
                    2
                )} from card ${res.giftCardCode}. Card remaining: ${res.remainingCardBalance.toFixed(
                    2
                )}`,
            })

            setAmount("")
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to charge gift card", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCard = () => {
        toast.info("Card payment flow (not implemented yet)")
    }

    const handleGenerateGiftCardCode = async () => {
        const numericAmount = Number(amount)
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            toast.error("Amount must be a positive number to create a gift card")
            return
        }

        try {
            setIsSubmitting(true)
            const res = await createGiftCard(numericAmount)

            setGiftCardCode(res.code)

            toast.success("Gift card created", {
                description: `Code: ${res.code} | Balance: ${res.balance.toFixed(2)}`,
            })
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to create gift card", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsSubmitting(false)
        }
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
                                placeholder="e.g. 1"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Amount (for payment / gift card)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 25.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Gift card code</label>
                        <div className="flex gap-2">
                            <Input
                                className="flex-1"
                                placeholder="e.g. GC-ABCD1234"
                                value={giftCardCode}
                                onChange={(e) => setGiftCardCode(e.target.value)}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGenerateGiftCardCode}
                                disabled={isSubmitting}
                            >
                                Generate
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Enter an existing code or click Generate to create a new card
                            with the amount above
                        </p>
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
                            disabled={isSubmitting}
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
