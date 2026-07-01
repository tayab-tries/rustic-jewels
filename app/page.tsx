"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Eye } from "lucide-react";
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
          productService.getProducts(),
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
        <section className="relative min-h-[95vh] flex items-center justify-center bg-brand-charcoal overflow-hidden pt-20">
          {/* Overlay Background image with low opacity */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/80 via-brand-charcoal/90 to-brand-charcoal z-10" />
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 0.35 }}
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
              className="inline-flex items-center gap-2 border border-gold-500/25 px-4 py-1.5 glass text-gold-400 text-xs uppercase tracking-widest font-sans"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Drop</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="font-serif text-5xl md:text-7xl text-brand-champagne tracking-wide leading-tight"
            >
              {settings?.hero_title || "Shop All"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-base md:text-lg text-brand-champagne/70 max-w-2xl font-sans font-light leading-relaxed"
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
        <section className="py-24 bg-section-pattern-3 border-b border-brand-charcoal-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
                Curated Collections
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-brand-champagne mt-2 tracking-wide font-medium">
                Featured Categories
              </h2>
              <div className="w-12 h-[1px] bg-gold-500/50 mx-auto mt-4" />
            </div>

            {loadingCategories ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-brand-charcoal-light aspect-[3/4] border border-brand-charcoal-border/50" />
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
                      className="group relative aspect-[3/4] flex flex-col justify-end p-5 overflow-hidden border border-brand-charcoal-border hover:border-gold-500/50 transition-all duration-300 bg-brand-charcoal-light cursor-pointer block"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/50 to-transparent z-10 opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-brand-charcoal-light flex items-center justify-center text-brand-champagne/10 font-serif italic text-lg">
                          {cat.name}
                        </div>
                      )}
                      <div className="relative z-20">
                        <h3 className="font-serif text-lg text-brand-champagne tracking-wide group-hover:text-gold-300 transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] uppercase tracking-widest text-gold-400 font-sans mt-1 block opacity-0 group-hover:opacity-100 transition-all duration-300">
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
        <section className="py-24 bg-section-pattern-4 border-b border-brand-charcoal-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-6 mb-16">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
                  Just Added
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-brand-champagne mt-2 tracking-wide font-medium">
                  Newest Arrivals
                </h2>
              </div>
              <Link href="/catalog" className="text-sm font-sans uppercase tracking-wider text-gold-400 hover:text-gold-300 flex items-center justify-center gap-1.5 transition-colors">
                <span>View Full Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-brand-charcoal aspect-square border border-brand-charcoal-border/50 animate-pulse w-full h-96" />
                ))}
              </div>
            ) : newestProducts.length === 0 ? (
              <div className="text-center py-16 border border-brand-charcoal-border/50 bg-brand-charcoal">
                <p className="font-sans text-brand-champagne/60 text-sm">No arrivals found.</p>
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
        <section className="py-24 bg-section-pattern-1">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
                Explore the Catalogue
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-brand-champagne mt-2 tracking-wide font-medium">
                Browse All Products
              </h2>
              <div className="w-12 h-[1px] bg-gold-500/50 mx-auto mt-4" />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-brand-charcoal-light aspect-square w-full border border-brand-charcoal-border/50" />
                ))}
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-16 border border-brand-charcoal-border/50 bg-brand-charcoal-light">
                <p className="font-sans text-brand-champagne/60 text-sm">No items found.</p>
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
        <section className="py-24 bg-section-pattern-5 border-t border-brand-charcoal-border relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-6">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
              How We Connect
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-champagne tracking-wide font-medium">
              Simple Instagram Inquiries
            </h2>
            <p className="text-sm text-brand-champagne/60 max-w-xl font-sans leading-relaxed">
              We operate exclusively through Instagram. Our digital catalogue is built to showcase items in rich details. Here is how to make an inquiry:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl mt-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif text-lg font-bold">
                  1
                </div>
                <h4 className="font-serif text-brand-champagne text-base">Browse Jewellery</h4>
                <p className="text-xs text-brand-champagne/60 font-sans">Explore our catalog of custom artisan pieces and collections.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif text-lg font-bold">
                  2
                </div>
                <h4 className="font-serif text-brand-champagne text-base">Press Inquire</h4>
                <p className="text-xs text-brand-champagne/60 font-sans">Open any product page and click the prominent Instagram DM link.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif text-lg font-bold">
                  3
                </div>
                <h4 className="font-serif text-brand-champagne text-base">Chat & Order</h4>
                <p className="text-xs text-brand-champagne/60 font-sans">Discuss sizing, customize metals, and securely arrange delivery via DM.</p>
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
