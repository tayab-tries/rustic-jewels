import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { Product, ProductInput, Category, Settings } from "@/types";

// Seed Data for Demo Mode Categories
const SEED_CATEGORIES: Category[] = [
  { id: "c1", slug: "rings", name: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80" },
  { id: "c2", slug: "necklaces", name: "Necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80" },
  { id: "c3", slug: "bracelets", name: "Bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=80" },
  { id: "c4", slug: "earrings", name: "Earrings", image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&auto=format&fit=crop&q=80" },
  { id: "c5", slug: "brooches", name: "Brooches", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=80" }
];

// Seed Data for Demo Mode Products
const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "royal-emerald-ring",
    name: "The Royal Emerald Ring",
    short_description: "An exquisite 18K yellow gold band holding a hand-selected 2.5-carat Colombian emerald.",
    full_description: "An exquisite 18K yellow gold band holding a hand-selected 2.5-carat Colombian emerald, flanked by brilliant-cut micro-pave diamonds on each side. A timeless centerpiece reflecting heritage and regal sophistication.",
    price: 3400,
    featured_image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample1/",
    material: "18K Yellow Gold",
    collection: "Heritage",
    featured: true,
    published: true,
    is_available: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[0]]
  },
  {
    id: "p2",
    slug: "south-sea-pearl-choker",
    name: "Ethereal South Sea Pearl Choker",
    short_description: "Lustrous AAA-grade white South Sea pearls hand-knotted on premium silk thread.",
    full_description: "Lustrous AAA-grade white South Sea pearls hand-knotted on premium silk thread. Secured with an elegant, custom-crafted 14K white gold clasp adorned with delicate diamonds. A perfect balance of classic grace and modern luxury.",
    price: 1850,
    featured_image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample2/",
    material: "14K White Gold & Pearl",
    collection: "Classic Essentials",
    featured: true,
    published: true,
    is_available: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[1]]
  },
  {
    id: "p3",
    slug: "filigree-silver-cuff",
    name: "Heritage Filigree Silver Cuff",
    short_description: "A meticulously handcrafted sterling silver cuff featuring traditional intricate filigree wirework.",
    full_description: "A meticulously handcrafted sterling silver cuff featuring traditional intricate filigree wirework. Individually oxidized by our master artisans to reveal the subtle depths and contours of its vintage pattern.",
    price: 750,
    featured_image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample3/",
    material: "Oxidized Sterling Silver",
    collection: "Heritage",
    featured: false,
    published: true,
    is_available: true,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[2]]
  },
  {
    id: "p4",
    slug: "star-drop-earrings",
    name: "Celestial Star Drop Earrings",
    short_description: "Charming diamond-encrusted drop earrings designed in the shape of celestial stars and crescent moons.",
    full_description: "Charming diamond-encrusted drop earrings designed in the shape of celestial stars and crescent moons. Cast in warm 14K rose gold, adding an enchanting sparkle to any evening ensemble.",
    price: 1200,
    featured_image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample4/",
    material: "14K Rose Gold & Diamond",
    collection: "Stardust",
    featured: true,
    published: true,
    is_available: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[3]]
  },
  {
    id: "p5",
    slug: "amethyst-vintage-brooch",
    name: "Aura Amethyst Vintage Brooch",
    short_description: "A masterclass in antique jewelry styling, featuring amethyst petals and silver leaves.",
    full_description: "A masterclass in antique jewelry styling, featuring delicate custom-cut purple amethyst petals surrounded by silver filigree leaves. Designed to be worn as a brooch or converted into a dramatic necklace pendant.",
    price: null,
    featured_image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
    ],
    instagram_post_url: "https://www.instagram.com/p/C_sample5/",
    material: "Aged Sterling Silver",
    collection: "Vintage Bloom",
    featured: false,
    published: false, // Visitor won't see
    is_available: false,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [SEED_CATEGORIES[4]]
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

const LOCAL_PRODUCTS_KEY = "rustic_db_products";
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

function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return SEED_PRODUCTS;
  const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  try { return JSON.parse(stored); } catch { return SEED_PRODUCTS; }
}

