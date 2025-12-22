import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { getAllOrders, type OrderInfo } from "@/services/orderService"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
        <div className="w-full flex items-center justify-center gap-4">
            <Card className="w-3/4 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-center text-gray-500">No orders found.</p>
                    ) : (
                        <Table className="w-full table-auto border-collapse">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Updated At</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders
                                    .sort((a, b) => b.id - a.id)
                                    .map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.status}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                            <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Button
                                                    className="flex-1"
                                                    onClick={() => navigate(`/orders/${order.id}`)}
                                                >
                                                    {
                                                        order.status === "OPEN" ? "Modify" : "View"
                                                    }
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default OrdersPage;
