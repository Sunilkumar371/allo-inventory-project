import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name is too long"),

  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU is too long")
    .transform((value) => value.toUpperCase()),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;