import { z } from "zod";

export const createReservationSchema =
  z.object({
    inventoryId: z.uuid(),

    quantity: z
      .number()
      .int()
      .positive("Quantity must be greater than 0"),
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;