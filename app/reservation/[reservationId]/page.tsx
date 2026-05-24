// "use client";
// import { useEffect, useState } from "react";

// import {
//   useParams,
//   useRouter,
// } from "next/navigation";

// import { toast } from "sonner";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Badge } from "@/components/ui/badge";

// import { Button } from "@/components/ui/button";

// import { useReservation } from "@/hooks/use-reservation";

// import { useConfirmReservation } from "@/hooks/use-confirm-reservation";

// import { useReleaseReservation } from "@/hooks/use-release-reservation";

// import { queryClient } from "@/providers/queryProvider";

// export default function ReservationPage() {
//   const params = useParams();

//   const router = useRouter();

//   const reservationId =
//     params.reservationId as string;

//   const confirmMutation =
//     useConfirmReservation();

//   const releaseMutation =
//     useReleaseReservation();

//   const {
//     data: reservation,
//     isLoading,
//     isError,
//   } = useReservation(
//     reservationId
//   );

//   const [remainingTime, setRemainingTime] =
//     useState(0);

//   useEffect(() => {
//     if (!reservation) return;

//     const updateTimer = () => {
//       const expiryTime = new Date(
//         reservation.expiresAt
//       ).getTime();

//       const secondsRemaining = Math.max(
//         0,
//         Math.floor(
//           (expiryTime - Date.now()) /
//             1000
//         )
//       );

//       setRemainingTime(
//         secondsRemaining
//       );
//     };

//     updateTimer();

//     const interval = setInterval(
//       updateTimer,
//       1000
//     );

//     return () =>
//       clearInterval(interval);
//   }, [reservation]);

//   const minutes = Math.floor(
//     remainingTime / 60
//   );

//   const seconds = remainingTime % 60;

//   if (isLoading) {
//     return (
//       <main className="container mx-auto py-16">
//         <div className="flex items-center justify-center">
//           <p className="text-muted-foreground">
//             Loading reservation...
//           </p>
//         </div>
//       </main>
//     );
//   }

//   if (isError || !reservation) {
//     return (
//       <main className="container mx-auto py-16">
//         <div className="flex items-center justify-center">
//           <p className="text-red-500">
//             Reservation not found
//           </p>
//         </div>
//       </main>
//     );
//   }

//   const handleConfirm = () => {
//     confirmMutation.mutate(
//       reservationId,
//       {
//         onSuccess: () => {
//           toast.success(
//             "Purchase confirmed"
//           );

//           queryClient.invalidateQueries({
//             queryKey: ["products"],
//           });

//           router.push("/");
//         },

//         onError: (error) => {
//           toast.error(error.message);
//         },
//       }
//     );
//   };

//   const handleCancel = () => {
//     releaseMutation.mutate(
//       reservationId,
//       {
//         onSuccess: () => {
//           toast.success(
//             "Reservation cancelled"
//           );

//           queryClient.invalidateQueries({
//             queryKey: ["products"],
//           });

//           router.push("/");
//         },

//         onError: (error) => {
//           toast.error(error.message);
//         },
//       }
//     );
//   };

//   return (
//     <main className="container mx-auto max-w-3xl py-16">
//       <Card className="border-2 shadow-sm">
//         <CardHeader className="space-y-4">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-2xl">
//               Reservation Details
//             </CardTitle>

//             <Badge
//               variant={
//                 reservation.status ===
//                 "CONFIRMED"
//                   ? "default"
//                   : reservation.status ===
//                       "PENDING"
//                     ? "secondary"
//                     : "destructive"
//               }
//             >
//               {reservation.status}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <div className="space-y-2">
//             <h2 className="text-3xl font-bold tracking-tight">
//               {
//                 reservation.inventory
//                   .product.name
//               }
//             </h2>

//             <p className="text-muted-foreground">
//               SKU:{" "}
//               {
//                 reservation.inventory
//                   .product.sku
//               }
//             </p>
//           </div>

//           <div className="rounded-xl border p-5">
//             <h3 className="mb-2 font-medium">
//               Warehouse
//             </h3>

//             <p className="font-medium">
//               {
//                 reservation.inventory
//                   .warehouse.name
//               }
//             </p>

//             <p className="text-sm text-muted-foreground">
//               {
//                 reservation.inventory
//                   .warehouse.location
//               }
//             </p>
//           </div>

//           <div className="rounded-xl border p-5">
//             <h3 className="mb-2 font-medium">
//               Reserved Quantity
//             </h3>

//             <p className="text-4xl font-bold">
//               {reservation.quantity}
//             </p>
//           </div>

//           <div className="rounded-xl border bg-muted/40 p-8 text-center">
//             <h3 className="mb-4 text-sm font-medium text-muted-foreground">
//               Time Remaining
//             </h3>

//             <p className="font-mono text-6xl font-bold tracking-tight">
//               {minutes}:
//               {seconds
//                 .toString()
//                 .padStart(2, "0")}
//             </p>
//           </div>

//           {remainingTime <= 0 &&
//             reservation.status ===
//               "PENDING" && (
//               <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
//                 Reservation expired
//               </div>
//             )}

//           <div className="flex gap-4 pt-2">
//             <Button
//               size="lg"
//               className="flex-1"
//               onClick={handleConfirm}
//               disabled={
//                 reservation.status !==
//                   "PENDING" ||
//                 remainingTime <= 0 ||
//                 confirmMutation.isPending
//               }
//             >
//               {confirmMutation.isPending
//                 ? "Confirming..."
//                 : "Confirm Purchase"}
//             </Button>

