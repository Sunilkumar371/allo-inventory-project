"use client";

import { useMutation } from "@tanstack/react-query";

import { Reservation } from "@/types/reservation.types";

interface CreateReservationPayload {
  inventoryId: string;

  quantity: number;
}

export function useCreateReservation() {
  return useMutation<
    Reservation,
    Error,
    CreateReservationPayload
  >({
    mutationFn: async (payload) => {
      const response = await fetch(
        "/api/reservations",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create reservation"
        );
      }

      return data;
    },
  });
}