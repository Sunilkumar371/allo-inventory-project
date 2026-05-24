import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {ProductResponse} from "@/types/product.types"
import { createProductSchema } from "@/schemas/product.schema";
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include:{
                inventories:{
                    include:{
                        warehouse:true
                    }
                }
            }
        });

        const formattedProducts = products.map((product) => ({
            id : product.id,
            name:product.name,
            sku:product.sku,
            
            inventories: product.inventories.map((inventory) => ({
                inventoryId : inventory.id,

                warehouse:{
                    id: inventory.warehouse.id,
                    name:inventory.warehouse.name,
                    location:inventory.warehouse.location
                },

                totalQuantity : inventory.totalQuantity,
                reservedQuantity : inventory.reservedQuantity,

                availableQuantity: inventory.totalQuantity - inventory.reservedQuantity
            })),
        }));

        return NextResponse.json(formattedProducts)
    } catch (error) {
        console.error("GET_PRODUCTS_ERROR",error)

        return NextResponse.json(
            {
                error:"Failed to fetch products"
            },
            {
                status:500
            }
        )
    }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData =
      createProductSchema.parse(body);

    // Check existing SKU
    const existingProduct =
      await prisma.product.findUnique({
        where: {
          sku: validatedData.sku,
        },
      });

    if (existingProduct) {
      return NextResponse.json(
        {
          error: "SKU already exists",
        },
        {
          status: 409,
        }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: validatedData,
    });

    return NextResponse.json(product, {
      status: 201,
    });
  } catch (error: any) {
    console.error("CREATE_PRODUCT_ERROR", error);

    // Zod validation error
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