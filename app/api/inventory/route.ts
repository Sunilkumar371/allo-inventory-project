import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {createInventorySchema,} from "@/schemas/inventory.schema";

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
    
    const formattedInventory = inventory.map((item) => ({
      id: item.id,

      product: {
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
      },

      warehouse: {
        id: item.warehouse.id,
        name: item.warehouse.name,
      },

      totalQuantity: item.totalQuantity,

      reservedQuantity: item.reservedQuantity,

      availableQuantity:
        item.totalQuantity - item.reservedQuantity,
    }));

    return NextResponse.json(formattedInventory);
  } catch (error) {
    console.error("GET_INVENTORY_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to fetch inventory",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData =
      createInventorySchema.parse(body);

    // Verify product exists
    const product =
      await prisma.product.findUnique({
        where: {
          id: validatedData.productId,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    // Verify warehouse exists
    const warehouse =
      await prisma.warehouse.findUnique({
        where: {
          id: validatedData.warehouseId,
        },
      });

    if (!warehouse) {
      return NextResponse.json(
        {
          error: "Warehouse not found",
        },
        {
          status: 404,
        }
      );
    }

    // Prevent duplicate inventory
    const existingInventory =
      await prisma.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId: validatedData.productId,
            warehouseId:
              validatedData.warehouseId,
          },
        },
      });

    if (existingInventory) {
      return NextResponse.json(
        {
          error:
            "Inventory already exists for this product and warehouse",
        },
        {
          status: 409,
        }
      );
    }

    const inventory =
      await prisma.inventory.create({
        data: validatedData,

        include: {
          product: true,
          warehouse: true,
        },
      });

    return NextResponse.json(inventory, {
      status: 201,
    });
  } catch (error: any) {
    console.error("CREATE_INVENTORY_ERROR", error);

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