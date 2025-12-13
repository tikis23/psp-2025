import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { Order } from "@/services/orderService"
import { useLocation } from "react-router-dom"
import { createOrder, addItemToOrder } from "@/services/orderService"
import OrderDetails from "@/components/orders/orderDetails"
import ItemMenu from "@/components/orders/itemMenu"
import { getAllItems } from "@/services/itemService"
import type { Item } from "@/types"

const OrdersPage = () => {
  const location = useLocation();
  const startNewOrder = location.state?.newOrder || false;

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [availableItems, setAvailableItems] = useState<Item[]>([])

  useEffect(() => {
    if (!startNewOrder) return;

    setCurrentOrder(null);

    getAllItems().then((items) => {
      setAvailableItems(items);
    }).catch((error) => {
      toast.error("Failed to load available items. Please try again.");
      console.error("Error fetching items:", error);
    });

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
        <CardContent>
          <ItemMenu items={availableItems} onAddItem={(item, quantity, variation) => {
            if (!currentOrder) {
              toast.error("No active order. Please start a new order first.");
              return;
            }
            addItemToOrder(currentOrder.id, item.id, quantity, variation?.id).then((updatedOrder) => {
              setCurrentOrder(updatedOrder);
              toast.success(`Added ${quantity} x ${item.name} to order.`);
            }).catch((error) => {
              toast.error("Failed to add item to order. Please try again.");
              console.error("Error adding item to order:", error);
            });
          }} />
        </CardContent>
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
