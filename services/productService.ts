import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { Listing, ListingInput, Category, Settings, ListingItem } from "@/types";

// Seed Data for Demo Mode Categories
const SEED_CATEGORIES: Category[] = [
  { id: "c1", slug: "rings", name: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80" },
  { id: "c2", slug: "necklaces", name: "Necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80" },
  { id: "c3", slug: "bracelets", name: "Bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=80" },
  { id: "c4", slug: "earrings", name: "Earrings", image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&auto=format&fit=crop&q=80" },
  { id: "c5", slug: "brooches", name: "Brooches", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=80" }
];

// Seed Data for Demo Mode Multi-Item Listings
const SEED_LISTINGS: Listing[] = [
  {
    id: "l1",
    slug: "vintage-silver-rings-collection",
    title: "Vintage Silver Rings Collection",
    short_description: "A showcase of handcrafted sterling silver rings featuring intricate wirework and raw gemstone settings.",
    full_description: "A showcase of handcrafted sterling silver rings featuring intricate wirework and raw gemstone settings. Each numbered piece is individually crafted. Select your desired ring number below to view specific pricing and notes.",
    featured_image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample1/",
    material: "Sterling Silver & Gemstones",
    collection: "Vintage Collection",
    featured: true,
    published: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[0]],
    items: [
      { id: "li-15", item_number: "15", price: 2500, item_name: "Colombian Emerald Solitaire Ring", notes: "18K Gold Plated band", is_available: true },
      { id: "li-16", item_number: "16", price: 2300, item_name: "Vintage Filigree Band", notes: "Sterling Silver oxidized finish", is_available: true },
      { id: "li-17", item_number: "17", price: 2700, item_name: "Amethyst Crown Ring", notes: "Natural cut amethyst stone", is_available: true },
      { id: "li-18", item_number: "18", price: 2600, item_name: "Rose Quartz Eternity Ring", notes: "Hand-set claw setting", is_available: true },
      { id: "li-19", item_number: "19", price: 3100, item_name: "Black Onyx Signet Ring", notes: "Reserved", is_available: false },
      { id: "li-20", item_number: "20", price: 2900, item_name: "Turquoise Boho Ring", notes: "Native turquoise inlay", is_available: true },
      { id: "li-21", item_number: "21", price: 2400, item_name: "Minimalist Dome Ring", notes: "High polish finish", is_available: true },
      { id: "li-22", item_number: "22", price: 2800, item_name: "Moonstone Drop Ring", notes: "Rainbow moonstone cabochon", is_available: true }
    ]
  },
  {
    id: "l2",
    slug: "ethereal-pearl-chokers-showcase",
    title: "Ethereal Pearl Chokers Showcase",
    short_description: "Lustrous South Sea and freshwater pearls hand-knotted on silk thread with vintage clasps.",
    full_description: "Lustrous South Sea and freshwater pearls hand-knotted on silk thread with vintage clasps. Select your item number to inspect length options and pearl gradings.",
    featured_image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample2/",
    material: "14K Gold & Pearls",
    collection: "Classic Essentials",
    featured: true,
    published: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[1]],
    items: [
      { id: "li-31", item_number: "31", price: 18500, item_name: "AAA South Sea Pearl Strand", notes: "16 inch length with 14K clasp", is_available: true },
      { id: "li-32", item_number: "32", price: 14200, item_name: "Baroque Pearl Choker", notes: "Irregular natural freshwater pearls", is_available: true },
      { id: "li-33", item_number: "33", price: 9800, item_name: "Delicate Single Pearl Pendant", notes: "Adjustable gold chain", is_available: true }
    ]
  },
  {
    id: "l3",
    slug: "heritage-filigree-cuffs-set",
    title: "Heritage Filigree Cuffs & Bracelets",
    short_description: "Meticulously handcrafted oxidized sterling silver cuffs featuring traditional wirework patterns.",
    full_description: "Meticulously handcrafted oxidized sterling silver cuffs featuring traditional wirework patterns. Individually oxidized by master artisans.",
    featured_image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample3/",
    material: "Oxidized Sterling Silver",
    collection: "Heritage",
    featured: false,
    published: true,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[2]],
    items: [
      { id: "li-41", item_number: "41", price: 7500, item_name: "Wide Lace Filigree Cuff", notes: "Flexible fit, 925 silver", is_available: true },
      { id: "li-42", item_number: "42", price: 5800, item_name: "Slim Twisted Wire Bangle", notes: "Stackable bracelet", is_available: true }
    ]
  },
  {
    id: "l4",
    slug: "celestial-star-drop-earrings-drop",
    title: "Celestial Star & Moon Earrings Set",
    short_description: "Charming diamond-encrusted drop earrings designed in celestial star shapes.",
    full_description: "Charming diamond-encrusted drop earrings designed in celestial star shapes. Cast in warm 14K rose gold.",
    featured_image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample4/",
    material: "14K Rose Gold & Diamond",
    collection: "Stardust",
    featured: true,
    published: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[3]],
    items: [
      { id: "li-51", item_number: "51", price: 12000, item_name: "Star Dust Drop Earrings", notes: "Micro-pave diamond accents", is_available: true },
      { id: "li-52", item_number: "52", price: 9500, item_name: "Crescent Studs Pair", notes: "Solid 14K Rose Gold", is_available: true }
    ]
  }
];

