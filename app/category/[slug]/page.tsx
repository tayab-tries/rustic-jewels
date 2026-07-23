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
        className="flex-grow pt-32 pb-24 bg-background"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Navigation */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-text-secondary hover:text-primary font-sans transition-colors duration-150 mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogue</span>
          </Link>

          {/* Category Banner Header */}
          {category && (
            <div className="relative h-64 md:h-80 bg-background-secondary border border-border overflow-hidden mb-12 flex flex-col justify-end p-8 md:p-12 rounded-2xl">
              <div className="absolute inset-0 bg-[#202124]/40 z-10" />
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}
              <div className="relative z-20">
                <span className="text-xs uppercase tracking-widest text-text-white font-sans font-semibold">
                  Collection Gallery
                </span>
                <h1 className="font-serif text-4xl md:text-5xl text-text-white mt-2 tracking-wide font-medium">
                  {category.name}
                </h1>
              </div>
            </div>
          )}

          {/* Catalog grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-background-secondary aspect-square w-full border border-border rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-border bg-background-secondary flex flex-col items-center gap-4 rounded-2xl">
              <Inbox className="w-10 h-10 text-text-muted" />
              <h2 className="font-serif text-xl text-text-primary">Collection Coming Soon</h2>
              <p className="text-xs text-text-secondary font-sans max-w-xs leading-relaxed">
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
