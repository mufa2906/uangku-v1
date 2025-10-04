// src/types/index.ts

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  categoryName: string | null;
  type: 'income' | 'expense';
  amount: string; // Using string to match the decimal type from the database
  note: string | null;
  date: string; // ISO string format
  createdAt: string; // ISO string format
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  type: 'income' | 'expense';
  createdAt: string; // ISO string format
}