function setLocalProducts(list: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
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
      
      // Clean up local products mappings
      const productsList = getLocalProducts();
      let changed = false;
      const cleaned = productsList.map((p) => {
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
        setLocalProducts(cleaned);
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

  // --- PRODUCTS ---
  async getProducts(filters?: {
    category?: string; // category slug
    isFeatured?: boolean;
    isAvailable?: boolean;
    search?: string;
    includeDrafts?: boolean; // True only for authenticated admin context
  }): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      let list = getLocalProducts();
      
      // Filter out unpublished drafts by default
      if (!filters?.includeDrafts) {
        list = list.filter((p) => p.published);
      }
      if (filters?.category) {
        list = list.filter((p) => p.categories?.some((c) => c.slug === filters.category));
      }
      if (filters?.isFeatured !== undefined) {
        list = list.filter((p) => p.featured === filters.isFeatured);
      }
      if (filters?.isAvailable !== undefined) {
        list = list.filter((p) => p.is_available === filters.isAvailable);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.short_description.toLowerCase().includes(query) ||
            p.full_description.toLowerCase().includes(query) ||
            p.material?.toLowerCase().includes(query) ||
            p.collection?.toLowerCase().includes(query)
        );
      }
      
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Live Supabase query
    let query = supabase.from("products").select(`
      *,
      product_categories (
        categories (
          id,
          slug,
          name,
          image
        )
      )
    `);

    // Visibility filter (guests can only see published)
    if (!filters?.includeDrafts) {
      query = query.eq("published", true);
    }
    if (filters?.isFeatured !== undefined) {
      query = query.eq("featured", filters.isFeatured);
    }
    if (filters?.isAvailable !== undefined) {
      query = query.eq("is_available", filters.isAvailable);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,full_description.ilike.%${filters.search}%,material.ilike.%${filters.search}%,collection.ilike.%${filters.search}%`
      );
    }

    if (filters?.category) {
      // Fetch category ID matching slug to filter
      const { data: catMapping } = await supabase
        .from("product_categories")
        .select("product_id, categories!inner(slug)")
        .eq("categories.slug", filters.category);
      const productIds = catMapping?.map((m: any) => m.product_id) || [];
      query = query.in("id", productIds);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching products", error);
      return [];
    }

    // Format output relation categories
    const formatted: Product[] = (data || []).map((p: any) => {
      const cats = p.product_categories
        ? p.product_categories
            .map((pc: any) => pc.categories)
            .filter((c: any) => c !== null)
        : [];
      const { product_categories, ...rest } = p;
      return {
        ...rest,
        categories: cats
      };
    });

    return formatted;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured) {
      const list = getLocalProducts();
      return list.find((p) => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_categories (
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

    if (error) {
      console.error("Error loading product detail", error);
      return null;
    }

    if (!data) return null;

    const cats = data.product_categories
      ? data.product_categories
          .map((pc: any) => pc.categories)
          .filter((c: any) => c !== null)
      : [];
    const { product_categories, ...rest } = data as any;
    
    return {
      ...rest,
      categories: cats
    };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured) {
      const list = getLocalProducts();
      return list.find((p) => p.slug === slug) || null;
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_categories (
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

    if (error) {
      console.error("Error loading product detail by slug", error);
      return null;
    }

    if (!data) return null;

    const cats = data.product_categories
      ? data.product_categories
          .map((pc: any) => pc.categories)
          .filter((c: any) => c !== null)
      : [];
    const { product_categories, ...rest } = data as any;
    
    return {
      ...rest,
      categories: cats
    };
  },

  async createProduct(input: ProductInput): Promise<Product | null> {
    const slugValue = input.slug.toLowerCase().trim();
    
    if (!isSupabaseConfigured) {
      const list = getLocalProducts();
      const allCategories = getLocalCategories();
      const assignedCats = allCategories.filter((c) => input.category_ids.includes(c.id));
      
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        slug: slugValue,
        name: input.name,
        price: input.price,
        short_description: input.short_description,
        full_description: input.full_description,
        featured_image: input.featured_image,
        gallery_images: input.gallery_images,
        instagram_post_url: input.instagram_post_url || null,
        featured: input.featured,
        published: input.published,
        material: input.material || null,
        collection: input.collection || null,
        is_available: input.is_available,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: assignedCats
      };
      
      list.push(newProduct);
      setLocalProducts(list);
      return newProduct;
    }

    // Live Mode: Create base product
    const productData = {
      slug: slugValue,
      name: input.name,
      price: input.price,
      short_description: input.short_description,
      full_description: input.full_description,
      featured_image: input.featured_image,
      gallery_images: input.gallery_images,
      instagram_post_url: input.instagram_post_url || null,
      featured: input.featured,
      published: input.published,
      material: input.material || null,
      collection: input.collection || null,
      is_available: input.is_available
    };

    const { data: newProd, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error || !newProd) {
      console.error("Error inserting product in Supabase", error);
      return null;
    }

    // Insert Category mappings
    if (input.category_ids && input.category_ids.length > 0) {
      const mappings = input.category_ids.map((catId) => ({
        product_id: newProd.id,
        category_id: catId
      }));
      const { error: mappingError } = await supabase
        .from("product_categories")
        .insert(mappings);
        
      if (mappingError) {
        console.error("Error creating product-category mappings", mappingError);
      }
    }

    return this.getProductById(newProd.id);
  },

  async updateProduct(id: string, input: Partial<ProductInput>): Promise<Product | null> {
    if (!isSupabaseConfigured) {
      const list = getLocalProducts();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) return null;
      
      const allCategories = getLocalCategories();
      const updatedCats = input.category_ids 
        ? allCategories.filter((c) => input.category_ids?.includes(c.id))
        : list[index].categories;

      const productUpdate: Partial<Product> = {
        name: input.name,
        slug: input.slug,
        price: input.price !== undefined ? input.price : list[index].price,
        short_description: input.short_description,
        full_description: input.full_description,
        featured_image: input.featured_image,
        gallery_images: input.gallery_images,
        instagram_post_url: input.instagram_post_url !== undefined ? input.instagram_post_url : list[index].instagram_post_url,
        featured: input.featured !== undefined ? input.featured : list[index].featured,
        published: input.published !== undefined ? input.published : list[index].published,
        material: input.material !== undefined ? input.material : list[index].material,
        collection: input.collection !== undefined ? input.collection : list[index].collection,
        is_available: input.is_available !== undefined ? input.is_available : list[index].is_available,
        categories: updatedCats,
        updated_at: new Date().toISOString()
      };

      const updated = {
        ...list[index],
        ...productUpdate
      } as Product;
      
      list[index] = updated;
      setLocalProducts(list);
      return updated;
    }

    // Live Mode: Update product data
    const productData: any = {};
    if (input.name !== undefined) productData.name = input.name;
    if (input.slug !== undefined) productData.slug = input.slug.toLowerCase().trim();
    if (input.price !== undefined) productData.price = input.price;
    if (input.short_description !== undefined) productData.short_description = input.short_description;
    if (input.full_description !== undefined) productData.full_description = input.full_description;
    if (input.featured_image !== undefined) productData.featured_image = input.featured_image;
    if (input.gallery_images !== undefined) productData.gallery_images = input.gallery_images;
    if (input.instagram_post_url !== undefined) productData.instagram_post_url = input.instagram_post_url || null;
    if (input.featured !== undefined) productData.featured = input.featured;
    if (input.published !== undefined) productData.published = input.published;
    if (input.material !== undefined) productData.material = input.material || null;
    if (input.collection !== undefined) productData.collection = input.collection || null;
    if (input.is_available !== undefined) productData.is_available = input.is_available;

    const { error: productError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id);

    if (productError) {
      console.error("Error updating product data in Supabase", productError);
      return null;
    }

    // Update category mappings if explicitly passed
    if (input.category_ids !== undefined) {
      // Delete old relations
      await supabase.from("product_categories").delete().eq("product_id", id);
      // Insert new relations
      if (input.category_ids.length > 0) {
        const mappings = input.category_ids.map((catId) => ({
          product_id: id,
          category_id: catId
        }));
        await supabase.from("product_categories").insert(mappings);
      }
    }

    return this.getProductById(id);
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const list = getLocalProducts();
      const filtered = list.filter((p) => p.id !== id);
      if (filtered.length === list.length) return false;
      setLocalProducts(filtered);
      return true;
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product", error);
      return false;
    }
    return true;
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
