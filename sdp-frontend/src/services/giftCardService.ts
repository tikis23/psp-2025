import { fetchApi } from "./fetchClient"
import type { GiftCard, GiftCardCreateRequest } from "@/types"

export const getAllGiftCards = (merchantId: number): Promise<GiftCard[]> => {
  return fetchApi(`/api/gift-cards?merchantId=${merchantId}`)
}

export const createGiftCard = (
  data: GiftCardCreateRequest,
  merchantId: number
): Promise<GiftCard> => {
  return fetchApi(`/api/gift-cards?merchantId=${merchantId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export const checkGiftCardBalance = (code: string): Promise<any> => {
  return fetchApi(`/gift-cards/${encodeURIComponent(code)}/balance`, { method: "GET" })
}

export const deleteGiftCard = (
  code: string,
  merchantId: number
): Promise<void> => {
  return fetchApi(`/api/gift-cards/${code}?merchantId=${merchantId}`, {
    method: "DELETE",
  })
}

