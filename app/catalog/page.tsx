"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { productService } from "@/services/productService";
import { Product, Category } from "@/types";

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters from URL for linkable states
  const urlCategory = searchParams.get("category") || "All";
  const urlSearch = searchParams.get("search") || "";
  const urlFeatured = searchParams.get("filter") === "featured";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [, startTransition] = useTransition();

  // Load categories
  useEffect(() => {
    async function loadCats() {
      const list = await productService.getCategories();
      setCategories(list);
    }
    loadCats();
  }, []);

  // Reload products whenever filters trigger
  useEffect(() => {
    async function loadFilteredProducts() {
      setLoading(true);
      try {
        const filters: {
          category?: string;
          isFeatured?: boolean;
          search?: string;
        } = {};
        if (activeCategory !== "All") {
          filters.category = activeCategory;
        }
        if (urlFeatured) {
          filters.isFeatured = true;
        }
        if (searchQuery.trim() !== "") {
          filters.search = searchQuery;
        }
        
        let fetched = await productService.getProducts(filters);
        
        // Handle client side toggle for stock
        if (hideOutOfStock) {
          fetched = fetched.filter((p) => p.is_available);
        }

        // Apply sorting
        if (sortBy === "price-asc") {
          fetched.sort((a, b) => {
            if (a.price === null) return 1;
            if (b.price === null) return -1;
            return a.price - b.price;
          });
        } else if (sortBy === "price-desc") {
          fetched.sort((a, b) => {
            if (a.price === null) return 1;
            if (b.price === null) return -1;
            return b.price - a.price;
          });
        } // "newest" sorting is handled by default from productService

        setProducts(fetched);
      } catch (err) {
        console.error("Failed to load catalog products", err);
      } finally {
        setLoading(false);
      }
    }
    loadFilteredProducts();
  }, [activeCategory, searchQuery, sortBy, hideOutOfStock, urlFeatured]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim() === "") {
      params.delete("search");
    } else {
      params.set("search", searchQuery);
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setSortBy("newest");
    setHideOutOfStock(false);
    startTransition(() => {
      router.push("/catalog");
    });
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
              The Collection
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-brand-champagne mt-2 tracking-wide font-medium">
              Rustic Jewels Catalogue
            </h1>
            <div className="w-12 h-[1px] bg-gold-500/50 mx-auto mt-4" />
          </div>

          {/* Search, Filter & Sort Controls Grid */}
          <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 mb-10 flex flex-col gap-6">
            {/* Search Input and Sort Dropdown */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md">
                <input
                  type="text"
                  placeholder="Search by ring, silver, collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne pl-10 pr-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/40 font-sans"
                />
                <Search className="w-4 h-4 text-brand-champagne/50 absolute left-3.5 top-3.5" />
                <button type="submit" className="hidden" />
              </form>

              {/* Filters Right Block */}
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
                {/* Sort selector */}
                <div className="flex items-center gap-2 bg-brand-charcoal border border-brand-charcoal-border px-3 py-2 text-sm font-sans w-full sm:w-auto">
                  <ArrowUpDown className="w-4 h-4 text-gold-500" />
                  <select
                    value={sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "newest" | "price-asc" | "price-desc")}
                    className="bg-transparent text-brand-champagne focus:outline-none text-xs uppercase tracking-widest cursor-pointer pr-4"
                  >
                    <option value="newest" className="bg-brand-charcoal text-brand-champagne">Newest Arrivals</option>
                    <option value="price-asc" className="bg-brand-charcoal text-brand-champagne">Price: Low to High</option>
                    <option value="price-desc" className="bg-brand-charcoal text-brand-champagne">Price: High to Low</option>
                  </select>
                </div>

                {/* Hide Out of Stock Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs uppercase tracking-widest font-sans border border-brand-charcoal-border bg-brand-charcoal px-4 py-2.5 w-full sm:w-auto justify-center sm:justify-start">
                  <input
                    type="checkbox"
                    checked={hideOutOfStock}
                    onChange={(e) => setHideOutOfStock(e.target.checked)}
                    className="accent-gold-500 cursor-pointer h-3.5 w-3.5"
                  />
                  <span className="text-brand-champagne/80">Available Only</span>
                </label>

                {/* Reset button */}
                {(searchQuery || activeCategory !== "All" || hideOutOfStock || urlFeatured) && (
                  <Button variant="text" size="sm" onClick={handleClearFilters} className="text-xs">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="border-t border-brand-charcoal-border/50 pt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange("All")}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-sans border transition-all duration-200 cursor-pointer ${
                  activeCategory === "All"
                    ? "bg-gold-500 border-gold-500 text-brand-charcoal font-semibold"
                    : "bg-transparent border-brand-charcoal-border hover:border-gold-500/50 text-brand-champagne/80 hover:text-brand-champagne"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-sans border transition-all duration-200 cursor-pointer ${
                    activeCategory === cat.slug
                      ? "bg-gold-500 border-gold-500 text-brand-charcoal font-semibold"
                      : "bg-transparent border-brand-charcoal-border hover:border-gold-500/50 text-brand-champagne/80 hover:text-brand-champagne"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Filter Info message */}
          {urlFeatured && (
            <div className="bg-gold-500/10 border border-gold-500/30 p-4 mb-8 flex justify-between items-center text-sm text-gold-400 font-sans">
              <span>Showing items from the **Featured Collection** only.</span>
              <button
                onClick={handleClearFilters}
                className="underline hover:text-gold-300 font-medium cursor-pointer"
              >
                Show All Items
              </button>
            </div>
          )}

          {/* Grid Layout */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-brand-charcoal-light aspect-square w-full border border-brand-charcoal-border/50" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-brand-charcoal-border/50 bg-brand-charcoal-light flex flex-col items-center gap-4">
              <SlidersHorizontal className="w-8 h-8 text-brand-champagne/40" />
              <h3 className="font-serif text-xl text-brand-champagne font-medium">No Jewellery Found</h3>
              <p className="text-sm text-brand-champagne/60 font-sans max-w-sm leading-relaxed">
                We couldn&apos;t find any items matching your filters. Try clearing search queries or checking other categories.
              </p>
              <Button variant="secondary" size="sm" onClick={handleClearFilters} className="mt-2">
                Reset Catalogue
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function Catalog() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="flex-grow pt-32 pb-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500 border-r-2" />
          </main>
          <Footer />
        </>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
