"use client";

import { ProductCard } from "@/components/product-card";

import { useProducts } from "@/hooks/use-products";

export default function Home() {
  const {
    data: products,
    isLoading,
    isError,
  } = useProducts();

  if (isLoading) {
    return (
      <main className="container mx-auto py-10">
        <p>Loading products...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto py-10">
        <p>
          Failed to load products
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Inventory System
        </h1>

        <p className="mt-2 text-muted-foreground">
          Multi-warehouse inventory
          reservation platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </main>
  );
}