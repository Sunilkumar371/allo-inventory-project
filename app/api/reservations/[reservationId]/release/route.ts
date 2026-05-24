import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    reservationId: string;
  }>;
}
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { reservationId } = await params;

    const result =
      await prisma.$transaction(
        async (tx) => {
          

          const reservations =
            await tx.$queryRaw<any[]>`
              SELECT *
              FROM "Reservation"
              WHERE id = ${reservationId}
              FOR UPDATE
            `;

          const reservation =
            reservations[0];

          if (!reservation) {
            throw new Error(
              "RESERVATION_NOT_FOUND"
            );
          }

          

          if (
            reservation.status !==
            "PENDING"
          ) {
            throw new Error(
              "INVALID_RESERVATION_STATUS"
            );
          }

          

          const inventories =
            await tx.$queryRaw<any[]>`
              SELECT *
              FROM "Inventory"
              WHERE id = ${reservation.inventoryId}
              FOR UPDATE
            `;

          const inventory =
            inventories[0];

          if (!inventory) {
            throw new Error(
              "INVENTORY_NOT_FOUND"
            );
          }

          

          await tx.inventory.update({
            where: {
              id: inventory.id,
            },

            data: {
              reservedQuantity: {
                decrement:
                  reservation.quantity,
              },
            },
          });

          

          const releasedReservation =
            await tx.reservation.update({
              where: {
                id: reservationId,
              },

              data: {
                status: "RELEASED",
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

          return releasedReservation;
        },

        {
          isolationLevel: "Serializable",
        }
      );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(
      "RELEASE_RESERVATION_ERROR",
      error
    );

    if (
      error.message ===
      "RESERVATION_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      error.message ===
      "INVALID_RESERVATION_STATUS"
    ) {
      return NextResponse.json(
        {
          error:
            "Reservation cannot be released",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}