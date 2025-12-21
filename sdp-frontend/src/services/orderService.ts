import { fetchApi } from "./fetchClient";
import type { PaymentStatus, PaymentType } from "./paymentService";

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
    discountId?: string;
    appliedDiscountAmount?: number;
}

export interface OrderPaymentInfo {
    id: number;
    type: PaymentType;
    status: PaymentStatus;
    amount: number;
    tip: number;
}

export interface Order {
    id: number;
    merchantId: number;
    status: OrderStatus;
    items: OrderItem[];
    payments: OrderPaymentInfo[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    discountId?: string;
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

export const updateOrderItemQuantity = (
    orderId: number,
    itemId: number,
    newQuantity: number
): Promise<Order> => {
    return fetchApi<Order>(`/api/orders/${orderId}/items/${itemId}/quantity`, {
        method: "PUT",
        body: newQuantity.toString(),
    });
}

export const removeItemFromOrder = (
    orderId: number,
    itemId: number
): Promise<Order> => {
    return fetchApi<Order>(`/api/orders/${orderId}/items/${itemId}`, {
        method: "DELETE",
    });
}

export const updateOrderStatus = (
    orderId: number,
    newStatus: OrderStatus
): Promise<Order> => {
    return fetchApi<Order>(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: newStatus,
    });
}

export const applyOrderDiscount = (
    orderId: number,
    code: string
): Promise<Order> => {
    return fetchApi<Order>(`/api/orders/${orderId}/discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
    })
}

export const applyItemDiscount = (
    orderId: number,
    itemId: number,
    code: string
): Promise<Order> => {
    return fetchApi<Order>(`/api/orders/${orderId}/items/${itemId}/discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
    })
}