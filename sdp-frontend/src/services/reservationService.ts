import { fetchApi } from "./fetchClient";
import type { Reservation, ReservationCreateRequest } from "@/types.ts";

export const getAllReservations = (merchantId: number, date?: string): Promise<Reservation[]> => {
    const params = new URLSearchParams();
    params.append("merchantId", merchantId.toString());
    if (date) {
        params.append("date", date);
    }

    return fetchApi<Reservation[]>(`/api/reservations?${params.toString()}`, {
        method: "GET"
    });
};

export const createReservation = (
    data: ReservationCreateRequest
): Promise<Reservation> => {
    return fetchApi<Reservation>("/api/reservations", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });
};

export const updateReservation = (
    id: number,
    data: ReservationCreateRequest
): Promise<Reservation> => {
    return fetchApi<Reservation>(`/api/reservations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });
};

export const cancelReservation = (id: number, merchantId: number): Promise<void> => {
    return fetchApi<void>(`/api/reservations/${id}?merchantId=${merchantId}`, {
        method: "DELETE"
    });
};