"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Instagram } from "@/components/ui/Icons";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { productService } from "@/services/productService";
import { Product, Settings, Category } from "@/types";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setLoadingCategories(true);
      try {
        const [products, cats, config] = await Promise.all([
          productService.getListings(),
          productService.getCategories(),
          productService.getSettings()
        ]);
        
        // Featured products (up to 4)
        setFeaturedProducts(products.filter((p) => p.featured).slice(0, 4));
        
        // Newest arrivals (first 3)
        setNewestProducts(products.slice(0, 3));
        
        setCategories(cats);
        setSettings(config);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    }
    loadData();
  }, []);

// Framer motion variants for page entrance animations
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  return (
    <>
      <Navbar />
      
      <motion.main 
        initial="initial"
        animate="animate"
        variants={pageVariants}
        className="flex-grow"
      >
        {/* LUXURY HERO SECTION */}
        <section className="relative min-h-[95vh] flex items-center justify-center bg-background overflow-hidden pt-20">
          {/* Overlay Background image with low opacity */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#F8FAFD]/60 z-10" />
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 0.45 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              src={settings?.hero_image || "/bg-pattern-2.png"}
              alt="Luxury Jewellery Background"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-5xl mx-auto px-6 text-center relative z-20 flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 border border-border px-4 py-1.5 bg-[#EDF3F9] text-[#5D7899] text-xs uppercase tracking-widest font-sans"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7D96B5]" />
              <span>New Drop</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="font-serif text-5xl md:text-7xl text-text-primary tracking-wide leading-tight"
            >
              {settings?.hero_title || "Shop All"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-base md:text-lg text-text-secondary max-w-2xl font-sans font-light leading-relaxed"
            >
              {settings?.hero_subtitle || "Browse our Collection"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.65 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-4"
            >
              <Link href="/catalog">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                  Explore Catalogue
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Get In Touch
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FEATURED CATEGORIES SECTION */}
        <section className="py-24 bg-background-secondary border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-text-muted font-sans font-semibold">
                Curated Collections
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-text-primary mt-2 tracking-wide font-medium">
                Featured Categories
              </h2>
              <div className="w-12 h-[1px] bg-border mx-auto mt-4" />
            </div>

            {loadingCategories ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-background-tertiary aspect-[3/4] border border-border" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      className="group relative flex flex-col justify-end p-5 overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 bg-background-secondary cursor-pointer block aspect-[4/3]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,255,255,0.5)] to-[rgba(255,255,255,0.15)] opacity-100 group-hover:opacity-0 group-focus-within:opacity-0 group-active:opacity-0 transition-opacity duration-500 ease-in-out pointer-events-none z-10" />
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-background-secondary flex items-center justify-center text-text-muted font-serif italic text-lg">
                          {cat.name}
                        </div>
                      )}
                      <div className="relative z-20">
                        <h3 className="font-serif text-lg text-text-primary tracking-wide group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] uppercase tracking-widest text-text-secondary font-sans mt-1 block opacity-0 group-hover:opacity-100 transition-all duration-300">
                          View Gallery →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* NEWEST PRODUCTS ARRIVALS SECTION */}
        <section className="py-24 bg-section-background border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-6 mb-16">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xs uppercase tracking-widest text-text-muted font-sans font-semibold">
                  Just Added
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-text-primary mt-2 tracking-wide font-medium">
                  Newest Arrivals
                </h2>
              </div>
              <Link href="/catalog" className="text-sm font-sans uppercase tracking-wider text-primary hover:text-primary-hover flex items-center justify-center gap-1.5 transition-colors">
                <span>View Full Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-background aspect-square border border-border w-full h-96" />
                ))}
              </div>
            ) : newestProducts.length === 0 ? (
              <div className="text-center py-16 border border-border bg-background">
                <p className="font-sans text-text-muted text-sm">No arrivals found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {newestProducts.map((product) => (
                  <Card key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* BROWSE ALL PRODUCTS QUICK CATALOGUE GRID */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-text-muted font-sans font-semibold">
                Explore the Catalogue
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-text-primary mt-2 tracking-wide font-medium">
                Browse All Products
              </h2>
              <div className="w-12 h-[1px] bg-border mx-auto mt-4" />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-background-secondary aspect-square w-full border border-border" />
                ))}
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-16 border border-border bg-background-secondary">
                <p className="font-sans text-text-muted text-sm">No items found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-12 items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                  {featuredProducts.map((product) => (
                    <Card key={product.id} product={product} />
                  ))}
                </div>
                
                <Link href="/catalog" className="mt-4">
                  <Button variant="secondary" size="lg" icon={ArrowRight} iconPosition="right">
                    View Complete Catalogue
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* INSTAGRAM PURCHASE FLOW SECTION */}
        <section className="py-24 bg-background border-t border-border relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-6">
            <span className="text-xs uppercase tracking-widest text-text-muted font-sans font-semibold">
              How We Connect
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary tracking-wide font-medium">
              Simple Instagram Inquiries
            </h2>
            <p className="text-sm text-text-secondary max-w-xl font-sans leading-relaxed">
              We operate exclusively through Instagram. Our digital catalogue is built to showcase items in rich details. Here is how to make an inquiry:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl mt-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border border-border flex items-center justify-center text-primary font-serif text-lg font-bold">
                  1
                </div>
                <h4 className="font-serif text-text-primary text-base">Browse Jewellery</h4>
                <p className="text-xs text-text-secondary font-sans">Explore our catalog of custom artisan pieces and collections.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border border-border flex items-center justify-center text-primary font-serif text-lg font-bold">
                  2
                </div>
                <h4 className="font-serif text-text-primary text-base">Press Inquire</h4>
                <p className="text-xs text-text-secondary font-sans">Open any product page and click the prominent Instagram DM link.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border border-border flex items-center justify-center text-primary font-serif text-lg font-bold">
                  3
                </div>
                <h4 className="font-serif text-text-primary text-base">Chat & Order</h4>
                <p className="text-xs text-text-secondary font-sans">Discuss details, customize metals, and securely arrange delivery via DM.</p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={settings?.instagram_url || "https://instagram.com/rustic_jewels_instagram"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="lg" icon={Instagram}>
                  Visit Our Instagram
                </Button>
              </a>
            </div>
          </div>
        </section>
      </motion.main>

      <Footer />
    </>
  );
}
