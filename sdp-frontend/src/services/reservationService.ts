import { fetchApi } from "./fetchClient"

export interface Reservation {
    id: number
    serviceId: number
    serviceName: string
    customerName: string
    customerContact: string
    appointmentTime: string
    status: "CONFIRMED" | "CANCELLED"
}

export interface ReservationCreateRequest {
    serviceId: number
    customerName: string
    customerContact: string
    appointmentTime: string
}

export const getAllReservations = (date?: string): Promise<Reservation[]> => {
    const query = date ? `?date=${date}` : "";
    return fetchApi<Reservation[]>(`/api/reservations${query}`, { method: "GET" })
}

export const createReservation = (
    data: ReservationCreateRequest
): Promise<Reservation> => {
    return fetchApi<Reservation>("/api/reservations", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    })
}

export const updateReservation = (
    id: number,
    data: ReservationCreateRequest
): Promise<Reservation> => {
    return fetchApi<Reservation>(`/api/reservations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    })
}

export const cancelReservation = (id: number): Promise<void> => {
    return fetchApi<void>(`/api/reservations/${id}`, { method: "DELETE" })
}