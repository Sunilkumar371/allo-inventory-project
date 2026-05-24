import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  createReservationSchema,
} from "@/schemas/reservation.schema";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData =
      createReservationSchema.parse(body);

    const reservation =
      await prisma.$transaction(
        async (tx) => {
          

          const inventory =
            await tx.$queryRaw<
              any[]
            >`
              SELECT *
              FROM "Inventory"
              WHERE id = ${validatedData.inventoryId}
              FOR UPDATE
            `;

          const inventoryRow = inventory[0];

          if (!inventoryRow) {
            throw new Error(
              "INVENTORY_NOT_FOUND"
            );
          }

          

          const availableQuantity =
            inventoryRow.totalQuantity -
            inventoryRow.reservedQuantity;

          

          if (
            availableQuantity <
            validatedData.quantity
          ) {
            throw new Error(
              "INSUFFICIENT_STOCK"
            );
          }

          

          const updatedInventory =
            await tx.inventory.update({
              where: {
                id: validatedData.inventoryId,
              },

              data: {
                reservedQuantity: {
                  increment:
                    validatedData.quantity,
                },
              },
            });

          

          const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
          );

          const createdReservation =
            await tx.reservation.create({
              data: {
                inventoryId:
                  validatedData.inventoryId,

                quantity:
                  validatedData.quantity,

                status: "PENDING",

                expiresAt,
              },

              include: {
                inventory: {
                  include: {
                    product: true,
                    warehouse: true,
                  },
                },
              },
            });

          return createdReservation;
        },

        {
          isolationLevel: "Serializable",
        }
      );

    return NextResponse.json(
      reservation,
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "CREATE_RESERVATION_ERROR",
      error
    );

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

    if (
      error.message ===
      "INVENTORY_NOT_FOUND"
    ) {
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
      error.message ===
      "INSUFFICIENT_STOCK"
    ) {
      return NextResponse.json(
        {
          error:
            "Not enough stock available",
        },
        {
          status: 409,
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