import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { Order } from "@/services/orderService"
import { useParams } from "react-router-dom"
import { addItemToOrder, getOrder, removeItemFromOrder, updateOrderItemQuantity, updateOrderStatus } from "@/services/orderService"
import OrderDetails from "@/components/orders/orderDetails"
import ItemMenu from "@/components/orders/itemMenu"
import { getAllItems } from "@/services/itemService"
import type { Item } from "@/types"
import PaymentOverlay from "@/components/orders/paymentOverlay"

const ModifyOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);

  useEffect(() => {
    setCurrentOrder(null);
    if (!orderId) {
      toast.error("No order ID provided.");
      return;
    }

    const numberOrderId = Number(orderId);
    if (isNaN(numberOrderId)) {
      toast.error("Invalid order ID.");
      return;
    }


    getOrder(numberOrderId).then((order) => {
      setCurrentOrder(order);
    }).catch((error) => {
      toast.error("Failed to load order. Please try again.");
      console.error("Error fetching order:", error);
    });

    getAllItems().then((items) => {
      setAvailableItems(items);
    }).catch((error) => {
      toast.error("Failed to load available items. Please try again.");
      console.error("Error fetching items:", error);
    });

  }, [orderId])

  const updateItemQuantity = (itemId: number, newQuantity: number) => {
    if (!currentOrder) return;

    updateOrderItemQuantity(currentOrder.id, itemId, newQuantity).then((updatedOrder) => {
      setCurrentOrder(updatedOrder);
    }).catch((error) => {
      toast.error("Failed to update item quantity. Please try again.");
      console.error("Error updating item quantity:", error);
    });
  }

  const removeItem = (itemId: number) => {
    if (!currentOrder) return;

    removeItemFromOrder(currentOrder.id, itemId).then((updatedOrder) => {
      setCurrentOrder(updatedOrder);
    }).catch((error) => {
      toast.error("Failed to remove item from order. Please try again.");
      console.error("Error removing item from order:", error);
    });
  }

  const cancelOrder = () => {
    if (!currentOrder) return;

    updateOrderStatus(currentOrder.id, "CANCELLED").then((updatedOrder) => {
      setCurrentOrder(updatedOrder);
      toast.success("Order cancelled.");
    }).catch((error) => {
      toast.error("Failed to cancel order. Please try again.");
      console.error("Error cancelling order:", error);
    });
  }

  const payOrder = () => {
    if (!currentOrder) return;
    setShowPaymentOverlay(true);
  }

  return (
    <div className="w-full flex gap-4">

      {showPaymentOverlay && currentOrder && (
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.3)]"
            onClick={() => setShowPaymentOverlay(false)}
          />
          <div className="fixed z-50">
            <PaymentOverlay order={currentOrder}/>
          </div>
        </div>
      )}

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
          {currentOrder ?
            (currentOrder.status === "OPEN" ?
              <OrderDetails
                order={currentOrder}
                onUpdateQuantity={(itemId, newQuantity) => {
                  updateItemQuantity(itemId, newQuantity);
                }}
                onItemRemove={(itemId) => {
                  removeItem(itemId);
                }}
                onCancel={cancelOrder}
                onPay={payOrder}
              /> :
              <OrderDetails
                order={currentOrder}
              />
            ) :
            <p>No Order</p>
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default ModifyOrderPage;
