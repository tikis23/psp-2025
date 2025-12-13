import { fetchApi } from "./fetchClient";

export type ItemType = "PRODUCT" | "SERVICE";

export interface ProductVariation {
  id: number;
  name: string;
  priceOffset: number;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  type: ItemType;
  taxRateId: string;
  variations?: ProductVariation[];
}

export const getAllItems = (): Promise<Item[]> => {
  return fetchApi<Item[]>("/api/items", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const createRandomItems = async () => {
  return;
  const item = {
    name: "Random Item " + Math.floor(Math.random() * 1000),
    price: parseFloat((Math.random() * 100).toFixed(2)),
    type: "PRODUCT",
    taxRateId: "123",
  };

  const realItem = await fetchApi<Item>("/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  for (let i = 1; i <= 3; i++) {
    if (Math.random() < 0.2) continue;

    const variation = {
      name: `Variation ${i}`,
      priceOffset: parseFloat((Math.random() * 20 - 10).toFixed(2)),
    };

    await fetchApi(`/api/items/${realItem.id}/variations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variation),
    })
  }
}