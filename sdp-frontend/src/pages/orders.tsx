import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { getAllOrders, type OrderInfo } from "@/services/orderService"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const OrdersPage = () => {
    const [orders, setOrders] = useState<OrderInfo[]>([]);
    const navigate = useNavigate();

    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        getAllOrders(user.merchantId!).then((data) => {
            setOrders(data);
        }).catch((error) => {
            toast.error("Failed to load orders. Please try again.");
            console.error("Error fetching orders:", error);
        });
    }, []);

    return (
        <div className="w-full flex gap-4">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-center text-gray-500">No orders found.</p>
                    ) : (
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">Order ID</th>
                                    <th className="border px-4 py-2">Status</th>
                                    <th className="border px-4 py-2">Created At</th>
                                    <th className="border px-4 py-2">Updated At</th>
                                    <th className="border px-4 py-2">Modify</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="border px-4 py-2 text-center">{order.id}</td>
                                        <td className="border px-4 py-2 text-center">{order.status}</td>
                                        <td className="border px-4 py-2 text-center">{new Date(order.createdAt).toLocaleString()}</td>
                                        <td className="border px-4 py-2 text-center">{new Date(order.updatedAt).toLocaleString()}</td>
                                        <td className="border px-4 py-2 text-center">
                                            {
                                                order.status === "OPEN" ?
                                                <Button
                                                    className="flex-1"
                                                    onClick={() => navigate(`/modifyOrder/${order.id}`)}
                                                >
                                                Modify
                                            </Button> : <></>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default OrdersPage;
