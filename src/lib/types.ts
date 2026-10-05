export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  stock: number;
  quantity: number;
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export type Order = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: { id: string; name: string; unitPrice: number; quantity: number }[];
};
