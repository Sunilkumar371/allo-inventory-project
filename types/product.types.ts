export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  createdAt: string;
}
export interface Product {
  id: string;

  name: string;

  sku: string;

  inventories: {
    inventoryId: string;

    warehouse: {
      id: string;
      name: string;
      location?: string | null;
    };

    totalQuantity: number;

    reservedQuantity: number;

    availableQuantity: number;
  }[];
}