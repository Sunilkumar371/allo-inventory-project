import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {updateInventorySchema} from "@/schemas/inventory.schema";

type RouteParams = {
  params: Promise<{ inventoryId: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { inventoryId } = await params;

    const inventory =
      await prisma.inventory.findUnique({
        where: {
          id: inventoryId,
        },

        include: {
          product: true,
          warehouse: true,
        },
      });

    if (!inventory) {
      return NextResponse.json(
        {
          error: "Inventory not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      id: inventory.id,

      product: {
        id: inventory.product.id,
        name: inventory.product.name,
        sku: inventory.product.sku,
      },

      warehouse: {
        id: inventory.warehouse.id,
        name: inventory.warehouse.name,
      },

      totalQuantity: inventory.totalQuantity,

      reservedQuantity:
        inventory.reservedQuantity,

      availableQuantity:
        inventory.totalQuantity -
        inventory.reservedQuantity,
    });
  } catch (error) {
    console.error("GET_INVENTORY_ERROR", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { inventoryId } = await params;

    const body = await req.json();

    const validatedData =
      updateInventorySchema.parse(body);

    const existingInventory =
      await prisma.inventory.findUnique({
        where: {
          id: inventoryId,
        },
      });

    if (!existingInventory) {
      return NextResponse.json(
        {
          error: "Inventory not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      validatedData.totalQuantity !== undefined &&
      validatedData.totalQuantity <
        existingInventory.reservedQuantity
    ) {
      return NextResponse.json(
        {
          error:
            "Total quantity cannot be less than reserved quantity",
        },
        {
          status: 400,
        }
      );
    }

    const updatedInventory =
      await prisma.inventory.update({
        where: {
          id: inventoryId,
        },

        data: validatedData,

        include: {
          product: true,
          warehouse: true,
        },
      });

    return NextResponse.json(updatedInventory);
  } catch (error: any) {
    console.error("UPDATE_INVENTORY_ERROR", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { inventoryId } = await params;

    const existingInventory =
      await prisma.inventory.findUnique({
        where: {
          id: inventoryId,
        },

        include: {
          reservations: true,
        },
      });

    if (!existingInventory) {
      return NextResponse.json(
        {
          error: "Inventory not found",
        },
        {
          status: 404,
        }
      );
    }


    const hasActiveReservations =
      existingInventory.reservations.some(
        (reservation) =>
          reservation.status === "PENDING"
      );

    if (hasActiveReservations) {
      return NextResponse.json(
        {
          error:
            "Cannot delete inventory with active reservations",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.inventory.delete({
      where: {
        id: inventoryId,
      },
    });

    return NextResponse.json({
      message:
        "Inventory deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_INVENTORY_ERROR", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}