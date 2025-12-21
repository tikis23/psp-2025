import { fetchApi } from "./fetchClient"
import type { Discount } from "../types"

export const getDiscounts = (merchantId: number): Promise<Discount[]> => {
    return fetchApi<Discount[]>(`/api/discounts?merchantId=${merchantId}`)
}

export const createDiscount = (
    data: Partial<Discount>,
    merchantId: number
): Promise<Discount> => {
    return fetchApi<Discount>("/api/discounts", {
        method: "POST",
        body: JSON.stringify({ ...data, merchantId }),
    })
}

export const updateDiscount = (
    id: string,
    data: Partial<Discount>
): Promise<Discount> => {
    return fetchApi<Discount>(`/api/discounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    })
}

export const deleteDiscount = (id: string): Promise<void> => {
    return fetchApi<void>(`/api/discounts/${id}`, {
        method: "DELETE",
    })
}