import { fetchApi } from "./fetchClient"
import type { Merchant, User } from "../types"

export const getAllMerchants = (): Promise<Merchant[]> => {
  console.log("Fetching all merchants")
  return fetchApi<Merchant[]>("/api/merchants", { method: "GET" })
}

export const getMerchant = (id: number): Promise<Merchant> => {
  return fetchApi<Merchant>(`/api/merchants/${id}`, { method: "GET" })
}

export const getMerchantUsers = (merchantId: number): Promise<User[]> => {
  return fetchApi<User[]>(`/api/merchants/${merchantId}/users`, { method: "GET" })
}

export const createMerchant = (data: { name: string; address: string, contactInfo: string }): Promise<Merchant> => {
  return fetchApi<Merchant>("/api/merchants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}