import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    reservationId: string;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { reservationId } = await params;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: reservationId,
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

    if (!reservation) {
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

    return NextResponse.json(
      reservation
    );
  } catch (error) {
    console.error(
      "GET_RESERVATION_ERROR",
      error
    );

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