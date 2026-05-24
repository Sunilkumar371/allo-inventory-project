"use client";

import { useMutation } from "@tanstack/react-query";

export function useReleaseReservation() {
  return useMutation({
    mutationFn: async (
      reservationId: string
    ) => {
      const response = await fetch(
        `/api/reservations/${reservationId}/release`,
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to cancel reservation"
        );
      }

      return data;
    },
  });
}