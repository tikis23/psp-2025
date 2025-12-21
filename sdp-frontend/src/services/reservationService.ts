import { fetchApi } from "./fetchClient"
import type {Reservation, ReservationCreateRequest} from "@/types.ts";

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