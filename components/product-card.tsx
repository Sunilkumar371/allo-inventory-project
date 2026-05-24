"use client";

import { Product } from "@/types/product.types";
import { useRouter } from "next/navigation";

import { useCreateReservation } from "@/hooks/use-create-reservation";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const router = useRouter();

  const { mutate, isPending } = useCreateReservation();
  const handleReserve = (inventoryId: string) => {
    mutate(
      {
        inventoryId,
        quantity: 1,
      },

      {
        onSuccess: (reservation) => {
          toast.success("Reservation created");

          router.push(`/reservation/${reservation.id}`);
        },

        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{product.name}</CardTitle>

          <Badge variant="secondary">{product.sku}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {product.inventories.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            No inventory available
          </div>
        ) : (
          product.inventories.map((inventory) => (
            <div key={inventory.inventoryId} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{inventory.warehouse.name}</h3>

                  <p className="text-sm text-muted-foreground">
                    {inventory.warehouse.location}
                  </p>
                </div>

                <Badge>Available: {inventory.availableQuantity}</Badge>
              </div>

              <Button
                className="mt-4 w-full text-white bg-green-500 hover:cursor-pointer"
                disabled={inventory.availableQuantity <= 0 || isPending}
                onClick={() => handleReserve(inventory.inventoryId)}
              >
                {isPending ? "Reserving..." : "Reserve"}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
