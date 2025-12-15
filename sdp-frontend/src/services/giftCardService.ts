import { fetchApi } from "./fetchClient"
import type { GiftCard, GiftCardCreateRequest } from "@/types"

export const getAllGiftCards = (): Promise<GiftCard[]> => {
  return fetchApi<GiftCard[]>("/api/gift-cards", { method: "GET" })
}

export const createGiftCard = (data: GiftCardCreateRequest): Promise<GiftCard> => {
  return fetchApi<GiftCard>("/api/gift-cards", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
}

export const checkGiftCardBalance = (code: string): Promise<any> => {
  return fetchApi(`/gift-cards/${encodeURIComponent(code)}/balance`, { method: "GET" })
}

export const deleteGiftCard = (code: string): Promise<void> => {
  return fetchApi<void>(`/api/gift-cards/${encodeURIComponent(code)}`, {
    method: "DELETE",
  })
}

