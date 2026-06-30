"use client";

import React, { use, useEffect, useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Inbox, ArrowLeft } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { productService } from "@/services/productService";
import { Product, Category } from "@/types";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") || searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(rawQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [, startTransition] = useTransition();

  // Load category filter tabs
  useEffect(() => {
    async function loadCats() {
      try {
        const list = await productService.getCategories();
        setCategories(list);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    }
    loadCats();
  }, []);

  // Update searchQuery input when URL changes
  useEffect(() => {
    setSearchQuery(rawQuery);
  }, [rawQuery]);

  // Load matched products
  useEffect(() => {
    async function loadSearchedProducts() {
      setLoading(true);
      try {
        const filterCat = activeCategory === "All" ? undefined : activeCategory;
        const list = await productService.getProducts({
          search: rawQuery || undefined,
          category: filterCat
        });
        setProducts(list);
      } catch (err) {
        console.error("Failed to load searched products", err);
      } finally {
        setLoading(false);
      }
    }
    loadSearchedProducts();
  }, [rawQuery, activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      } else {
        params.delete("q");
      }
      router.push(`/search?${params.toString()}`);
    });
  };

  const handleCategoryFilter = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug === "All") {
      params.delete("category");
    } else {
      params.set("category", categorySlug);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveCategory("All");
    router.push("/search");
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="flex-grow pt-32 pb-24"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/70 hover:text-gold-400 font-sans transition-colors duration-150 mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>

        {/* Title */}
        <div className="mb-10">
          <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
            Search Catalogue
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-brand-champagne mt-2 tracking-wide font-medium">
            {rawQuery ? `Search Results for "${rawQuery}"` : "Search Our Collections"}
          </h1>
          <p className="text-xs text-brand-champagne/50 font-sans mt-1.5">
            {products.length} {products.length === 1 ? "item" : "items"} found matching your search.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col gap-6 mb-12">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search by keyword, gemstone, metal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-charcoal-light border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne pl-12 pr-4 py-3.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/30 font-sans tracking-wide"
            />
            <Search className="w-4 h-4 text-brand-champagne/40 absolute left-4 top-4" />
            <button type="submit" className="hidden" />
          </form>

          {/* Categories Horizontal Filters */}
          <div className="border-t border-brand-charcoal-border/50 pt-6 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-wider text-brand-champagne/50 font-sans font-semibold mr-2">
              Filter Category:
            </span>
            <button
              onClick={() => handleCategoryFilter("All")}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans border transition-all duration-200 cursor-pointer ${
                activeCategory === "All"
                  ? "bg-gold-500 border-gold-500 text-brand-charcoal font-bold"
                  : "bg-transparent border-brand-charcoal-border hover:border-gold-500/50 text-brand-champagne/80 hover:text-brand-champagne"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.slug)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans border transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.slug
                    ? "bg-gold-500 border-gold-500 text-brand-charcoal font-bold"
                    : "bg-transparent border-brand-charcoal-border hover:border-gold-500/50 text-brand-champagne/80 hover:text-brand-champagne"
                }`}
              >
                {cat.name}
              </button>
            ))}

            {(rawQuery || activeCategory !== "All") && (
              <button
                onClick={handleClearSearch}
                className="text-[10px] uppercase tracking-widest font-sans text-red-400 hover:text-red-300 ml-auto transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-brand-charcoal-light aspect-square w-full border border-brand-charcoal-border/50" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border border-brand-charcoal-border bg-brand-charcoal-light flex flex-col items-center gap-4">
            <Inbox className="w-10 h-10 text-gold-500/30" />
            <h2 className="font-serif text-xl text-brand-champagne">No Jewellery Pieces Found</h2>
            <p className="text-xs text-brand-champagne/60 font-sans max-w-xs leading-relaxed">
              We couldn&apos;t find any item matching that search query. Try checking spelling or search for another term.
            </p>
            <Button variant="secondary" size="sm" onClick={handleClearSearch}>
              Browse All Inventory
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen">
        <Suspense fallback={
          <div className="flex-grow flex items-center justify-center pt-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500 border-r-2" />
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
