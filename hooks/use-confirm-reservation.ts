"use client";

import { useMutation } from "@tanstack/react-query";

export function useConfirmReservation() {
  return useMutation({
    mutationFn: async (
      reservationId: string
    ) => {
      const response = await fetch(
        `/api/reservations/${reservationId}/confirm`,
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to confirm reservation"
        );
      }

      return data;
    },
  });
}