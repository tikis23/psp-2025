import type { User } from "@/types"
import { fetchApi } from "./fetchClient"

export const createNewUser = (userData: User, password: string): Promise<void> => {
  return fetchApi<void>(
    "/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...userData,
      password,
    }),
  })
}
