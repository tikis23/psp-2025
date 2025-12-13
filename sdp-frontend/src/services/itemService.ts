import { fetchApi } from "./fetchClient"
import type {
  Item,
  ItemCreateRequest,
  ItemUpdateRequest,
  ProductVariation,
  VariationCreateRequest,
} from "../types"

export const getAllItems = (): Promise<Item[]> => {
  return fetchApi<Item[]>("/api/items", { method: "GET" })
}

export const getItem = (id: number): Promise<Item> => {
  return fetchApi<Item>(`/api/items/${id}`, { method: "GET" })
}

export const createItem = (data: ItemCreateRequest): Promise<Item> => {
  return fetchApi<Item>("/api/items", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
}

export const updateItem = (
  id: number,
  data: ItemUpdateRequest
): Promise<Item> => {
  return fetchApi<Item>(`/api/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
}

export const deleteItem = (id: number): Promise<void> => {
  return fetchApi<void>(`/api/items/${id}`, { method: "DELETE" })
}

export const getVariations = (itemId: number): Promise<ProductVariation[]> => {
  return fetchApi<ProductVariation[]>(`/api/items/${itemId}/variations`, {
    method: "GET",
  })
}

export const createVariation = (
  itemId: number,
  data: VariationCreateRequest
): Promise<ProductVariation> => {
  return fetchApi<ProductVariation>(`/api/items/${itemId}/variations`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
}

export const updateVariation = (
  itemId: number,
  variationId: number,
  data: VariationCreateRequest
): Promise<ProductVariation> => {
  return fetchApi<ProductVariation>(
    `/api/items/${itemId}/variations/${variationId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }
  )
}

export const deleteVariation = (
  itemId: number,
  variationId: number
): Promise<void> => {
  return fetchApi<void>(`/api/items/${itemId}/variations/${variationId}`, {
    method: "DELETE",
  })
}
