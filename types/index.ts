export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  discount_percentage?: number;
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
  bank_name?: string | null;
  account_title?: string | null;
  account_number?: string | null;
  iban?: string | null;
  easypaisa_number?: string | null;
  jazzcash_number?: string | null;
  payment_instructions?: string | null;
}

export type OrderStatus =
  | "Pending Payment"
  | "Payment Under Review"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  listing_id: string;
  item_number: string;
  price: number;
  quantity: number;
  listing_title?: string;
  listing_image?: string;
}

export interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  phone: string;
  instagram_username?: string | null;
  email?: string | null;
  shipping_address: string;
  city: string;
  notes?: string | null;
  subtotal: number;
  total: number;
  status: OrderStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CartItem {
  listing: Listing;
  selectedItem: ListingItem;
  price: number;
  quantity: number;
}

export function getListingItemPrice(
  item: { price?: number | null },
  categories?: { discount_percentage?: number }[]
): number | null {
  if (!item.price) return null;
  if (!categories || categories.length === 0) return Number(item.price);
  
  // Find highest active category discount
  const maxDiscount = Math.max(
    ...categories.map((c) => c.discount_percentage || 0),
    0
  );

  if (maxDiscount > 0) {
    return Math.round(Number(item.price) * (1 - maxDiscount / 100));
  }
  return Number(item.price);
}

