import { fetchApi } from "./fetchClient"

export type RefundStatus = "processing" | "completed" | "failed"

export interface RefundBreakdown {
    originalPaymentId: string
    paymentType: string
    amount: number
    refundStatus: string
    stripeRefundId?: string | null
}

export interface RefundResponse {
    refundId: string
    orderId: string
    totalAmount: number
    status: string
    createdAt: string
    refundBreakdown: RefundBreakdown[]
}

export const createRefund = (
    orderId: number,
    reason: string
): Promise<RefundResponse> => {
    return fetchApi<RefundResponse>(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
    });
};
