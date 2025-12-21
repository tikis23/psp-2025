import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { getAllOrders, getOrder, type Order, type OrderInfo } from "@/services/orderService"
import { createRefund, type RefundResponse } from "@/services/refundService"
import RefundReceiptOverlay from "@/components/refunds/refundReceiptOverlay"

const statusPill = (status: string) => {
    const s = String(status || "").toUpperCase()
    if (s === "PAID") return "bg-green-100 text-green-800"
    if (s === "REFUNDED") return "bg-purple-100 text-purple-800"
    if (s === "CANCELLED") return "bg-gray-200 text-gray-800"
    return "bg-yellow-100 text-yellow-800"
}

export default function RefundsPage() {
    const { user } = useAuth()

    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
    const [search, setSearch] = useState("")
    const [reason, setReason] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [refundReceipt, setRefundReceipt] = useState<RefundResponse | null>(null)
    const [refundReceiptOrder, setRefundReceiptOrder] = useState<Order | null>(null)
    const [refundReceiptReason, setRefundReceiptReason] = useState("")

    useEffect(() => {
        if (!user?.merchantId) return

        setIsLoading(true)
        getAllOrders(user.merchantId)
            .then(async (list: OrderInfo[]) => {
                const full = await Promise.all(list.map((o) => getOrder(o.id)))
                setOrders(full.sort((a, b) => b.id - a.id))
            })
            .catch((e) => {
                console.error(e)
                toast.error("Failed to load orders")
            })
            .finally(() => setIsLoading(false))
    }, [user])


    const filtered = useMemo(() => {
        const q = search.trim()
        if (!q) return orders
        return orders.filter((o) => String(o.id).includes(q))
    }, [orders, search])

    const selectedOrder = useMemo(() => {
        if (selectedOrderId == null) return null
        return orders.find((o) => o.id === selectedOrderId) ?? null
    }, [orders, selectedOrderId])

    const refreshOneOrder = async (orderId: number) => {
        const updated = await getOrder(orderId)
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
        return updated
    }

    const orderSummary = useMemo(() => {
        if (!selectedOrder) return null

        const items = selectedOrder.items ?? []
        const subtotal = Number(selectedOrder.subtotal ?? 0)
        const tax = Number(selectedOrder.taxAmount ?? 0)
        const discount = Number(selectedOrder.discountAmount ?? 0)
        const total = Number(selectedOrder.total ?? subtotal + tax - discount)

        const payments = selectedOrder.payments ?? []

        const paidApplied = payments
            .filter((p: any) => String(p.status ?? "").toUpperCase() === "SUCCEEDED")
            .reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0)

        const refundable = payments
            .filter((p: any) => String(p.status ?? "").toUpperCase() === "SUCCEEDED")
            .filter((p: any) => String(p.type ?? "").toUpperCase() !== "GIFT_CARD")
            .reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0)

        return { items, subtotal, tax, discount, total, payments, paidApplied, refundable }
    }, [selectedOrder])


    const handleRefund = async () => {
        if (!selectedOrder) return

        if (selectedOrder.status !== "PAID") {
            toast.error("Only PAID orders can be refunded")
            return
        }

        const trimmed = reason.trim()
        if (!trimmed) {
            toast.error("Refund reason is required")
            return
        }

        try {
            setIsSubmitting(true)

            const res = await createRefund(selectedOrder.id, trimmed)

            toast.success("Refund initiated", {
                description: `Refunded €${Number(res.totalAmount ?? 0).toFixed(2)}`,
            })

            const updatedOrder = await refreshOneOrder(selectedOrder.id)

            setRefundReceipt(res)
            setRefundReceiptOrder(updatedOrder)
            setRefundReceiptReason(trimmed)

            setReason("")
        } catch (err: any) {
            console.error(err)
            toast.error("Refund failed", {
                description: err?.data || err?.message || "Unknown error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        if (typeof window !== "undefined") window.location.href = "/login"
        return null
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {refundReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-[rgba(0,0,0,0.35)]"
                        onClick={() => setRefundReceipt(null)}
                    />
                    <div className="relative z-10">
                        <RefundReceiptOverlay
                            refund={refundReceipt}
                            order={refundReceiptOrder}
                            reason={refundReceiptReason}
                            onClose={() => setRefundReceipt(null)}
                        />
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Refunds</h1>
                <p className="text-gray-600 mt-2">Select an order and issue a full refund</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Search by order ID"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500">Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">No orders found</div>
                        ) : (
                            <div className="grid gap-4 max-h-[520px] overflow-auto pr-1">
                                {filtered.map((o) => {
                                    const isSelected = selectedOrderId === o.id
                                    return (
                                        <button
                                            key={o.id}
                                            onClick={() => setSelectedOrderId(o.id)}
                                            className={[
                                                "w-full text-left rounded-xl border bg-white p-4 transition-shadow",
                                                "hover:shadow-md text-white",
                                                isSelected ? "border-black ring-2 ring-black/10" : "border-gray-200",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-lg truncate">Order #{o.id}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Created: {new Date(o.createdAt).toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Total: <span className="font-semibold text-gray-600">€{Number(o.total ?? 0).toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${statusPill(o.status)}`}>
                                                    {o.status}
                                                </span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Refund details</CardTitle>
                    </CardHeader>
                    {orderSummary && (
                        <div className="space-y-4">
                            <div className="rounded-xl border bg-white">
                                <div className="px-4 py-3 border-b">
                                    <div className="text-sm font-semibold">Items</div>
                                </div>

                                <div className="max-h-56 overflow-auto">
                                    {orderSummary.items.length === 0 ? (
                                        <div className="px-4 py-4 text-sm text-gray-500">No items</div>
                                    ) : (
                                        orderSummary.items.map((it: any) => {
                                            const qty = Number(it.quantity ?? 0)
                                            const price = Number(it.price ?? 0)
                                            const line = qty * price
                                            const vars = it.variations ?? []
                                            const variationExtra = vars.reduce((s: number, v: any) => s + Number(v.priceOffset ?? 0) * qty, 0)

                                            return (
                                                <div key={it.id} className="px-4 py-3 flex items-start justify-between gap-4 border-b last:border-b-0">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 truncate">{it.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {qty} × €{price.toFixed(2)}
                                                            {variationExtra > 0 ? `  (+€${variationExtra.toFixed(2)} variations)` : ""}
                                                        </div>

                                                        {vars.length > 0 && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {vars.map((v: any) => `${v.name} (${Number(v.priceOffset ?? 0).toFixed(2)})`).join(", ")}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="font-semibold text-gray-900">
                                                        €{(line + variationExtra).toFixed(2)}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border bg-white p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">€{orderSummary.subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold">€{orderSummary.tax.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-semibold">-€{orderSummary.discount.toFixed(2)}</span>
                                </div>

                                <div className="border-t pt-3 flex justify-between text-base">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold">€{orderSummary.total.toFixed(2)}</span>
                                </div>

                                <div className="pt-2 text-xs text-gray-500">
                                    Refundable total:{" "}
                                    <span className="font-semibold text-gray-900">€{orderSummary.refundable.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-white">
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <div className="text-sm font-semibold">Payments</div>
                                    <div className="text-xs text-gray-500">
                                        Paid: <span className="font-semibold text-gray-900">€{orderSummary.paidApplied.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="max-h-56 overflow-auto">
                                    {orderSummary.payments.length === 0 ? (
                                        <div className="px-4 py-4 text-sm text-gray-500">No payments</div>
                                    ) : (
                                        orderSummary.payments.map((p: any) => {
                                            const type = String(p.type ?? "").toUpperCase()
                                            const status = String(p.status ?? "").toUpperCase()
                                            return (
                                                <div key={p.id} className="px-4 py-3 flex items-start justify-between gap-4 border-b last:border-b-0">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{type}</div>
                                                        <div className="text-xs text-gray-500">Status: {status}</div>
                                                        {Number(p.tip ?? 0) > 0 && <div className="text-xs text-gray-500">Tip: €{Number(p.tip).toFixed(2)}</div>}
                                                    </div>

                                                    <div className="font-semibold text-gray-900">€{Number(p.amount ?? 0).toFixed(2)}</div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border bg-white p-4 space-y-3">
                                <div className="text-sm font-semibold">Refund</div>

                                {selectedOrder?.status !== "PAID" ? (
                                    <div className="text-sm text-gray-500">
                                        Only <span className="font-semibold">PAID</span> orders can be refunded.
                                    </div>
                                ) : orderSummary.refundable <= 0 ? (
                                    <div className="text-sm text-gray-500">
                                        No refundable payments found.
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-sm font-medium mb-2">Refund reason</div>
                                            <Input
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="e.g. Customer requested cancellation"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-600">
                                            <span>Refundable now</span>
                                            <span className="font-semibold text-gray-900">
                                                €{orderSummary.refundable.toFixed(2)}
                                            </span>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            className="w-full text-white"
                                            onClick={handleRefund}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Refunding..." : "Refund order"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
