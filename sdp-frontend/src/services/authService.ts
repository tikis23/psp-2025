// src/services/authService.ts
import { fetchApi } from "./fetchClient" // Import the core fetch helper
import type { User } from "../types" // Import User type

/**
 * Fetches the currently authenticated user's information.
 * Relies on the session cookie being sent automatically by fetchApi.
 */
export const getCurrentUser = (): Promise<User> => {
  // Specify the expected return type User for fetchApi
  return fetchApi<User>("/api/me", { method: "GET" })
}

/**
 * Attempts to log the user in using email and password.
 * Sends credentials as JSON in the request body.
 */
export const userLogin = (email: string, password: string): Promise<any> => {
  const body = JSON.stringify({ email, password })

  return fetchApi<any>("/api/login", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

/**
 * Sends a request to the backend logout endpoint.
 */
export const userLogout = (): Promise<void> => {
  // Logout usually returns 2xx No Content or simple JSON
  // Use <void> or a specific type if logout returns data
  return fetchApi<void>("/api/logout", { method: "POST" })
}