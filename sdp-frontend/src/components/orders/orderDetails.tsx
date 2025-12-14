import type { Order, OrderItem, OrderItemVariation } from "@/services/orderService";

export interface OrderDetailsProps {
  order: Order;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onItemRemove: (itemId: number) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onUpdateQuantity, onItemRemove }) => {
  const updateQuantity = (itemId: number, newQuantity: number) => {
    onUpdateQuantity(itemId, newQuantity);
  }
  const removeItem = (itemId: number) => {
    onItemRemove(itemId);
  }
  
  return (
    <>
      {/* Basic info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-medium">#{order.id}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">{order.status}</span>
        </div>
      </div>

      {/* Items */}
      {order.items.length > 0 && (
        <div className="border-t pt-4 space-y-4">
          <h3 className="text-lg font-semibold">Items</h3>
          <div className="space-y-2">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="p-2 border rounded flex gap-3">
                <div className="flex flex-col items-center justify-center gap-0 text-l leading-none">
                  <span
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="cursor-pointer select-none text-gray-500 hover:text-black"
                  >+</span>
                  <span
                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className="cursor-pointer select-none text-gray-500 hover:text-black"
                  >−</span>
                </div>

                
                {/* Item info */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.quantity} × {item.name}
                    </span>
                    <div>
                      <span>
                        ${(
                          (item.price +
                            item.variations.reduce(
                              (acc, variation) => acc + variation.priceOffset,
                              0
                            )) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                      <span
                        onClick={() => removeItem(item.id)}
                        className="ml-4 cursor-pointer text-red-500 hover:text-red-700"
                      >×</span>
                    </div>
                  </div>

                  {item.variations.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1 text-sm text-muted-foreground">
                      {item.variations.map((variation: OrderItemVariation) => (
                        <li key={variation.id}>{variation.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>${order.taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span className="text-green-600">
            -${order.discountAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between border-t pt-2 font-semibold text-base">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Timestamps */}
      <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
        <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
      </div>
    </>
  );
};

export default OrderDetails;
