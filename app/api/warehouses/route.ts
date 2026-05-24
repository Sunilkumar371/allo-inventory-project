import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { createWarehouseSchema,updateWarehouseSchema } from "@/schemas/warehouse.schema";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("GET_WAREHOUSES_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to fetch warehouses",
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
      createWarehouseSchema.parse(body);

    const warehouse =
      await prisma.warehouse.create({
        data: validatedData,
      });

    return NextResponse.json(warehouse, {
      status: 201,
    });
  } catch (error: any) {
    console.error("CREATE_WAREHOUSE_ERROR", error);

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


interface RouteParams {
  params: {
    warehouseId: string;
  };
}




