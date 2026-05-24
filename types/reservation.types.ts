export interface Reservation {
  id: string;

  quantity: number;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "RELEASED"
    | "EXPIRED";

  expiresAt: string;

  createdAt: string;

  inventory: {
    id: string;

    product: {
      id: string;
      name: string;
      sku: string;
    };

    warehouse: {
      id: string;
      name: string;
      location?: string | null;
    };
  };
}