// Seed Data for Demo Mode Settings
const SEED_SETTINGS: Settings = {
  business_name: "Rustic Jewels",
  hero_title: "Shop All",
  hero_subtitle: "Browse our Collection",
  hero_image: "/bg-pattern-2.png",
  instagram_url: "https://instagram.com/rustic_jewels_instagram",
  email: "contact@rusticjewels.com"
};

const LOCAL_LISTINGS_KEY = "rustic_db_listings";
const LOCAL_CATEGORIES_KEY = "rustic_db_categories";
const LOCAL_SETTINGS_KEY = "rustic_db_settings";

// Local storage helper loaders
function getLocalCategories(): Category[] {
  if (typeof window === "undefined") return SEED_CATEGORIES;
  const stored = localStorage.getItem(LOCAL_CATEGORIES_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(SEED_CATEGORIES));
    return SEED_CATEGORIES;
  }
  try { return JSON.parse(stored); } catch { return SEED_CATEGORIES; }
}

function getLocalListings(): Listing[] {
  if (typeof window === "undefined") return SEED_LISTINGS;
  const stored = localStorage.getItem(LOCAL_LISTINGS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(SEED_LISTINGS));
    return SEED_LISTINGS;
  }
  try { return JSON.parse(stored); } catch { return SEED_LISTINGS; }
}

function setLocalListings(list: Listing[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(list));
}

function getLocalSettings(): Settings {
  if (typeof window === "undefined") return SEED_SETTINGS;
  const stored = localStorage.getItem(LOCAL_SETTINGS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(SEED_SETTINGS));
    return SEED_SETTINGS;
  }
  try { return JSON.parse(stored); } catch { return SEED_SETTINGS; }
}

