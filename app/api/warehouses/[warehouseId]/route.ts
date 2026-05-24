import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { createWarehouseSchema,updateWarehouseSchema } from "@/schemas/warehouse.schema";

type RouteParams = {
  params: Promise<{ warehouseId: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { warehouseId } = await params;

    const warehouse =
      await prisma.warehouse.findUnique({
        where: {
          id: warehouseId,
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

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("GET_WAREHOUSE_ERROR", error);

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
    const { warehouseId } = await params;

    const body = await req.json();

    const validatedData =
      updateWarehouseSchema.parse(body);

    const existingWarehouse =
      await prisma.warehouse.findUnique({
        where: {
          id: warehouseId,
        },
      });

    if (!existingWarehouse) {
      return NextResponse.json(
        {
          error: "Warehouse not found",
        },
        {
          status: 404,
        }
      );
    }

    const updatedWarehouse =
      await prisma.warehouse.update({
        where: {
          id: warehouseId,
        },
        data: validatedData,
      });

    return NextResponse.json(updatedWarehouse);
  } catch (error: any) {
    console.error("UPDATE_WAREHOUSE_ERROR", error);

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
    const { warehouseId } = await params;
    console.log("warehouseid" ,warehouseId)
    const existingWarehouse =
      await prisma.warehouse.findUnique({
        where: {
          id:warehouseId,
        },
      });

    if (!existingWarehouse) {
      return NextResponse.json(
        {
          error: "Warehouse not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.warehouse.delete({
      where: {
        id:warehouseId,
      },
    });

    return NextResponse.json({
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_WAREHOUSE_ERROR", error);

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

