import { fetchApi } from "./fetchClient";

export type OrderStatus = 
  | "OPEN"
  | "CLOSED"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED";

export interface Order {
  id: number;
  merchantId: string;
  status: OrderStatus;
  // items?: OrderItemDTO[];
  // payments?: PaymentDTO[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const createOrder = (): Promise<Order> => {
  return fetchApi<Order>("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantId: "test",
    }),
  });
}