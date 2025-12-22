import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createCardPayment, createCashPayment, createGiftCardPayment } from "@/services/paymentService"
import type { Order } from "@/services/orderService"
import { cancelCardPayment as cancelRealCardPayment } from "@/services/paymentService"

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

export interface PaymentOverlayProps {
    order: Order
    onPaid?: (data?: { changeDue?: number }) => void
    onProgress?: () => void
}

type PaymentMethod = "CASH" | "CARD" | "GIFT_CARD"

const PaymentOverlay: React.FC<PaymentOverlayProps> = ({ order, onPaid, onProgress }) => {
    const [method, setMethod] = useState<PaymentMethod>("CASH")

    const [amount, setAmount] = useState("")
    const [tip, setTip] = useState("")
    const [giftCardCode, setGiftCardCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const stripe = useStripe()
    const elements = useElements()
    const [clientSecret, setClientSecret] = useState("");
    const [paymentId, setPaymentId] = useState("");

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
    }

    const selectMethod = (next: PaymentMethod) => {
        setMethod(next)
        resetIrrelevantFields(next)
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

    const startCardPayment = async () => {
        const numericAmount = validateAmount()
        if (numericAmount === null) return

        try {
            setIsSubmitting(true)

            const res = await createCardPayment(order.id.toString(), numericAmount, numericTip)

            setClientSecret(res.stripeClientSecret);
            setPaymentId(res.paymentId);

            setAmount("")
            setTip("")
            onProgress?.()
        } catch (err: any) {
            setClientSecret("")
            setPaymentId("")
            console.error(err)
            toast.error("Failed to create card payment", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const finishCardPayment = async () => {
        if (!stripe || !elements) return

        setIsSubmitting(true)

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
            card: elements.getElement(CardElement)!,
            },
        })

        if (result.error) {
            toast.error("Card payment failed", {
            description: result.error.message,
            })
        } else if (result.paymentIntent?.status === "succeeded") {
            toast.success("Card payment successful")
            setClientSecret("")
            setPaymentId("")

            onPaid?.({ changeDue: 0 })
        }

        setTimeout(() => {
            onProgress?.()
        }, 2000)
        setIsSubmitting(false)
    }

    const cancelCardPayment = async () => {
        
        setIsSubmitting(true)

        try {
            await cancelRealCardPayment(order.id.toString(), paymentId);

            setClientSecret("");
            setPaymentId("");
        } catch (err) {
            console.error("Failed to cancel card payment:", err);
            toast.error("Failed to cancel card payment.");
        }
        
        setTimeout(() => {
            onProgress?.()
        }, 2000)
        setIsSubmitting(false)
    }

    const primaryAction = () => {
        if (method === "CASH") return handleCash()
        if (method === "GIFT_CARD") return handleGiftCard()
        if (method === "CARD") {
            if (clientSecret === "") return startCardPayment()
            else return finishCardPayment()
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

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Button
                            variant={method === "CASH" ? "default" : "outline"}
                            className="h-20 flex flex-col justify-center"
                            onClick={() => selectMethod("CASH")}
                            disabled={isSubmitting || clientSecret !== ""}
                        >
                            <span className="font-semibold text-white">Pay by cash</span>
                            <span className="text-xs text-gray-500">Take cash &amp; give change</span>
                        </Button>

                        <Button
                            variant={method === "CARD" ? "default" : "outline"}
                            className="h-20 flex flex-col justify-center"
                            onClick={() => selectMethod("CARD")}
                            disabled={isSubmitting || clientSecret !== ""}
                        >
                            <span className="font-semibold text-white">Pay by card</span>
                            <span className="text-xs text-gray-500">Terminal / online card</span>
                        </Button>

                        <Button
                            variant={method === "GIFT_CARD" ? "default" : "outline"}
                            className="h-20 flex flex-col justify-center"
                            onClick={() => selectMethod("GIFT_CARD")}
                            disabled={isSubmitting || clientSecret !== ""}
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

                        {method === "CARD" && (
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium">Amount to pay</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 25.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={isSubmitting || clientSecret !== ""}
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

                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-sm font-medium">Tip</label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 5.00"
                                value={tip}
                                onChange={(e) => setTip(e.target.value)}
                                disabled={isSubmitting || clientSecret !== ""}
                            />
                        </div>
                    </div>

                    {
                        clientSecret !== "" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Card details</label>

                                <div className="rounded border p-3 min-w-[300px]">
                                    <CardElement
                                        options={{
                                        hidePostalCode: true,
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )
                    }


                    <div className="flex justify-end text-white">
                        { clientSecret !== "" && (
                            <Button onClick={cancelCardPayment} disabled={isSubmitting}>
                                Cancel Card payment
                            </Button>
                        )}
                        <Button onClick={primaryAction} disabled={isSubmitting || !stripe}>
                            {method === "CASH" && "Take Cash payment"}
                            {method === "GIFT_CARD" && "Take Gift Card payment"}
                            {method === "CARD" && clientSecret === "" && "Take Card payment"}
                            {method === "CARD" && clientSecret !== "" && "Confirm card payment"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PaymentOverlay
