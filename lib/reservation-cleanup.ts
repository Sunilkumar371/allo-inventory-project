import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanupExpiredReservations() {
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

  for (const reservation of expiredReservations) {
    await prisma.$transaction(
      async (tx) => {
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
      }
    );
  }
}