import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();


    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          status: "PENDING",

          expiresAt: {
            lt: now,
          },
        },
      });

    let releasedCount = 0;


    for (const reservation of expiredReservations) {
      await prisma.$transaction(
        async (tx) => {
          // Lock reservation row

          const reservations =
            await tx.$queryRaw<any[]>`
              SELECT *
              FROM "Reservation"
              WHERE id = ${reservation.id}
              FOR UPDATE
            `;

          const lockedReservation =
            reservations[0];

          

          if (
            !lockedReservation ||
            lockedReservation.status !==
              "PENDING"
          ) {
            return;
          }

          

          const inventories =
            await tx.$queryRaw<any[]>`
              SELECT *
              FROM "Inventory"
              WHERE id = ${lockedReservation.inventoryId}
              FOR UPDATE
            `;

          const inventory =
            inventories[0];

          if (!inventory) {
            return;
          }

          

          await tx.inventory.update({
            where: {
              id: inventory.id,
            },

            data: {
              reservedQuantity: {
                decrement:
                  lockedReservation.quantity,
              },
            },
          });

          

          await tx.reservation.update({
            where: {
              id: lockedReservation.id,
            },

            data: {
              status: "EXPIRED",
            },
          });

          releasedCount++;
        });
    }

    return NextResponse.json({
      success: true,

      expiredReservationsFound:
        expiredReservations.length,

      releasedReservations:
        releasedCount,
    });
  } catch (error) {
    console.error(
      "RELEASE_EXPIRED_RESERVATIONS_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to release expired reservations",
      },
      {
        status: 500,
      }
    );
  }
}