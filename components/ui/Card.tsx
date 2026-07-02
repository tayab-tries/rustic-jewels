"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Listing } from "@/types";
import { Eye, Layers } from "lucide-react";
import { Instagram } from "@/components/ui/Icons";

interface CardProps {
  product: Listing;
}

export default function Card({ product }: CardProps) {
  const listing = product; // alias for clarity
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleImages = listing.gallery_images && listing.gallery_images.length > 0;
  const currentImage = hasMultipleImages && isHovered ? listing.gallery_images[0] : listing.featured_image;

  const items = listing.items || [];
  const availableItems = items.filter((i) => i.is_available);
  const hasAvailableItems = availableItems.length > 0;

  // Calculate price starting range or single item price
  const formatPriceRange = () => {
    if (!items || items.length === 0) return "Price on Inquiry";
    
    const validPrices = items
      .map((i) => i.price)
      .filter((p): p is number => p !== null && p !== undefined && p > 0);

    if (validPrices.length === 0) return "Price on Inquiry";

    const minPrice = Math.min(...validPrices);
    
    const formatted = new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(minPrice);

    if (items.length === 1) {
      return formatted;
    }

    return `From ${formatted}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-brand-charcoal-light border border-brand-charcoal-border overflow-hidden h-full"
    >
      {/* Listing Showcase Image Wrapper */}
      <Link href={`/products/${listing.slug}`} className="relative aspect-square block w-full overflow-hidden bg-brand-charcoal">
        {/* Availability / Sold Badge */}
        {!hasAvailableItems && (
          <div className="absolute top-3 left-3 z-10 bg-brand-charcoal/90 text-gold-300 border border-gold-500/20 px-3 py-1 text-xs uppercase tracking-widest font-sans">
            {items.length === 1 ? "Sold Out" : "All Items Sold"}
          </div>
        )}
        
        {listing.featured && (
          <div className="absolute top-3 right-3 z-10 bg-gold-500 text-brand-charcoal px-3 py-1 text-xs uppercase tracking-widest font-sans font-bold">
            Featured
          </div>
        )}

        {/* Numbered items count badge - only shown for multi-item listings (2+) */}
        {items.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 bg-brand-charcoal/85 border border-brand-charcoal-border text-brand-champagne/80 px-2.5 py-1 text-[10px] uppercase tracking-widest font-sans flex items-center gap-1.5 glass">
            <Layers className="w-3 h-3 text-gold-400" />
            <span>{items.length} Items</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-full bg-brand-champagne text-brand-charcoal flex items-center justify-center shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Showcase Image */}
        <div className="w-full h-full relative">
          <img
            src={currentImage || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Listing Details */}
      <div className="p-5 flex flex-col flex-grow border-t border-brand-charcoal-border">
        <span className="text-xs uppercase tracking-widest text-gold-500 font-sans mb-1.5 line-clamp-1">
          {listing.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
        </span>
        
        <Link href={`/products/${listing.slug}`} className="block">
          <h3 className="font-serif text-lg text-brand-champagne hover:text-gold-300 transition-colors duration-200 line-clamp-1 mb-1 font-medium">
            {listing.title}
          </h3>
        </Link>
        
        {/* Material & Collection Details */}
        {(listing.material || listing.collection) && (
          <p className="text-xs text-brand-champagne/60 font-sans line-clamp-1 mb-3">
            {listing.material} {listing.collection ? `• ${listing.collection}` : ""}
          </p>
        )}

        {/* Price & Instagram Inquire Section */}
        <div className="mt-auto pt-3 border-t border-brand-charcoal-border/50 flex items-center justify-between">
          <span className="font-serif text-base text-gold-300 font-semibold">
            {formatPriceRange()}
          </span>
          
          <Link
            href={`/products/${listing.slug}#items`}
            className="inline-flex items-center gap-1.5 text-xs text-brand-champagne/80 hover:text-gold-400 font-sans tracking-wider uppercase transition-colors duration-200"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Select Item</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
