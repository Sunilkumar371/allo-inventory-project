"use client";

import { useQuery } from "@tanstack/react-query";

import { fetcher } from "@/lib/api";

import { Product } from "@/types/product.types";

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],

    queryFn: () =>
      fetcher<Product[]>("/api/products"),
  });
}