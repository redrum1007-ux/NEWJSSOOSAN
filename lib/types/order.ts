export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  status: OrderStatus;
  memo?: string;
}
