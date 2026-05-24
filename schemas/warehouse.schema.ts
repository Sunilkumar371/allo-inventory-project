import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z
    .string()
    .min(2, "Warehouse name is too short")
    .max(100, "Warehouse name is too long"),

  location: z
    .string()
    .min(2, "Location is too short")
    .max(100, "Location is too long")
    .optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;

export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;