// Типы данных приложения SEO-Генератор

export type Platform = 'wildberries' | 'ozon' | 'etsy';

export interface Description {
  text: string;
}

export interface Generation {
  id: string;
  user_id: string | null;
  product_name: string;
  keywords: string[];
  platform: Platform;
  descriptions: Description[];
  ip_address?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  generation_id: string;
  description_index: number;
  created_at: string;
  generation?: Generation;
}

export interface Profile {
  id: string;
  is_premium: boolean;
  balance: number; // Количество купленных разовых генераций
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface GenerateRequest {
  productName: string;
  keywords: string[];
  platform: Platform;
}

export interface GenerateResponse {
  success: boolean;
  data?: {
    id: string;
    descriptions: Description[];
  };
  error?: string;
  remaining?: number;
}

export interface HistoryResponse {
  data: Generation[];
  total: number;
}

export interface MeResponse {
  user: User | null;
  profile: { is_premium: boolean };
  remaining: number;
}

export interface GenerationFormData {
  product_name: string;
  keywords: string;
  platform: Platform;
}
