export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number | null; // null represents "Price on Inquiry"
  short_description: string;
  full_description: string;
  featured_image: string;
  gallery_images: string[];
  instagram_post_url: string | null;
  featured: boolean;
  published: boolean;
  material: string | null;
  collection: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[]; // Many-to-many joined categories list
}

export interface ProductInput {
  slug: string;
  name: string;
  price: number | null;
  short_description: string;
  full_description: string;
  featured_image: string;
  gallery_images: string[];
  instagram_post_url?: string;
  featured: boolean;
  published: boolean;
  material?: string;
  collection?: string;
  is_available: boolean;
  category_ids: string[]; // List of category IDs associated during create/edit
}

export interface Settings {
  business_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  instagram_url: string;
  email: string;
}
