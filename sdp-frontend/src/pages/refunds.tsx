import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { getAllOrders, getOrder, type Order } from "@/services/orderService";
import { createRefund } from "@/services/refundService";

export default function RefundsPage() {
    const { user } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user?.merchantId) return;

        getAllOrders(user.merchantId)
            .then(async (list) => {
                const fullOrders = await Promise.all(
                    list.map(o => getOrder(o.id))
                );
                setOrders(fullOrders);
            })
            .catch(() => toast.error("Failed to load orders"));
    }, [user]);

    const filteredOrders = orders.filter(o =>
        o.id.toString().includes(search)
    );

    const handleRefund = async () => {
        if (!selectedOrder) return;
        if (!reason.trim()) {
            toast.error("Refund reason is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await createRefund(selectedOrder.id, reason.trim());

            toast.success("Refund initiated", {
                description: `Refunded €${res.totalAmount.toFixed(2)}`,
            });

            const updated = await getOrder(selectedOrder.id);
            setSelectedOrder(updated);
            setOrders(prev =>
                prev.map(o => o.id === updated.id ? updated : o)
            );

            setReason("");
        } catch (err: any) {
            toast.error(
                err?.data?.message || err?.message || "Refund failed"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Refunds</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="Search order by ID"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-4"
                    />

                    <div className="grid gap-2">
                        {filteredOrders.map(order => (
                            <Button
                                className="text-white"
                                key={order.id}
                                variant={
                                    selectedOrder?.id === order.id ? "default" : "outline"
                                }
                                onClick={() => setSelectedOrder(order)}
                            >
                                Order #{order.id} — {order.status}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {selectedOrder && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Order #{selectedOrder.id} — {selectedOrder.status}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedOrder.status !== "PAID" ? (
                            <p className="text-gray-500">
                                Only PAID orders can be refunded.
                            </p>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium">
                                        Refund reason
                                    </label>
                                    <Input
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g. Customer requested cancellation"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <Button
                                    variant="destructive"
                                    onClick={handleRefund}
                                    disabled={isSubmitting}
                                >
                                    Refund order
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
