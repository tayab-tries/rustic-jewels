"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Inbox } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { productService } from "@/services/productService";
import { Product, Category } from "@/types";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const [cats, items] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ category: slug })
        ]);
        
        const currentCat = cats.find((c) => c.slug === slug);
        if (currentCat) {
          setCategory(currentCat);
        }
        setProducts(items);
      } catch (err) {
        console.error("Failed to load category products", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  return (
    <>
      <Navbar />

      <motion.main
        initial="initial"
        animate="animate"
        variants={pageVariants}
        className="flex-grow pt-32 pb-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Navigation */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/70 hover:text-gold-400 font-sans transition-colors duration-150 mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogue</span>
          </Link>

          {/* Category Banner Header */}
          {category && (
            <div className="relative h-64 md:h-80 bg-brand-charcoal-light border border-brand-charcoal-border overflow-hidden mb-12 flex flex-col justify-end p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/50 to-transparent z-10" />
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              )}
              <div className="relative z-20">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-semibold">
                  Collection Gallery
                </span>
                <h1 className="font-serif text-4xl md:text-5xl text-brand-champagne mt-2 tracking-wide font-medium">
                  {category.name}
                </h1>
              </div>
            </div>
          )}

          {/* Catalog grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-brand-charcoal-light aspect-square w-full border border-brand-charcoal-border/50" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-brand-charcoal-border bg-brand-charcoal-light flex flex-col items-center gap-4">
              <Inbox className="w-10 h-10 text-gold-500/50" />
              <h2 className="font-serif text-xl text-brand-champagne">Collection Coming Soon</h2>
              <p className="text-xs text-brand-champagne/60 font-sans max-w-xs leading-relaxed">
                We are currently crafting and curating raw pieces for the {category?.name || "this"} gallery. Check back soon or contact us directly on Instagram.
              </p>
              <Link href="/catalog" className="mt-2">
                <Button variant="secondary" size="sm">
                  Browse Other Galleries
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
