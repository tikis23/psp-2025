import { fetchApi } from "./fetchClient";

export type OrderStatus = 
  | "OPEN"
  | "CLOSED"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItemVariation {
  id: number;
  name: string;
  priceOffset: number;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  variations: OrderItemVariation[];
}

export interface Order {
  id: number;
  merchantId: number;
  status: OrderStatus;
  items: OrderItem[];
  // payments?: PaymentDTO[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderInfo {
  id: number;
  merchantId: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const getAllOrders = (merchantId: number): Promise<OrderInfo[]> => {
  return fetchApi<OrderInfo[]>(`/api/orders/${merchantId}/all`, {
    method: "GET",
  });
}

export const getOrder = (orderId: number): Promise<Order> => {
  return fetchApi<Order>(`/api/orders/${orderId}`, {
    method: "GET",
  });
}

export const createOrder = (merchantId: number): Promise<Order> => {
  return fetchApi<Order>("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantId: merchantId,
    }),
  });
}

export const addItemToOrder = (
  orderId: number,
  itemId: number,
  quantity: number,
  variationId?: number
): Promise<Order> => {
  return fetchApi<Order>(`/api/orders/${orderId}/items`, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemId: itemId,
      quantity: quantity,
      variationId: variationId,
    }),
  });
}