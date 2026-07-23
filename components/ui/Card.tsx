"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Listing, getListingItemPrice } from "@/types";
import { Eye, Layers } from "lucide-react";

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

  // Resolve prices including discounts
  const resolvedPrices = items
    .map((i) => {
      const orig = i.price || 0;
      const disc = getListingItemPrice(i, listing.categories) || 0;
      return { orig, disc };
    })
    .filter((x) => x.orig > 0);

  const minPricePair = resolvedPrices.length > 0
    ? resolvedPrices.reduce((prev, curr) => (curr.disc < prev.disc ? curr : prev))
    : null;

  const originalMinPrice = minPricePair?.orig || 0;
  const discountedMinPrice = minPricePair?.disc || 0;
  const hasDiscount = minPricePair && discountedMinPrice < originalMinPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalMinPrice - discountedMinPrice) / originalMinPrice) * 100)
    : 0;

  const isMultiple = items.length > 1;
  const prefix = isMultiple ? "From " : "";

  const formattedOriginal = originalMinPrice > 0
    ? new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
      }).format(originalMinPrice)
    : "";

  const formattedDiscounted = discountedMinPrice > 0
    ? new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
      }).format(discountedMinPrice)
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#FFFFFF] border border-[#D8E4F1] hover:border-[#7F9CB8]/60 overflow-hidden h-full rounded-sm shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* Listing Showcase Image Wrapper */}
      <Link href={`/products/${listing.slug}`} className="relative aspect-square block w-full overflow-hidden bg-[#EAF2FF]">
        {/* Availability / Sold / Sale Badge */}
        {!hasAvailableItems ? (
          <div className="absolute top-3 left-3 z-10 bg-[#5F5A5A] text-[#FFFFFF] px-3 py-1 text-xs uppercase tracking-widest font-sans font-medium">
            {items.length === 1 ? "Sold Out" : "All Items Sold"}
          </div>
        ) : (
          hasDiscount && (
            <div className="absolute top-3 left-3 z-10 bg-[#B8CBDD] text-[#2D2A2D] px-2.5 py-1 text-[10px] uppercase tracking-widest font-sans font-bold shadow-xs">
              {discountPercent}% OFF
            </div>
          )
        )}
        
        {listing.featured && (
          <div className="absolute top-3 right-3 z-10 bg-[#7F9CB8] text-[#FFFFFF] px-3 py-1 text-xs uppercase tracking-widest font-sans font-bold shadow-xs">
            Featured
          </div>
        )}

        {/* Numbered items count badge - only shown for multi-item listings (2+) */}
        {items.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 bg-[#FFFFFF]/90 border border-[#D8E4F1] text-[#2D2A2D]/90 px-2.5 py-1 text-[10px] uppercase tracking-widest font-sans flex items-center gap-1.5 glass">
            <Layers className="w-3 h-3 text-[#7F9CB8]" />
            <span>{items.length} Items</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-[#2D2A2D]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-full bg-[#7F9CB8] text-[#FFFFFF] flex items-center justify-center shadow-lg"
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
            decoding="async"
          />
        </div>
      </Link>

      {/* Listing Details */}
      <div className="p-5 flex flex-col flex-grow border-t border-[#D8E4F1]">
        <span className="text-xs uppercase tracking-widest text-[#5F5A5A] font-sans mb-1.5 line-clamp-1 font-medium">
          {listing.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
        </span>
        
        <Link href={`/products/${listing.slug}`} className="block">
          <h3 className="font-serif text-lg text-[#2D2A2D] hover:text-[#7F9CB8] transition-colors duration-200 line-clamp-1 mb-1 font-medium">
            {listing.title}
          </h3>
        </Link>
        
        {/* Material & Collection Details */}
        {(listing.material || listing.collection) && (
          <p className="text-xs text-[#5F5A5A] font-sans line-clamp-1 mb-3">
            {listing.material} {listing.collection ? `• ${listing.collection}` : ""}
          </p>
        )}

        {/* Price & Action Section */}
        <div className="mt-auto pt-3 border-t border-[#D8E4F1]/60 flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            {resolvedPrices.length === 0 ? (
              <span className="font-serif text-sm text-[#5F5A5A]/60">
                Price on Inquiry
              </span>
            ) : hasDiscount ? (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="line-through text-[#5F5A5A]/60 text-xs font-normal">
                    {prefix}{formattedOriginal}
                  </span>
                  <span className="bg-[#B8CBDD]/40 text-[#2D2A2D] border border-[#B8CBDD]/60 px-1 py-0.5 text-[8px] font-bold font-sans uppercase tracking-wide">
                    {discountPercent}% OFF
                  </span>
                </div>
                <span className="font-serif text-lg text-[#7F9CB8] font-bold leading-tight">
                  {prefix}{formattedDiscounted}
                </span>
              </>
            ) : (
              <span className="font-serif text-lg text-[#2D2A2D] font-semibold">
                {prefix}{formattedOriginal}
              </span>
            )}
          </div>
          
          <Link
            href={`/products/[slug]`}
            as={`/products/${listing.slug}`}
            className="text-[10px] text-[#5F5A5A] hover:text-[#7F9CB8] font-sans tracking-widest uppercase transition-colors duration-200 border-b border-transparent hover:border-[#7F9CB8] pb-0.5 mb-1"
          >
            Select Item
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
