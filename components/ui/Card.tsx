"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { Eye } from "lucide-react";
import { Instagram } from "@/components/ui/Icons";

interface CardProps {
  product: Product;
}

export default function Card({ product }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleImages = product.gallery_images && product.gallery_images.length > 0;
  const currentImage = hasMultipleImages && isHovered ? product.gallery_images[0] : product.featured_image;

  const formatPrice = (price: number | null) => {
    if (price === null) return "Price on Inquiry";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
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
      {/* Product Image Gallery Wrapper */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square block w-full overflow-hidden bg-brand-charcoal">
        {/* Availability Badge */}
        {!product.is_available && (
          <div className="absolute top-3 left-3 z-10 bg-brand-charcoal/90 text-gold-300 border border-gold-500/20 px-3 py-1 text-xs uppercase tracking-widest font-sans">
            Out of Stock
          </div>
        )}
        
        {product.featured && (
          <div className="absolute top-3 right-3 z-10 bg-gold-500 text-brand-charcoal px-3 py-1 text-xs uppercase tracking-widest font-sans font-bold">
            Featured
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

        {/* Product Image */}
        <div className="w-full h-full relative">
          <img
            src={currentImage || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow border-t border-brand-charcoal-border">
        <span className="text-xs uppercase tracking-widest text-gold-500 font-sans mb-1.5 line-clamp-1">
          {product.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
        </span>
        
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-serif text-lg text-brand-champagne hover:text-gold-300 transition-colors duration-200 line-clamp-1 mb-1 font-medium">
            {product.name}
          </h3>
        </Link>
        
        {/* Material & Collection Details */}
        {(product.material || product.collection) && (
          <p className="text-xs text-brand-champagne/60 font-sans line-clamp-1 mb-3">
            {product.material} {product.collection ? `• ${product.collection}` : ""}
          </p>
        )}

        {/* Price & Instagram Inquire Section */}
        <div className="mt-auto pt-3 border-t border-brand-charcoal-border/50 flex items-center justify-between">
          <span className="font-serif text-base text-gold-300 font-semibold">
            {formatPrice(product.price)}
          </span>
          
          <Link
            href={`/catalog/${product.id}#inquire`}
            className="inline-flex items-center gap-1.5 text-xs text-brand-champagne/80 hover:text-gold-400 font-sans tracking-wider uppercase transition-colors duration-200"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Inquire</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
