"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Plus, Minus, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-grow pt-32 pb-24 bg-brand-charcoal min-h-[75vh]"
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-brand-charcoal-border/50 pb-6 mb-8 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-brand-champagne tracking-wide font-medium">
                Shopping Cart
              </h1>
              <p className="text-xs text-brand-champagne/50 font-sans mt-1">
                Review your selected one-of-a-kind vintage treasures.
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 font-sans cursor-pointer transition-colors border border-transparent hover:border-red-900/30 hover:bg-red-950/10 px-3 py-1.5"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Contents */}
          {cartItems.length === 0 ? (
            <div className="text-center py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light flex flex-col items-center gap-6">
              <ShoppingBag className="w-12 h-12 text-brand-champagne/25 animate-bounce-subtle" />
              <div>
                <h2 className="font-serif text-2xl text-brand-champagne font-medium">Your Cart is Empty</h2>
                <p className="text-xs text-brand-champagne/40 font-sans max-w-xs mt-1.5 leading-relaxed">
                  Browse our curated catalogue to find unique pre-loved pieces.
                </p>
              </div>
              <Link href="/catalog">
                <Button variant="primary" size="md" icon={ArrowLeft}>
                  Continue Browsing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Items List (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.listing.id}-${item.selectedItem.item_number}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-brand-charcoal-light border border-brand-charcoal-border hover:border-gold-500/20 transition-all duration-300 gap-4"
                  >
                    {/* Item Details */}
                    <div className="flex items-center gap-4">
                      <img
                        src={item.listing.featured_image}
                        alt={item.listing.title}
                        className="w-16 h-16 object-cover border border-brand-charcoal-border bg-brand-charcoal flex-shrink-0"
                      />
                      <div className="flex flex-col">
                        <Link
                          href={`/products/${item.listing.slug}?item=${item.selectedItem.item_number}`}
                          className="font-serif text-sm font-semibold text-brand-champagne hover:text-gold-400 transition-colors line-clamp-1"
                        >
                          {item.listing.title}
                        </Link>
                        <span className="text-[10px] text-brand-champagne/45 font-sans mt-0.5">
                          {item.selectedItem.item_name || "Unique Piece"}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-gold-400 font-semibold mt-1 font-sans">
                          Item Number: #{item.selectedItem.item_number}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-charcoal-border/40">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-brand-charcoal-border bg-brand-charcoal">
                        <button
                          onClick={() => updateQuantity(item.listing.id, item.selectedItem.item_number, item.quantity - 1)}
                          className="p-1.5 text-brand-champagne/60 hover:text-brand-champagne cursor-pointer transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium text-brand-champagne">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.listing.id, item.selectedItem.item_number, item.quantity + 1)}
                          className="p-1.5 text-brand-champagne/60 hover:text-brand-champagne cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-brand-champagne/40 font-sans">Total</span>
                        <span className="font-serif text-sm font-semibold text-gold-300">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.listing.id, item.selectedItem.item_number)}
                        className="text-brand-champagne/40 hover:text-red-400 p-1.5 transition-colors cursor-pointer border border-transparent hover:bg-red-950/15"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Back to catalog button */}
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/50 hover:text-gold-400 font-sans transition-colors duration-150 mt-4 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Order Summary (4 cols) */}
              <div className="lg:col-span-4 bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-5">
                <h3 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 font-medium">
                  Summary
                </h3>

                <div className="flex flex-col gap-3.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-brand-champagne/60">Cart Subtotal</span>
                    <span className="text-brand-champagne font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-champagne/60">Shipping</span>
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[9px] mt-0.5">Calculated at Checkout</span>
                  </div>
                  <div className="border-t border-brand-charcoal-border/50 pt-4 flex justify-between items-baseline mt-1">
                    <span className="text-sm font-semibold text-brand-champagne">Estimated Total</span>
                    <span className="font-serif text-xl font-bold text-gold-300">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link href="/checkout" className="w-full mt-2">
                  <Button variant="primary" size="lg" icon={ArrowRight} className="w-full text-center">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Info Card */}
                <div className="glass border border-gold-500/10 p-3.5 flex gap-2.5 text-[11px] text-brand-champagne/65 font-sans leading-relaxed mt-2">
                  <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gold-400 block mb-0.5">Please Note:</span>
                    Since each vintage item is unique and pre-loved, we hold items in carts for a limited time. Finalize checkout to secure your selection!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
