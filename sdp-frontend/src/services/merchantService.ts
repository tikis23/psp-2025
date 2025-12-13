import { fetchApi } from "./fetchClient"
import type { Merchant } from "../types"

export const getAllMerchants = (): Promise<Merchant[]> => {
  return fetchApi<Merchant[]>("/api/merchants", { method: "GET" })
}

export const getMerchant = (id: number): Promise<Merchant> => {
  return fetchApi<Merchant>(`/api/merchants/${id}`, { method: "GET" })
}
