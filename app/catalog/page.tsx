"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { productService } from "@/services/productService";
import { Product, Listing, Category } from "@/types";

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
          fetched = fetched.filter((p) => p.items && p.items.some((i) => i.is_available));
        }

        // Helper to get minimum item price for a listing
        const getMinPrice = (p: Listing) => {
          const valid = (p.items || []).map((i) => i.price).filter((pr): pr is number => pr !== null && pr !== undefined && pr > 0);
          return valid.length > 0 ? Math.min(...valid) : null;
        };

        // Apply sorting
        if (sortBy === "price-asc") {
          fetched.sort((a, b) => {
            const priceA = getMinPrice(a);
            const priceB = getMinPrice(b);
            if (priceA === null) return 1;
            if (priceB === null) return -1;
            return priceA - priceB;
          });
        } else if (sortBy === "price-desc") {
          fetched.sort((a, b) => {
            const priceA = getMinPrice(a);
            const priceB = getMinPrice(b);
            if (priceA === null) return 1;
            if (priceB === null) return -1;
            return priceB - priceA;
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
      
      <main className="flex-grow pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-text-muted font-sans font-semibold">
              The Collection
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-text-primary mt-2 tracking-wide font-medium">
              Rustic Jewels Catalogue
            </h1>
            <div className="w-12 h-[1px] bg-border mx-auto mt-4" />
          </div>

          {/* Search, Filter & Sort Controls Grid */}
          <div className="bg-background-secondary border border-border p-6 mb-10 flex flex-col gap-6">
            {/* Search Input and Sort Dropdown */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md">
                <input
                  type="text"
                  placeholder="Search by ring, silver, collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-border focus:border-primary text-text-primary pl-10 pr-4 py-2.5 text-sm focus:outline-none placeholder:text-text-light font-sans"
                />
                <Search className="w-4 h-4 text-primary absolute left-3.5 top-3.5" />
                <button type="submit" className="hidden" />
              </form>

              {/* Filters Right Block */}
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
                {/* Sort selector */}
                <div className="flex items-center gap-2 bg-[#FFFFFF] border border-border px-3 py-2 text-sm font-sans w-full sm:w-auto">
                  <ArrowUpDown className="w-4 h-4 text-primary" />
                  <select
                    value={sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "newest" | "price-asc" | "price-desc")}
                    className="bg-transparent text-text-primary focus:outline-none text-xs uppercase tracking-widest cursor-pointer pr-4 border-0"
                  >
                    <option value="newest" className="bg-[#FFFFFF] text-text-primary">Newest Arrivals</option>
                    <option value="price-asc" className="bg-[#FFFFFF] text-text-primary">Price: Low to High</option>
                    <option value="price-desc" className="bg-[#FFFFFF] text-text-primary">Price: High to Low</option>
                  </select>
                </div>

                {/* Hide Out of Stock Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs uppercase tracking-widest font-sans border border-border bg-[#FFFFFF] px-4 py-2.5 w-full sm:w-auto justify-center sm:justify-start">
                  <input
                    type="checkbox"
                    checked={hideOutOfStock}
                    onChange={(e) => setHideOutOfStock(e.target.checked)}
                    className="accent-primary cursor-pointer h-3.5 w-3.5"
                  />
                  <span className="text-text-primary">Available Only</span>
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
            <div className="border-t border-border/50 pt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange("All")}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-sans border transition-all duration-200 cursor-pointer ${
                  activeCategory === "All"
                    ? "bg-primary border-primary text-text-white font-semibold"
                    : "bg-[#F5F8FC] border-[#DCE5EF] hover:bg-[#EAF0F8] hover:border-primary text-text-secondary hover:text-text-primary"
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
                      ? "bg-primary border-primary text-text-white font-semibold"
                      : "bg-[#F5F8FC] border-[#DCE5EF] hover:bg-[#EAF0F8] hover:border-primary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Filter Info message */}
          {urlFeatured && (
            <div className="bg-primary/10 border border-primary/30 p-4 mb-8 flex justify-between items-center text-sm text-primary font-sans">
              <span>Showing items from the **Featured Collection** only.</span>
              <button
                onClick={handleClearFilters}
                className="underline hover:text-primary-hover font-medium cursor-pointer"
              >
                Show All Items
              </button>
            </div>
          )}

          {/* Grid Layout */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-background-secondary aspect-square w-full border border-border" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-border bg-background-secondary flex flex-col items-center gap-4">
              <SlidersHorizontal className="w-8 h-8 text-primary" />
              <h3 className="font-serif text-xl text-text-primary font-medium">No Jewellery Found</h3>
              <p className="text-sm text-text-secondary font-sans max-w-sm leading-relaxed">
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
