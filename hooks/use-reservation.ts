"use client";

import { useQuery } from "@tanstack/react-query";

import { fetcher } from "@/lib/api";

import { Reservation } from "@/types/reservation.types";

export function useReservation(
  reservationId: string
) {
  return useQuery<Reservation>({
    queryKey: [
      "reservation",
      reservationId,
    ],

    queryFn: () =>
      fetcher<Reservation>(
        `/api/reservations/${reservationId}/details`
      ),

    refetchOnWindowFocus:false,
  });
}