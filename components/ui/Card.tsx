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
      className="group relative flex flex-col bg-[#1A2438] border border-[#2F3C56] hover:border-[#59708E] overflow-hidden h-full rounded-2xl shadow-sm hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Listing Showcase Image Wrapper */}
      <Link href={`/products/${listing.slug}`} className="relative aspect-square block w-full overflow-hidden bg-[#121B2E] rounded-t-2xl">
        {/* Availability / Sold / Sale Badge */}
        {!hasAvailableItems ? (
          <div className="absolute top-3 left-3 z-10 bg-[#35445F] text-[#F5F2EC] px-3 py-1.5 text-xs uppercase tracking-widest font-sans font-medium rounded-full">
            {items.length === 1 ? "Sold Out" : "All Items Sold"}
          </div>
        ) : (
          hasDiscount && (
            <div className="absolute top-3 left-3 z-10 bg-[#C6A870] text-[#0A0F17] px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans font-bold rounded-full shadow-xs">
              {discountPercent}% OFF
            </div>
          )
        )}
        
        {listing.featured && (
          <div className="absolute top-3 right-3 z-10 bg-[#324A6A] text-[#F5F2EC] px-3 py-1.5 text-xs uppercase tracking-widest font-sans font-medium rounded-full shadow-xs">
            Featured
          </div>
        )}

        {/* Numbered items count badge - only shown for multi-item listings (2+) */}
        {items.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 bg-[#121B2E]/90 border border-[#2F3C56] text-[#C7CFDA] px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans flex items-center gap-1.5 rounded-full">
            <Layers className="w-3 h-3 text-[#C6A870]" />
            <span>{items.length} Items</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-[#0A0F17]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-10 h-10 rounded-full bg-[#324A6A] text-[#F5F2EC] flex items-center justify-center shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Showcase Image */}
        <div className="w-full h-full relative overflow-hidden">
          <img
            src={currentImage || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      {/* Listing Details */}
      <div className="p-5 flex flex-col flex-grow border-t border-[#2F3C56]">
        <span className="text-xs uppercase tracking-widest text-[#9BA8BC] font-sans mb-1.5 line-clamp-1 font-medium">
          {listing.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
        </span>
        
        <Link href={`/products/${listing.slug}`} className="block">
          <h3 className="font-serif text-lg text-[#F5F2EC] hover:text-[#C6A870] transition-colors duration-200 line-clamp-1 mb-1 font-semibold tracking-wide">
            {listing.title}
          </h3>
        </Link>
        
        {/* Material & Collection Details */}
        {(listing.material || listing.collection) && (
          <p className="text-xs text-[#C7CFDA] font-sans line-clamp-1 mb-3">
            {listing.material} {listing.collection ? `• ${listing.collection}` : ""}
          </p>
        )}

        {/* Price & Action Section */}
        <div className="mt-auto pt-3 border-t border-[#2F3C56]/70 flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            {resolvedPrices.length === 0 ? (
              <span className="font-serif text-sm text-[#9BA8BC]">
                Price on Inquiry
              </span>
            ) : hasDiscount ? (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="line-through text-[#8B99AD] text-xs font-normal">
                    {prefix}{formattedOriginal}
                  </span>
                  <span className="bg-[#C6A870] text-[#0A0F17] rounded-full px-2 py-0.5 text-[8px] font-bold font-sans uppercase tracking-wide">
                    {discountPercent}% OFF
                  </span>
                </div>
                <span className="font-serif text-lg text-[#C6A870] font-bold leading-tight">
                  {prefix}{formattedDiscounted}
                </span>
              </>
            ) : (
              <span className="font-serif text-lg text-[#F5F2EC] font-semibold">
                {prefix}{formattedOriginal}
              </span>
            )}
          </div>
          
          <Link
            href={`/products/[slug]`}
            as={`/products/${listing.slug}`}
            className="text-[10px] text-[#C7CFDA] hover:text-[#C6A870] font-sans tracking-widest uppercase transition-colors duration-200 border-b border-transparent hover:border-[#C6A870] pb-0.5 mb-1"
          >
            Select Item
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