export const productService = {
  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) {
      return getLocalCategories();
    }
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) {
      console.error("Error loading categories", error);
      return [];
    }
    return data || [];
  },

  async createCategory(input: { name: string; slug: string; image?: string | null }): Promise<Category | null> {
    const slugValue = input.slug.toLowerCase().trim();
    if (!isSupabaseConfigured) {
      const list = getLocalCategories();
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        slug: slugValue,
        name: input.name,
        image: input.image || null,
      };
      list.push(newCat);
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(list));
      return newCat;
    }
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: input.name, slug: slugValue, image: input.image || null }])
      .select()
      .single();
    if (error) {
      console.error("Error creating category in Supabase", error);
      return null;
    }
    return data;
  },

  async updateCategory(id: string, input: Partial<{ name: string; slug: string; image?: string | null }>): Promise<Category | null> {
    if (!isSupabaseConfigured) {
      const list = getLocalCategories();
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      const updated = {
        ...list[idx],
        ...input,
        slug: input.slug ? input.slug.toLowerCase().trim() : list[idx].slug,
      };
      list[idx] = updated;
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(list));
      return updated;
    }
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug.toLowerCase().trim();
    if (input.image !== undefined) updateData.image = input.image;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Error updating category in Supabase", error);
      return null;
    }
    return data;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const list = getLocalCategories();
      const filtered = list.filter((c) => c.id !== id);
      if (filtered.length === list.length) return false;
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(filtered));
      
      // Clean up local listings mappings
      const listingsList = getLocalListings();
      let changed = false;
      const cleaned = listingsList.map((p) => {
        if (p.categories?.some((c) => c.id === id)) {
          changed = true;
          return {
            ...p,
            categories: p.categories.filter((c) => c.id !== id),
          };
        }
        return p;
      });
      if (changed) {
        setLocalListings(cleaned);
      }
      return true;
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Error deleting category", error);
      return false;
    }
    return true;
  },

  async uploadCategoryImage(file: File): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("category-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading category image to Supabase", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("category-images").getPublicUrl(filePath);
    return data.publicUrl;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<Settings> {
    if (!isSupabaseConfigured) {
      return getLocalSettings();
    }
    const { data, error } = await supabase.from("settings").select("*").eq("id", true).maybeSingle();
    if (error || !data) {
      return SEED_SETTINGS;
    }
    return data;
  },

  async updateSettings(input: Partial<Settings>): Promise<Settings | null> {
    if (!isSupabaseConfigured) {
      const current = getLocalSettings();
      const updated = { ...current, ...input };
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    }

    const { data, error } = await supabase
      .from("settings")
      .update(input)
      .eq("id", true)
      .select()
      .single();

    if (error) {
      console.error("Error updating settings", error);
      return null;
    }
    return data;
  },

  // --- LISTINGS & MULTI-ITEM OPERATIONS ---
  async getListings(filters?: {
    category?: string; // category slug
    isFeatured?: boolean;
    search?: string;
    includeDrafts?: boolean;
  }): Promise<Listing[]> {
    if (!isSupabaseConfigured) {
      let list = getLocalListings();
      
      if (!filters?.includeDrafts) {
        list = list.filter((p) => p.published);
      }
      if (filters?.category) {
        list = list.filter((p) => p.categories?.some((c) => c.slug === filters.category));
      }
      if (filters?.isFeatured !== undefined) {
        list = list.filter((p) => p.featured === filters.isFeatured);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.short_description.toLowerCase().includes(query) ||
            p.full_description.toLowerCase().includes(query) ||
            p.material?.toLowerCase().includes(query) ||
            p.collection?.toLowerCase().includes(query) ||
            p.items.some((i) => i.item_number.toLowerCase().includes(query) || i.item_name?.toLowerCase().includes(query))
        );
      }
      
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Live Supabase query for Listings with Joined Listing Items & Categories
    let query = supabase.from("listings").select(`
      *,
      listing_items (*),
      listing_categories (
        categories (
          id,
          slug,
          name,
          image
        )
      )
    `);

    if (!filters?.includeDrafts) {
      query = query.eq("published", true);
    }
    if (filters?.isFeatured !== undefined) {
      query = query.eq("featured", filters.isFeatured);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,full_description.ilike.%${filters.search}%,material.ilike.%${filters.search}%,collection.ilike.%${filters.search}%`
      );
    }

    if (filters?.category) {
      const { data: catMapping } = await supabase
        .from("listing_categories")
        .select("listing_id, categories!inner(slug)")
        .eq("categories.slug", filters.category);
      const listingIds = catMapping?.map((m: any) => m.listing_id) || [];
      query = query.in("id", listingIds);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching listings from Supabase", error);
      return [];
    }

    const formatted: Listing[] = (data || []).map((p: any) => {
      const cats = p.listing_categories
        ? p.listing_categories
            .map((pc: any) => pc.categories)
            .filter((c: any) => c !== null)
        : [];
      const itemsList = (p.listing_items || []).sort((a: any, b: any) => {
        const numA = parseInt(a.item_number, 10);
        const numB = parseInt(b.item_number, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.item_number.localeCompare(b.item_number);
      });

      const { listing_categories, listing_items, ...rest } = p;
      return {
        ...rest,
        categories: cats,
        items: itemsList
      };
    });

    return formatted;
  },

  // Backwards compatibility helper alias
  async getProducts(filters?: any): Promise<Listing[]> {
    return this.getListings(filters);
  },

  async getListingById(id: string): Promise<Listing | null> {
    if (!isSupabaseConfigured) {
      const list = getLocalListings();
      return list.find((p) => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        listing_items (*),
        listing_categories (
          categories (
            id,
            slug,
            name,
            image
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      console.error("Error loading listing detail", error);
      return null;
    }

    const cats = data.listing_categories
      ? data.listing_categories
          .map((pc: any) => pc.categories)
          .filter((c: any) => c !== null)
      : [];
    const itemsList = (data.listing_items || []).sort((a: any, b: any) => {
      const numA = parseInt(a.item_number, 10);
      const numB = parseInt(b.item_number, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.item_number.localeCompare(b.item_number);
    });

    const { listing_categories, listing_items, ...rest } = data as any;
    
    return {
      ...rest,
      categories: cats,
      items: itemsList
    };
  },

  async getProductById(id: string): Promise<Listing | null> {
    return this.getListingById(id);
  },

  async getListingBySlug(slug: string): Promise<Listing | null> {
    if (!isSupabaseConfigured) {
      const list = getLocalListings();
      return list.find((p) => p.slug === slug) || null;
    }

    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        listing_items (*),
        listing_categories (
          categories (
            id,
            slug,
            name,
            image
          )
        )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      console.error("Error loading listing detail by slug", error);
      return null;
    }

    const cats = data.listing_categories
      ? data.listing_categories
          .map((pc: any) => pc.categories)
          .filter((c: any) => c !== null)
      : [];
    const itemsList = (data.listing_items || []).sort((a: any, b: any) => {
      const numA = parseInt(a.item_number, 10);
      const numB = parseInt(b.item_number, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.item_number.localeCompare(b.item_number);
    });

    const { listing_categories, listing_items, ...rest } = data as any;
    
    return {
      ...rest,
      categories: cats,
      items: itemsList
    };
  },

  async getProductBySlug(slug: string): Promise<Listing | null> {
    return this.getListingBySlug(slug);
  },

  async createListing(input: ListingInput): Promise<Listing | null> {
    const slugValue = input.slug.toLowerCase().trim();
    
    if (!isSupabaseConfigured) {
      const list = getLocalListings();
      const allCategories = getLocalCategories();
      const assignedCats = allCategories.filter((c) => input.category_ids.includes(c.id));
      const listingId = Math.random().toString(36).substr(2, 9);
      
      const createdItems: ListingItem[] = input.items.map((item, idx) => ({
        id: item.id || `item-${listingId}-${idx}-${Date.now()}`,
        listing_id: listingId,
        item_number: item.item_number.trim(),
        item_name: item.item_name || null,
        price: item.price !== undefined ? item.price : null,
        notes: item.notes || null,
        is_available: item.is_available
      }));

      const newListing: Listing = {
        id: listingId,
        slug: slugValue,
        title: input.title,
        short_description: input.short_description,
        full_description: input.full_description,
        featured_image: input.featured_image,
        gallery_images: input.gallery_images,
        instagram_post_url: input.instagram_post_url || null,
        featured: input.featured,
        published: input.published,
        material: input.material || null,
        collection: input.collection || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: assignedCats,
        items: createdItems
      };
      
      list.push(newListing);
      setLocalListings(list);
      return newListing;
    }

    // Live Mode: Create base listing
    const listingData = {
      slug: slugValue,
      title: input.title,
      short_description: input.short_description,
      full_description: input.full_description,
      featured_image: input.featured_image,
      gallery_images: input.gallery_images,
      instagram_post_url: input.instagram_post_url || null,
      featured: input.featured,
      published: input.published,
      material: input.material || null,
      collection: input.collection || null
    };

    const { data: newListingRow, error } = await supabase
      .from("listings")
      .insert([listingData])
      .select()
      .single();

    if (error || !newListingRow) {
      console.error("Error inserting listing in Supabase", error);
      return null;
    }

    // Insert Items
    if (input.items && input.items.length > 0) {
      const itemsToInsert = input.items.map((it) => ({
        listing_id: newListingRow.id,
        item_number: it.item_number.trim(),
        item_name: it.item_name || null,
        price: it.price !== undefined ? it.price : null,
        notes: it.notes || null,
        is_available: it.is_available
      }));
      await supabase.from("listing_items").insert(itemsToInsert);
    }

    // Insert Category mappings
    if (input.category_ids && input.category_ids.length > 0) {
      const mappings = input.category_ids.map((catId) => ({
        listing_id: newListingRow.id,
        category_id: catId
      }));
      await supabase.from("listing_categories").insert(mappings);
    }

    return this.getListingById(newListingRow.id);
  },

  async createProduct(input: any): Promise<Listing | null> {
    return this.createListing({
      ...input,
      title: input.title || input.name,
      items: input.items || [
        {
          item_number: "1",
          item_name: input.name,
          price: input.price,
          is_available: input.is_available ?? true
        }
      ]
    });
  },

  async updateListing(id: string, input: Partial<ListingInput>): Promise<Listing | null> {
    if (!isSupabaseConfigured) {
      const list = getLocalListings();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) return null;
      
      const allCategories = getLocalCategories();
      const updatedCats = input.category_ids 
        ? allCategories.filter((c) => input.category_ids?.includes(c.id))
        : list[index].categories;

      const updatedItems: ListingItem[] = input.items 
        ? input.items.map((item, idx) => ({
            id: item.id || `item-${id}-${idx}-${Date.now()}`,
            listing_id: id,
            item_number: item.item_number.trim(),
            item_name: item.item_name || null,
            price: item.price !== undefined ? item.price : null,
            notes: item.notes || null,
            is_available: item.is_available
          }))
        : list[index].items;

      const listingUpdate: Partial<Listing> = {
        title: input.title !== undefined ? input.title : list[index].title,
        slug: input.slug !== undefined ? input.slug : list[index].slug,
        short_description: input.short_description !== undefined ? input.short_description : list[index].short_description,
        full_description: input.full_description !== undefined ? input.full_description : list[index].full_description,
        featured_image: input.featured_image !== undefined ? input.featured_image : list[index].featured_image,
        gallery_images: input.gallery_images !== undefined ? input.gallery_images : list[index].gallery_images,
        instagram_post_url: input.instagram_post_url !== undefined ? input.instagram_post_url : list[index].instagram_post_url,
        featured: input.featured !== undefined ? input.featured : list[index].featured,
        published: input.published !== undefined ? input.published : list[index].published,
        material: input.material !== undefined ? input.material : list[index].material,
        collection: input.collection !== undefined ? input.collection : list[index].collection,
        categories: updatedCats,
        items: updatedItems,
        updated_at: new Date().toISOString()
      };

      const updated = {
        ...list[index],
        ...listingUpdate
      } as Listing;
      
      list[index] = updated;
      setLocalListings(list);
      return updated;
    }

    // Live Mode: Update listing metadata
    const listingData: any = {};
    if (input.title !== undefined) listingData.title = input.title;
    if (input.slug !== undefined) listingData.slug = input.slug.toLowerCase().trim();
    if (input.short_description !== undefined) listingData.short_description = input.short_description;
    if (input.full_description !== undefined) listingData.full_description = input.full_description;
    if (input.featured_image !== undefined) listingData.featured_image = input.featured_image;
    if (input.gallery_images !== undefined) listingData.gallery_images = input.gallery_images;
    if (input.instagram_post_url !== undefined) listingData.instagram_post_url = input.instagram_post_url || null;
    if (input.featured !== undefined) listingData.featured = input.featured;
    if (input.published !== undefined) listingData.published = input.published;
    if (input.material !== undefined) listingData.material = input.material || null;
    if (input.collection !== undefined) listingData.collection = input.collection || null;

    const { error: listingError } = await supabase
      .from("listings")
      .update(listingData)
      .eq("id", id);

    if (listingError) {
      console.error("Error updating listing data in Supabase", listingError);
      return null;
    }

    // Update Items if passed
    if (input.items !== undefined) {
      await supabase.from("listing_items").delete().eq("listing_id", id);
      if (input.items.length > 0) {
        const itemsToInsert = input.items.map((it) => ({
          listing_id: id,
          item_number: it.item_number.trim(),
          item_name: it.item_name || null,
          price: it.price !== undefined ? it.price : null,
          notes: it.notes || null,
          is_available: it.is_available
        }));
        await supabase.from("listing_items").insert(itemsToInsert);
      }
    }

    // Update Category mappings if passed
    if (input.category_ids !== undefined) {
      await supabase.from("listing_categories").delete().eq("listing_id", id);
      if (input.category_ids.length > 0) {
        const mappings = input.category_ids.map((catId) => ({
          listing_id: id,
          category_id: catId
        }));
        await supabase.from("listing_categories").insert(mappings);
      }
    }

    return this.getListingById(id);
  },

  async updateProduct(id: string, input: any): Promise<Listing | null> {
    return this.updateListing(id, input);
  },

  async deleteListing(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const list = getLocalListings();
      const filtered = list.filter((p) => p.id !== id);
      if (filtered.length === list.length) return false;
      setLocalListings(filtered);
      return true;
    }

    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      console.error("Error deleting listing", error);
      return false;
    }
    return true;
  },

  async deleteProduct(id: string): Promise<boolean> {
    return this.deleteListing(id);
  },

  async uploadProductImage(file: File): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image to Supabase", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return data.publicUrl;
  }
};
