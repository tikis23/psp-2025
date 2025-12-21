import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createCashPayment, createGiftCardPayment } from "@/services/paymentService"
import type { Order } from "@/services/orderService"

export interface PaymentOverlayProps {
    order: Order
    onPaid?: (data?: { changeDue?: number }) => void
}

type PaymentMethod = "CASH" | "CARD" | "GIFT_CARD"

const PaymentOverlay: React.FC<PaymentOverlayProps> = ({ order, onPaid }) => {
    const [method, setMethod] = useState<PaymentMethod>("CASH")

    const [amount, setAmount] = useState("")
    const [tip, setTip] = useState("")
    const [giftCardCode, setGiftCardCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateAmount = () => {
        const numericAmount = Number(amount)
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            toast.error("Amount must be a positive number")
            return null
        }
        return numericAmount
    }

    const numericTip = useMemo(() => Number(tip) || 0, [tip])

    const resetIrrelevantFields = (next: PaymentMethod) => {
        if (next !== "GIFT_CARD") setGiftCardCode("")
        if (next === "CASH") setTip("")
    }

    const selectMethod = (next: PaymentMethod) => {
        setMethod(next)
        resetIrrelevantFields(next)

        if (next === "CARD") {
            toast.info("Card payment flow (not implemented yet)")
        }
    }

    const handleCash = async () => {
        const numericAmount = validateAmount()
        if (numericAmount === null) return

        try {
            setIsSubmitting(true)

            const res = await createCashPayment(order.id.toString(), numericAmount, numericTip)

            onPaid?.({
                changeDue: Number(res.changeDue ?? 0),
            })

            toast.success("Cash payment recorded", {
                description: `Paid ${Number(res.amount ?? 0).toFixed(2)}. Cash received: ${Number(
                    res.cashReceived ?? numericAmount
                ).toFixed(2)}. Change: ${Number(res.changeDue ?? 0).toFixed(2)}`,
            })

            setAmount("")
            setTip("")
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
        if (!giftCardCode.trim()) {
            toast.error("Gift card code is required")
            return
        }

        try {
            setIsSubmitting(true)
            const res = await createGiftCardPayment(order.id.toString(), giftCardCode.trim(), numericTip)

            onPaid?.({ changeDue: 0 })

            toast.success("Gift card payment recorded", {
                description: `Charged ${Number(res.amount ?? 0).toFixed(2)} from card ${res.giftCardCode
                    }. Card remaining: ${Number(res.remainingCardBalance ?? 0).toFixed(2)}`,
            })

            setAmount("")
            setTip("")
            setGiftCardCode("")
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to charge gift card", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const primaryAction = () => {
        if (method === "CASH") return handleCash()
        if (method === "GIFT_CARD") return handleGiftCard()
        toast.info("Card payment flow (not implemented yet)")
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

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Button
                            variant={method === "CASH" ? "default" : "outline"}
                            className="h-20 flex flex-col justify-center"
                            onClick={() => selectMethod("CASH")}
                            disabled={isSubmitting}
                        >
                            <span className="font-semibold text-white">Pay by cash</span>
                            <span className="text-xs text-gray-500">Take cash &amp; give change</span>
                        </Button>

                        <Button
                            variant={method === "CARD" ? "default" : "outline"}
                            className="h-20 flex flex-col justify-center"
                            onClick={() => selectMethod("CARD")}
                            disabled={isSubmitting}
                        >
                            <span className="font-semibold text-white">Pay by card</span>
                            <span className="text-xs text-gray-500">Terminal / online card</span>
                        </Button>

                        <Button
                            variant={method === "GIFT_CARD" ? "default" : "outline"}
                            className="h-20 flex flex-col justify-center"
                            onClick={() => selectMethod("GIFT_CARD")}
                            disabled={isSubmitting}
                        >
                            <span className="font-semibold text-white">Pay by gift card</span>
                            <span className="text-xs text-gray-500">Redeem gift card balance</span>
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {method === "CASH" && (
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium">Cash received</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 25.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}

                        {method === "GIFT_CARD" && (
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium">Gift card code</label>
                                <Input
                                    placeholder="e.g. GC-ABCD1234"
                                    value={giftCardCode}
                                    onChange={(e) => setGiftCardCode(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}

                        {method !== "CARD" && (
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium">Tip</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 5.00"
                                    value={tip}
                                    onChange={(e) => setTip(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end text-white">
                        <Button onClick={primaryAction} disabled={isSubmitting || method === "CARD"}>
                            {method === "CASH" && "Take Cash payment"}
                            {method === "GIFT_CARD" && "Take Gift Card payment"}
                            {method === "CARD" && "Take Card payment"}
                        </Button>
                    </div>

                    {method === "CARD" && (
                        <p className="text-xs text-gray-500 text-center">
                            Card payments aren’t wired up yet. Pick cash or gift card for now.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default PaymentOverlay
