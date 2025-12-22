import { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Order } from "@/services/orderService"

type ReceiptOverlayProps = {
    order: Order
    onClose: () => void
}

const ReceiptOverlay: React.FC<ReceiptOverlayProps> = ({ order, onClose }) => {
    const totals = useMemo(() => {
        const items = order.items ?? []

        const itemDiscountsTotal = items.reduce((sum, item) => sum + Number(item.appliedDiscountAmount ?? 0), 0)

        const subtotal = Number(order.subtotal ?? 0)
        const orderLevelDiscount = Number(order.discountAmount ?? 0)
        const totalDiscounts = itemDiscountsTotal + orderLevelDiscount
        const tax = Number(order.taxAmount ?? 0)

        const total = Number(order.total ?? subtotal + tax - orderLevelDiscount)

        const payments = order.payments ?? []

        const paidApplied = payments.reduce((sum, p: any) => sum + Number(p.amount ?? 0), 0)
        const tipTotal = payments.reduce((sum, p: any) => sum + Number(p.tip ?? 0), 0)

        const cashReceivedTotal = payments
            .filter((p: any) => String(p.type ?? "").toUpperCase() === "CASH")
            .reduce((sum: number, p: any) => sum + Number(p.cashReceived ?? 0), 0)

        const changeTotal = payments
            .filter((p: any) => String(p.type ?? "").toUpperCase() === "CASH")
            .reduce((sum: number, p: any) => {
                const received = Number(p.cashReceived ?? 0)
                const applied = Number(p.amount ?? 0)
                return sum + Math.max(0, received - applied)
            }, 0)

        const remaining = Math.max(0, total - paidApplied)

        return {
            subtotal,
            tax,
            orderLevelDiscount,
            itemDiscountsTotal,
            totalDiscounts,
            total,
            tipTotal,
            paidApplied,
            cashReceivedTotal,
            changeTotal,
            remaining
        }
    }, [order])

    const createdAt = useMemo(() => {
        try {
            return new Date(order.createdAt).toLocaleString()
        } catch {
            return String(order.createdAt ?? "")
        }
    }, [order.createdAt])

    const printReceipt = () => {
        toast.info("Printing", { description: "Printing functionality is not implemented yet." })
    }

    const showCashReceived = totals.cashReceivedTotal > 0
    const showTip = totals.tipTotal > 0

    return (
        <Card className="w-[min(720px,92vw)] max-h-[90vh] shadow-xl flex flex-col">
            <CardHeader className="pb-3 shrink-0">
                <CardTitle className="text-3xl text-center">Receipt</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-6 px-6 pb-6">
                <div className="text-base text-gray-600 flex items-center justify-between">
                    <div>
                        <div className="text-lg font-semibold text-gray-900">Order #{order.id}</div>
                        <div className="text-base">{createdAt}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Status</div>
                        <div className="text-lg font-semibold">{order.status}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-xl font-semibold">Items</div>
                    <div className="rounded-md border">
                        <div className="max-h-80 overflow-auto">
                            {(order.items ?? []).map((it) => {
                                const qty = Number(it.quantity ?? 0)
                                const price = Number(it.price ?? 0)
                                const itemDiscount = Number(it.appliedDiscountAmount ?? 0)
                                const taxRate = Number(it.appliedTaxRate ?? 0)

                                let basePrice = price
                                if (it.variations) {
                                    it.variations.forEach(v => basePrice += Number(v.priceOffset ?? 0))
                                }
                                const lineGross = qty * basePrice
                                const lineTaxable = lineGross - itemDiscount
                                const lineTaxAmount = lineTaxable * taxRate

                                return (
                                    <div key={it.id} className="px-5 py-4 flex flex-col border-b last:border-b-0 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-lg font-medium">{it.name}</div>
                                                <div className="text-base text-gray-500">
                                                    {qty} × {price.toFixed(2)}
                                                </div>
                                                {(it.variations ?? []).length > 0 && (
                                                    <div className="text-sm text-gray-500">
                                                        +{" "}
                                                        {it.variations
                                                            .map((v) => `${v.name} (${Number(v.priceOffset ?? 0).toFixed(2)})`)
                                                            .join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-lg font-semibold">{lineGross.toFixed(2)}</div>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-0.5 pl-2 border-l-2 border-gray-100">
                                            {itemDiscount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount</span>
                                                    <span>-{itemDiscount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {taxRate > 0 && (
                                                <div className="flex justify-between text-gray-500">
                                                    <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
                                                    <span>{lineTaxAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-xl font-semibold">Payments</div>
                    <div className="rounded-md border">
                        <div className="max-h-64 overflow-auto">
                            {(order.payments ?? []).map((p: any) => (
                                <div key={p.id} className="px-5 py-4 flex items-center justify-between border-b last:border-b-0">
                                    <div>
                                        <div className="text-lg font-medium">{p.type}</div>
                                        <div className="text-base text-gray-500">{String(p.status ?? "")}</div>
                                        {Number(p.tip ?? 0) > 0 && (
                                            <div className="text-base text-gray-500">Tip: {Number(p.tip).toFixed(2)}</div>
                                        )}
                                    </div>
                                    <div className="text-lg font-semibold">{Number(p.amount ?? 0).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-md border p-6 space-y-3">
                    <div className="flex justify-between text-base">
                        <span>Subtotal (Net)</span>
                        <span>{totals.subtotal.toFixed(2)}</span>
                    </div>

                    {totals.itemDiscountsTotal > 0 && (
                        <div className="flex justify-between text-base text-green-600">
                            <span>Item Discounts</span>
                            <span>-{totals.itemDiscountsTotal.toFixed(2)}</span>
                        </div>
                    )}

                    {totals.orderLevelDiscount > 0 && (
                        <div className="flex justify-between text-base text-green-600">
                            <span>Order Discount</span>
                            <span>-{totals.orderLevelDiscount.toFixed(2)}</span>
                        </div>
                    )}

                    {(totals.itemDiscountsTotal > 0 || totals.orderLevelDiscount > 0) && (
                        <div className="flex justify-between text-base font-medium text-green-700 pt-2">
                            <span>Total Discounts</span>
                            <span>-{totals.totalDiscounts.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-base pt-2">
                        <span>Total Tax</span>
                        <span>{totals.tax.toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-4 flex justify-between text-2xl font-semibold">
                        <span>Total</span>
                        <span>{totals.total.toFixed(2)}</span>
                    </div>

                    {showTip && (
                        <div className="flex justify-between text-base text-gray-700">
                            <span>Tip</span>
                            <span className="font-semibold">{totals.tipTotal.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-base text-gray-700">
                        <span>Paid</span>
                        <span className="font-semibold">{totals.paidApplied.toFixed(2)}</span>
                    </div>

                    {showCashReceived && (
                        <div className="flex justify-between text-base text-gray-700">
                            <span>Cash received</span>
                            <span className="font-semibold">{totals.cashReceivedTotal.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-base text-gray-700">
                        <span>Change</span>
                        <span className="font-semibold">{totals.changeTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-base">
                        <span>Remaining</span>
                        <span className={totals.remaining === 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                            {totals.remaining.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 justify-end sticky bottom-0 bg-white pt-4 text-white">
                    <Button className="text-white" variant="outline" onClick={printReceipt}>Print</Button>
                    <Button className="text-white" onClick={onClose}>Close</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default ReceiptOverlay