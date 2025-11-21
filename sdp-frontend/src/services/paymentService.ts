import { fetchApi } from "./fetchClient"

export type PaymentType = "cash" | "gift_card" | "card"

export interface CashPaymentResponse {
    id: string
    orderId: string
    payment_type: PaymentType
    amount: number
    status: string
    createdAt: string
    remainingBalance: number
}

export const createCashPayment = (
    orderId: string,
    amount: number
): Promise<CashPaymentResponse> => {
    return fetchApi<CashPaymentResponse>(`/orders/${orderId}/payments`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        payment_type: "cash",
        amount,
    }),
    })
}
