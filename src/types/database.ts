export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type AppRole = 'admin' | 'moderator' | 'user';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  affiliate_url: string | null;
  affiliate_source: string | null;
  category_id: string | null;
  specs: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  difficulty: DifficultyLevel;
  estimated_cost: number | null;
  estimated_time: string | null;
  category_id: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface ProjectPart {
  id: string;
  project_id: string;
  product_id: string;
  quantity: number;
  notes: string | null;
  product?: Product;
}

export interface Laptop {
  id: string;
  name: string;
  brand: string;
  image_url: string | null;
  price: number | null;
  affiliate_url: string | null;
  screen_size: number | null;
  cpu: string | null;
  gpu: string | null;
  ram: number | null;
  storage: string | null;
  use_cases: string[] | null;
  specs: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  project_id: string | null;
  laptop_id: string | null;
  created_at: string;
}
