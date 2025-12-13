import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { Order } from "@/services/orderService"
import { useLocation } from "react-router-dom"
import { createOrder } from "@/services/orderService"
import OrderDetails from "@/components/orders/orderDetails"

const OrdersPage = () => {
  const location = useLocation();
  const startNewOrder = location.state?.newOrder || false;

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!startNewOrder) return;

    setCurrentOrder(null);

    createOrder().then((order) => {
      setCurrentOrder(order);
      toast.success("New order Started");
    }).catch((error) => {
      toast.error("Failed to create a new order. Please try again.");
      console.error("Error creating order:", error);
    });
  }, [startNewOrder])


  return (
    <div className="w-full flex gap-4">
      <Card className="w-6/8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Add Items</CardTitle>
        </CardHeader>
      </Card>

      <Card className="w-2/8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          {currentOrder ? <OrderDetails order={currentOrder} /> : <p>No Order</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default OrdersPage;
