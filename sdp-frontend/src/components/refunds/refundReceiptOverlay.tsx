import { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { RefundResponse } from "@/services/refundService"
import type { Order } from "@/services/orderService"

type RefundReceiptOverlayProps = {
    refund: RefundResponse
    order?: Order | null
    reason?: string
    onClose: () => void
}

const pill = (status: string) => {
    const s = String(status || "").toLowerCase()
    if (s === "completed") return "bg-green-100 text-green-800"
    if (s === "failed") return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
}

const RefundReceiptOverlay: React.FC<RefundReceiptOverlayProps> = ({ refund, order, reason, onClose }) => {
    const createdAt = useMemo(() => {
        try {
            return new Date(refund.createdAt).toLocaleString()
        } catch {
            return String(refund.createdAt ?? "")
        }
    }, [refund.createdAt])

    const totals = useMemo(() => {
        if (!order) return null
        const subtotal = Number(order.subtotal ?? 0)
        const tax = Number(order.taxAmount ?? 0)
        const discount = Number(order.discountAmount ?? 0)
        const total = Number(order.total ?? subtotal + tax - discount)
        return { subtotal, tax, discount, total }
    }, [order])

    const printReceipt = () => toast.info("Printing", { description: "Printing functionality is not implemented yet." })

    const breakdown = refund.refundBreakdown ?? []
    const hasBreakdown = breakdown.length > 0

    return (
        <Card className="w-[min(820px,94vw)] max-h-[90vh] shadow-xl flex flex-col">
            <CardHeader className="pb-3 shrink-0">
                <CardTitle className="text-3xl text-center">Refund Receipt</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-6 px-6 pb-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-lg font-semibold text-gray-900">Order #{refund.orderId}</div>
                        <div className="text-sm text-gray-500 mt-1">{createdAt}</div>
                    </div>

                    <div className="text-right space-x-2">
                        <div className="text-xs text-gray-500">Status</div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${pill(refund.status)}`}>
                            {String(refund.status).toUpperCase()}
                        </span>
                    </div>
                </div>

                {reason?.trim() && (
                    <div className="rounded-md border p-4">
                        <div className="text-sm text-gray-500">Reason</div>
                        <div className="text-base font-medium text-gray-600">{reason}</div>
                    </div>
                )}

                <div className="rounded-md border p-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Total refunded</div>
                            <div className="text-base font-bold text-gray-600">€{Number(refund.totalAmount ?? 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {totals && (
                    <div className="rounded-md border p-5 space-y-2">
                        <div className="text-lg font-semibold">Order totals</div>
                        <div className="flex justify-between text-sm"><span>Subtotal</span><span>€{totals.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span>Tax</span><span>€{totals.tax.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span>Discount</span><span>-€{totals.discount.toFixed(2)}</span></div>
                        <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>€{totals.total.toFixed(2)}</span></div>
                    </div>
                )}

                <div className="space-y-3">
                    <div className="text-xl font-semibold">Refund breakdown</div>
                    <div className="rounded-md border">
                        <div className="max-h-72 overflow-auto">
                            {!hasBreakdown ? (
                                <div className="px-5 py-4 text-gray-500">
                                    No refundable payments found for this order
                                </div>
                            ) : (
                                breakdown.map((b) => (
                                    <div key={b.originalPaymentId} className="px-5 py-4 flex items-start justify-between gap-4 border-b last:border-b-0">
                                        <div>
                                            <div className="text-base font-semibold">{String(b.paymentType).toUpperCase()}</div>
                                            <div className="text-sm text-gray-500">Refund: {String(b.refundStatus).toUpperCase()}</div>
                                        </div>
                                        <div className="text-lg font-bold">€{Number(b.amount ?? 0).toFixed(2)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end sticky bottom-0 bg-white pt-4">
                    <Button className="text-white" variant="outline" onClick={printReceipt}>Print</Button>
                    <Button className="text-white" onClick={onClose}>Close</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default RefundReceiptOverlay
