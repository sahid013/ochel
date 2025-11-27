export interface Category {
  id: number;
  title: string;
  title_en?: string | null;
  title_fr?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  text?: string | null;
  text_en?: string | null;
  text_fr?: string | null;
  text_it?: string | null;
  text_es?: string | null;
  order: number;
  status: 'active' | 'inactive';
  restaurant_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface Subcategory {
  id: number;
  category_id: number;
  title: string;
  title_en?: string | null;
  title_fr?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  text?: string | null;
  text_en?: string | null;
  text_fr?: string | null;
  text_it?: string | null;
  text_es?: string | null;
  order: number;
  status: 'active' | 'inactive';
  restaurant_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface MenuItem {
  id: number;
  title: string;
  title_en?: string | null;
  title_fr?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  text?: string | null;
  text_en?: string | null;
  text_fr?: string | null;
  text_it?: string | null;
  text_es?: string | null;
  description: string;
  description_en?: string | null;
  description_fr?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  image_path?: string | null;
  model_3d_url?: string | null;
  redirect_3d_url?: string | null;
  additional_image_url?: string | null;
  is_special: boolean;
  price: number;
  subcategory_id: number;
  order: number;
  status: 'active' | 'inactive';
  restaurant_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface Addon {
  id: number;
  title: string;
  title_en?: string | null;
  title_fr?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_fr?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  image_path?: string | null;
  price: number;
  category_id?: number | null;
  subcategory_id?: number | null;
  order: number;
  status: 'active' | 'inactive';
  restaurant_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface MenuData {
  category: Category;
  subcategories: Subcategory[];
  menuItems: MenuItem[];
  addons: Addon[];
}