//             <Button
//               size="lg"
//               variant="outline"
//               className="flex-1"
//               onClick={handleCancel}
//               disabled={
//                 reservation.status !==
//                   "PENDING" ||
//                 releaseMutation.isPending
//               }
//             >
//               {releaseMutation.isPending
//                 ? "Cancelling..."
//                 : "Cancel"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </main>
//   );
// }


"use client";
import { useEffect, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import { useReservation } from "@/hooks/use-reservation";

import { useConfirmReservation } from "@/hooks/use-confirm-reservation";

import { useReleaseReservation } from "@/hooks/use-release-reservation";

import { queryClient } from "@/providers/queryProvider";

export default function ReservationPage() {
  const params = useParams();

  const router = useRouter();

  const reservationId =
    params.reservationId as string;

  const confirmMutation =
    useConfirmReservation();

  const releaseMutation =
    useReleaseReservation();

  const {
    data: reservation,
    isLoading,
    isError,
  } = useReservation(reservationId);

  const [remainingTime, setRemainingTime] =
    useState(0);

  useEffect(() => {
    if (!reservation) return;

    const updateTimer = () => {
      const expiryTime = new Date(
        reservation.expiresAt
      ).getTime();

      const secondsRemaining = Math.max(
        0,
        Math.floor((expiryTime - Date.now()) / 1000)
      );

      setRemainingTime(secondsRemaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const isExpired =
    remainingTime <= 0 && reservation?.status === "PENDING";
  const isUrgent =
    remainingTime > 0 && remainingTime <= 60;

  if (isLoading) {
    return (
      <main className="container mx-auto py-16">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading reservation...</p>
        </div>
      </main>
    );
  }

  if (isError || !reservation) {
    return (
      <main className="container mx-auto py-16">
        <div className="flex items-center justify-center">
          <p className="text-destructive">Reservation not found</p>
        </div>
      </main>
    );
  }

  const handleConfirm = () => {
    confirmMutation.mutate(reservationId, {
      onSuccess: () => {
        toast.success("Purchase confirmed");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleCancel = () => {
    releaseMutation.mutate(reservationId, {
      onSuccess: () => {
        toast.success("Reservation cancelled");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const statusVariant =
    reservation.status === "CONFIRMED"
      ? "default"
      : reservation.status === "PENDING"
        ? "secondary"
        : "destructive";

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Order summary</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
          Complete your purchase
        </h1>
      </div>

      <Card className="overflow-hidden shadow-sm">
        {/* Status bar at top */}
        <div
          className={`flex items-center justify-between border-b px-6 py-3 ${
            reservation.status === "CONFIRMED"
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : reservation.status === "RELEASED" || isExpired
                ? "bg-red-50 dark:bg-red-950/30"
                : isUrgent
                  ? "bg-amber-50 dark:bg-amber-950/30"
                  : "bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                reservation.status === "CONFIRMED"
                  ? "bg-emerald-500"
                  : reservation.status === "RELEASED" || isExpired
                    ? "bg-destructive"
                    : isUrgent
                      ? "animate-pulse bg-amber-500"
                      : "bg-blue-500"
              }`}
            />
            <span className="text-sm font-medium">Reservation</span>
            <span className="font-mono text-xs text-muted-foreground">
              #{reservationId.slice(-8).toUpperCase()}
            </span>
          </div>
          <Badge variant={statusVariant}>{reservation.status}</Badge>
        </div>

        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-xl">
            {reservation.inventory.product.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            SKU: {reservation.inventory.product.sku}
          </p>
        </CardHeader>

        <CardContent className="space-y-5 pb-6">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Warehouse
              </p>
              <p className="font-semibold leading-tight">
                {reservation.inventory.warehouse.name}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {reservation.inventory.warehouse.location}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quantity
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {reservation.quantity}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                unit{reservation.quantity !== 1 ? "s" : ""} reserved
              </p>
            </div>
          </div>

          <Separator />

          {/* Countdown */}
          <div
            className={`rounded-xl border p-6 text-center transition-colors ${
              isExpired
                ? "border-destructive/40 bg-destructive/5"
                : isUrgent
                  ? "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20"
                  : "border-border bg-muted/20"
            }`}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {isExpired ? "Reservation expired" : "Time remaining"}
            </p>
            <p
              className={`font-mono text-6xl font-bold tabular-nums tracking-tight ${
                isExpired
                  ? "text-destructive"
                  : isUrgent
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-foreground"
              }`}
            >
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
            {isUrgent && !isExpired && (
              <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                Hurry — your hold expires soon
              </p>
            )}
          </div>

          {/* Expired alert */}
          {isExpired && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-sm font-medium text-destructive">
                This reservation has expired. The held stock has been released.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              size="lg"
              className="flex-1 hover:cursor-pointer text-white bg-green-500"
              onClick={handleConfirm}
              disabled={
                reservation.status !== "PENDING" ||
                remainingTime <= 0 ||
                confirmMutation.isPending
              }
            >
              {confirmMutation.isPending ? "Confirming..." : "Confirm Purchase"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="flex-1 hover:cursor-pointer bg-red-500 text-white"
              onClick={handleCancel}
              disabled={
                reservation.status !== "PENDING" || releaseMutation.isPending
              }
            >
              {releaseMutation.isPending ? "Cancelling..." : "Cancel"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}