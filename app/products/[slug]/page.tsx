"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, Info, ChevronLeft, ChevronRight, Share2, Check, ExternalLink } from "lucide-react";
import { Instagram } from "@/components/ui/Icons";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { productService } from "@/services/productService";
import { Product, Settings } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Fallback Loader Spinner icon placeholder
const Loader2 = ({ className }: { className?: string }) => (
  <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500 border-r-2 ${className}`} />
);

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [item, config] = await Promise.all([
          productService.getProductBySlug(slug),
          productService.getSettings()
        ]);
        
        setProduct(item);
        setSettings(config);
        
        if (item) {
          const catSlugs = item.categories?.map((c) => c.slug) || [];
          const allItems = await productService.getProducts();
          const related = allItems
            .filter((p) => p.id !== item.id && p.categories?.some((c) => catSlugs.includes(c.slug)))
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Failed to load product by slug", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: product.short_description,
      url: window.location.href
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Web share failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        console.error("Copy link failed", err);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-24 flex items-center justify-center bg-brand-charcoal min-h-screen">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </main>
        <Footer />
      </>
    );
  }


  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 text-center min-h-[70vh] flex flex-col justify-center items-center">
          <div className="flex flex-col items-center gap-4 py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light w-full max-w-xl">
            <AlertCircle className="w-12 h-12 text-gold-500" />
            <h2 className="font-serif text-2xl text-brand-champagne">Jewellery Piece Not Found</h2>
            <p className="text-sm text-brand-champagne/60 font-sans max-w-md">
              The item you are looking for might have been sold, removed, or the slug link is incorrect.
            </p>
            <Link href="/catalog" className="mt-2">
              <Button variant="secondary" size="sm">
                Back to Catalogue
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return "Price on Inquiry";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imagesList = [product.featured_image, ...(product.gallery_images || [])];
  
  // inquiry message prefill
  const inquiryMessage = `Hi! I am inquiring about "${product.name}" (Slug: ${product.slug}) listed in your catalogue. Is this piece available?`;
  const instagramInquiryUrl = settings?.instagram_url || "https://instagram.com/rustic_jewels_instagram";

  const nextImage = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

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
        className="flex-grow pt-32 pb-24 bg-brand-charcoal"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Navigation Button */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/70 hover:text-gold-400 font-sans transition-colors duration-150 mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogue</span>
          </Link>

          {/* Product View Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Main Image View */}
              <div className="relative aspect-square bg-brand-charcoal-light border border-brand-charcoal-border overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIdx}
                    src={imagesList[activeImageIdx] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"}
                    alt={`${product.name} View ${activeImageIdx + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Carousel Arrow buttons if multiple images */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-charcoal/70 hover:bg-gold-500 hover:text-brand-charcoal text-brand-champagne flex items-center justify-center transition-colors duration-200 border border-brand-charcoal-border cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-charcoal/70 hover:bg-gold-500 hover:text-brand-charcoal text-brand-champagne flex items-center justify-center transition-colors duration-200 border border-brand-charcoal-border cursor-pointer z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Stock Tag overlay */}
                {!product.is_available && (
                  <div className="absolute top-4 left-4 bg-brand-charcoal/90 text-gold-300 border border-gold-500/20 px-3 py-1 text-xs uppercase tracking-widest font-sans font-semibold">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Thumbnails list if multiple images */}
              {imagesList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-20 aspect-square overflow-hidden border cursor-pointer flex-shrink-0 transition-all ${
                        activeImageIdx === idx
                          ? "border-gold-500 scale-[0.98]"
                          : "border-brand-charcoal-border hover:border-gold-500/40"
                      }`}
                    >
                      <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Inquiry Actions Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6" id="inquire">
              {/* Breadcrumb & Category */}
              <div>
                <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
                  {product.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
                </span>
                <h1 className="font-serif text-3xl md:text-4xl text-brand-champagne mt-1 tracking-wide leading-snug font-medium">
                  {product.name}
                </h1>
                <p className="font-serif text-2xl text-gold-300 mt-2 font-semibold">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Product Description */}
              <div className="border-t border-brand-charcoal-border/50 pt-6">
                <h3 className="text-xs uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold mb-2">
                  Description
                </h3>
                <p className="text-sm text-brand-champagne/80 font-sans leading-relaxed whitespace-pre-line font-light mb-3">
                  {product.short_description}
                </p>
                <p className="text-sm text-brand-champagne/60 font-sans leading-relaxed whitespace-pre-line font-light">
                  {product.full_description}
                </p>
              </div>

              {/* Product specifications table */}
              <div className="border-t border-brand-charcoal-border/50 pt-6">
                <h3 className="text-xs uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold mb-3">
                  Specifications
                </h3>
                <dl className="grid grid-cols-2 gap-y-3 text-sm font-sans">
                  {product.material && (
                    <>
                      <dt className="text-brand-champagne/50">Metal / Materials</dt>
                      <dd className="text-brand-champagne font-medium">{product.material}</dd>
                    </>
                  )}
                  {product.collection && (
                    <>
                      <dt className="text-brand-champagne/50">Collection</dt>
                      <dd className="text-brand-champagne font-medium">{product.collection}</dd>
                    </>
                  )}
                  <dt className="text-brand-champagne/50">Availability</dt>
                  <dd className={`font-semibold ${product.is_available ? "text-emerald-400" : "text-amber-500"}`}>
                    {product.is_available ? "Available" : "Piece Sold (Inquire for remake)"}
                  </dd>
                </dl>
              </div>

              {/* Dynamic Inquiry Dual Action Buttons */}
              <div className="border-t border-brand-charcoal-border/50 pt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {/* Primary DM Inquiry button */}
                  <a
                    href={instagramInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Instagram}
                      className="w-full text-center"
                    >
                      Inquire on Instagram
                    </Button>
                  </a>

                  {/* Dynamic Secondary "View Instagram Post" link */}
                  {product.instagram_post_url && (
                    <a
                      href={product.instagram_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button
                        variant="secondary"
                        size="lg"
                        icon={ExternalLink}
                        className="w-full text-center"
                      >
                        View Instagram Post
                      </Button>
                    </a>
                  )}

                  {/* Share button tool */}
                  <Button
                    variant="text"
                    size="md"
                    icon={shareCopied ? Check : Share2}
                    onClick={handleShare}
                    className="w-full border border-brand-charcoal-border hover:border-gold-500/25 py-2.5"
                  >
                    {shareCopied ? "Catalogue Link Copied!" : "Share this Jewel"}
                  </Button>
                </div>

                {/* Instruction card overlay */}
                <div className="glass border border-gold-500/10 p-4 flex gap-3 text-xs text-brand-champagne/70 font-sans leading-relaxed">
                  <Info className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gold-400 block mb-1">How to Inquire:</span>
                    When you click the primary button, you will navigate to our Instagram profile. 
                    Copy the template text below and paste it in our Direct Messages (or reference the product slug):
                    <strong className="block text-brand-champagne mt-1.5 bg-brand-charcoal/60 px-2.5 py-1.5 font-mono select-all border border-brand-charcoal-border/50 rounded-none text-[10px]">
                      {inquiryMessage}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products list */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-brand-charcoal-border/50 pt-16 mt-16">
              <h2 className="font-serif text-2xl text-brand-champagne tracking-wide mb-8 font-medium">
                Related Pieces
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((prod) => (
                  <Card key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
