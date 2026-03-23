export interface Review {
  id: string;
  productId: string;
  userId: string | null;
  userName: string;
  content: string;
  rating: number;
  createdAt: string;
  isAdminReview?: boolean;
}
