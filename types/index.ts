export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

export interface ListingItem {
  id: string;
  listing_id?: string;
  item_number: string;
  item_name?: string | null;
  price?: number | null; // null represents "Price on Inquiry"
  notes?: string | null;
  is_available: boolean;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  featured_image: string;
  gallery_images: string[];
  instagram_post_url: string | null;
  featured: boolean;
  published: boolean;
  material: string | null;
  collection: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  items: ListingItem[];
}

export interface ListingItemInput {
  id?: string;
  item_number: string;
  item_name?: string;
  price?: number | null;
  notes?: string;
  is_available: boolean;
}

export interface ListingInput {
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  featured_image: string;
  gallery_images: string[];
  instagram_post_url?: string;
  featured: boolean;
  published: boolean;
  material?: string;
  collection?: string;
  category_ids: string[];
  items: ListingItemInput[];
}

// Backwards-compatibility Aliases for migration phase
export type Product = Listing;
export type ProductInput = ListingInput;

export interface Settings {
  business_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  instagram_url: string;
  email: string;
}
