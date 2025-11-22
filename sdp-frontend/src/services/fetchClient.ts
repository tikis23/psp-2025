// src/services/fetchClient.ts
import Cookies from "js-cookie"

const API_BASE_URL = import.meta.env.VITE_JAVA_SERVER_BASE_URL || "" // Fallback to empty string

export class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data: any = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export const fetchApi = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  }

  const requestOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  const method = requestOptions.method?.toUpperCase() || "GET"

  if (
    method !== "GET" &&
    method !== "HEAD" &&
    method !== "OPTIONS" &&
    endpoint !== "/api/login"
  ) {
    const csrfToken = Cookies.get("XSRF-TOKEN")
    if (csrfToken && requestOptions.headers) {
      if (!(requestOptions.headers instanceof Headers)) {
        requestOptions.headers = { ...requestOptions.headers }
      }
      ;(requestOptions.headers as Record<string, string>)["X-XSRF-TOKEN"] =
        csrfToken
    }
  }

  if (requestOptions.body) {
    const headers = requestOptions.headers as Record<string, string>
    if (!headers["Content-Type"]) {
      if (requestOptions.body instanceof URLSearchParams) {
        headers["Content-Type"] =
          "application/x-www-form-urlencoded;charset=UTF-8"
      } else if (!(requestOptions.body instanceof FormData)) {
        // Default to JSON for non-FormData/URLSearchParams bodies if not set
        headers["Content-Type"] = "application/json"
        // Ensure body is stringified if it's an object and Content-Type is JSON
        if (
          typeof requestOptions.body === "object" &&
          headers["Content-Type"] === "application/json"
        ) {
          requestOptions.body = JSON.stringify(requestOptions.body)
        }
      }
      // For FormData, let the browser set Content-Type
      if (requestOptions.body instanceof FormData) {
        delete headers["Content-Type"]
      }
    }
  }

  try {
    const response = await fetch(url, requestOptions)

    console.log("fetchApi", response)

    if (!response.ok) {
      let errorData: any = null
      const contentType = response.headers.get("content-type")
      console.log("contentType", contentType)
      try {
        if (contentType && contentType.includes("application/json")) {
          const errorJson = await response.json()
          errorData = JSON.stringify(errorJson, null, 2)
        } else {
          errorData = await response.text()
        }
      } catch (e) {
        errorData = `Failed to parse error response: ${response.statusText}`
      }
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}.`,
        response.status,
        errorData
      )
    }

    if (
      response.status === 204 ||
      response.headers.get("Content-Length") === "0"
    ) {
      return null as T
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T
    } else {
      const textData = await response.text()
      // Consider what to return for non-JSON success; maybe depends on T?
      // Returning text might break typing if T expects an object.
      // Adjust as needed for your specific API contract.
      return textData as unknown as T
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    } else if (error instanceof Error) {
      throw new ApiError(`Network error: ${error.message}`, 0, null)
    } else {
      throw new ApiError("An unexpected error occurred", 500, error)
    }
  }
}
