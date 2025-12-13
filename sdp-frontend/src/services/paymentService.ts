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

export interface GiftCardPaymentResponse extends CashPaymentResponse {
    giftCardCode: string
    remainingCardBalance: number
}

export interface GiftCardIssueResponse {
    code: string
    balance: number
}

export const createGiftCard = (
    amount: number
): Promise<GiftCardIssueResponse> => {
    return fetchApi<GiftCardIssueResponse>("/api/gift-cards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
    })
}

export const createCashPayment = (
    orderId: string,
    amount: number
): Promise<CashPaymentResponse> => {
    return fetchApi<CashPaymentResponse>(`/api/orders/${orderId}/payments`, {
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

export const createGiftCardPayment = (
    orderId: string,
    amount: number,
    giftCardCode: string
): Promise<GiftCardPaymentResponse> => {
    return fetchApi<GiftCardPaymentResponse>(`/api/orders/${orderId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            payment_type: "gift_card",
            amount,
            giftCardCode,
        }),
    })
}

