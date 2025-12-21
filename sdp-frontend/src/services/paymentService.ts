import { fetchApi } from "./fetchClient"

export type PaymentType = "CASH" | "GIFT_CARD" | "CARD";

export type PaymentStatus =
    "REQUIRES_ACTION" |
    "PROCESSING" |
    "SUCCEEDED" |
    "FAILED" |
    "CANCELED" |
    "REFUNDED";

export interface CashPaymentResponse {
    id: string
    orderId: string
    payment_type: PaymentType
    amount: number
    cashReceived?: number
    status: string
    createdAt: string
    remainingBalance: number
    changeDue: number
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
    amount: number,
    tip?: number
): Promise<CashPaymentResponse> => {
    return fetchApi<CashPaymentResponse>(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            payment_type: "CASH",
            amount,
            tip,
        }),
    })
}

export const createGiftCardPayment = (
    orderId: string,
    giftCardCode: string,
    tip?: number
): Promise<GiftCardPaymentResponse> => {
    return fetchApi<GiftCardPaymentResponse>(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            payment_type: "GIFT_CARD",
            giftCardCode,
            tip,
        }),
    })
}

