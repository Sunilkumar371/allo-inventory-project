import { z } from "zod";

export const createInventorySchema = z.object({
  productId: z.uuid(),

  warehouseId: z.uuid(),

  totalQuantity: z
    .number()
    .int()
    .min(0, "Quantity cannot be negative"),
});

export const updateInventorySchema =
  createInventorySchema.partial();

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;