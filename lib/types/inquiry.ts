export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  isPrivate: boolean;
  userId?: string;
}
