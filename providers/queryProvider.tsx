// "use client";

// import {
//   QueryClient,
//   QueryClientProvider,
// } from "@tanstack/react-query";

// import { ReactNode, useState } from "react";

// interface Props {
//   children: ReactNode;
// }

// export function QueryProvider({
//   children,
// }: Props) {
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 1000 * 30,
//             refetchOnWindowFocus: false,
//           },
//         },
//       })
//   );

//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//     </QueryClientProvider>
//   );
// }

"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
}

export const queryClient =
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
      },
    },
  });

export function QueryProvider({
  children,
}: Props) {
  const [client] = useState(
    () => queryClient
  );

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}