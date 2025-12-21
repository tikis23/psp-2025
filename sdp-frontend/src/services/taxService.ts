import { fetchApi } from "./fetchClient"
import type { TaxRate } from "../types"

export const getTaxRates = (merchantId: number): Promise<TaxRate[]> => {
    return fetchApi<TaxRate[]>(`/api/tax-rates?merchantId=${merchantId}`)
}

export const createTaxRate = (
    data: Partial<TaxRate>,
    merchantId: number
): Promise<TaxRate> => {
    return fetchApi<TaxRate>("/api/tax-rates", {
        method: "POST",
        body: JSON.stringify({ ...data, merchantId }),
    })
}

export const updateTaxRate = (
    id: string,
    data: Partial<TaxRate>
): Promise<TaxRate> => {
    return fetchApi<TaxRate>(`/api/tax-rates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    })
}

export const deleteTaxRate = (id: string): Promise<void> => {
    return fetchApi<void>(`/api/tax-rates/${id}`, {
        method: "DELETE",
    })
}