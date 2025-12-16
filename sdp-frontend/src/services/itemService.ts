import { fetchApi } from "./fetchClient"
import type {
  Item,
  ItemCreateRequest,
  ItemUpdateRequest,
  ProductVariation,
  VariationCreateRequest,
} from "../types"

export const getAllItems = (merchantId: number): Promise<Item[]> => {
  return fetchApi<Item[]>(`/api/items?merchantId=${merchantId}`)
}

export const getItem = (id: number, merchantId: number): Promise<Item> => {
  return fetchApi<Item>(`/api/items/${id}?merchantId=${merchantId}`)
}

export const createItem = (
  data: ItemCreateRequest,
  merchantId: number
): Promise<Item> => {
  return fetchApi<Item>(`/api/items?merchantId=${merchantId}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
}

export const updateItem = (
  id: number,
  data: ItemUpdateRequest,
  merchantId: number
): Promise<Item> => {
  return fetchApi<Item>(`/api/items/${id}?merchantId=${merchantId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
}

export const deleteItem = (id: number, merchantId: number): Promise<void> => {
  return fetchApi<void>(`/api/items/${id}?merchantId=${merchantId}`, {
    method: "DELETE",
  })
}

export const getVariations = (
  itemId: number,
  merchantId: number
): Promise<ProductVariation[]> => {
  return fetchApi<ProductVariation[]>(
    `/api/items/${itemId}/variations?merchantId=${merchantId}`
  )
}

export const createVariation = (
  itemId: number,
  data: VariationCreateRequest,
  merchantId: number
): Promise<ProductVariation> => {
  return fetchApi<ProductVariation>(
    `/api/items/${itemId}/variations?merchantId=${merchantId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }
  )
}

export const updateVariation = (
  itemId: number,
  variationId: number,
  data: VariationCreateRequest,
  merchantId: number
): Promise<ProductVariation> => {
  return fetchApi<ProductVariation>(
    `/api/items/${itemId}/variations/${variationId}?merchantId=${merchantId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }
  )
}

export const deleteVariation = (
  itemId: number,
  variationId: number,
  merchantId: number
): Promise<void> => {
  return fetchApi<void>(
    `/api/items/${itemId}/variations/${variationId}?merchantId=${merchantId}`,
    {
      method: "DELETE",
    }
  )
}
