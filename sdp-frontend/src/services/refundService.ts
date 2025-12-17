import { fetchApi } from "./fetchClient";

export interface RefundResponse {
    refundId: string;
    orderId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export const createRefund = (
    orderId: number,
    reason: string
): Promise<RefundResponse> => {
    return fetchApi<RefundResponse>(`/api/orders/${orderId}/refunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
    });
};
