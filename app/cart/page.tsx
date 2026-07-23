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

  const DELIVERY_FEE = 250;
  const estimatedTotal = cartTotal + DELIVERY_FEE;
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-grow pt-32 pb-24 bg-[#121B2E] min-h-[75vh]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2F3C56] pb-6 mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#F5F2EC] tracking-wide font-semibold">Your Shopping Bag</h1>
              <p className="text-xs text-[#C7CFDA] font-sans mt-1">Review your selected items before proceeding to checkout.</p>
            </div>
            {cartItems.length > 0 && (
              <span className="text-xs uppercase tracking-widest text-[#C6A870] font-sans font-semibold border border-[#C6A870]/30 px-3 py-1.5 rounded-full bg-[#C6A870]/10 self-start md:self-auto">
                {itemCount} {itemCount === 1 ? "Item" : "Items"} Total
              </span>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 border border-[#2F3C56] bg-[#1A2438] rounded-2xl flex flex-col items-center gap-6 shadow-sm">
              <ShoppingBag className="w-16 h-16 text-[#59708E]" />
              <div className="flex flex-col gap-2 max-w-md">
                <h2 className="font-serif text-2xl text-[#F5F2EC]">Your Bag is Currently Empty</h2>
                <p className="text-xs text-[#C7CFDA] font-sans leading-relaxed">
                  Browse our catalogue to add fine artisan pieces to your shopping cart.
                </p>
              </div>
              <Link href="/catalog" className="mt-2">
                <Button variant="primary" size="md">
                  Explore Catalogue
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
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#1A2438] border border-[#2F3C56] hover:border-[#59708E]/50 rounded-2xl transition-all duration-300 gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4 flex-grow">
                      <img
                        src={item.listing.featured_image}
                        alt={item.listing.title}
                        className="w-16 h-16 object-cover border border-[#2F3C56] bg-[#121B2E] rounded-xl flex-shrink-0"
                      />
                      <div className="flex flex-col gap-1">
                        <Link href={`/products/${item.listing.slug}`}>
                          <h3 className="font-serif text-base text-[#F5F2EC] hover:text-[#C6A870] transition-colors font-semibold">
                            {item.listing.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-widest text-[#C6A870] font-sans font-bold bg-[#C6A870]/15 px-2 py-0.5 rounded-full border border-[#C6A870]/30">
                            Item #{item.selectedItem.item_number}
                          </span>
                          {item.selectedItem.item_name && (
                            <span className="text-xs text-[#C7CFDA] font-sans line-clamp-1">
                              • {item.selectedItem.item_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#2F3C56]">
                      <div className="text-left sm:text-right flex flex-col">
                        <span className="font-serif text-lg font-bold text-[#C6A870]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-[#9BA8BC] font-sans">
                            {formatPrice(item.price)} each
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.listing.id, item.selectedItem.item_number)}
                        className="p-2 text-[#9BA8BC] hover:text-[#C86969] transition-colors cursor-pointer rounded-lg hover:bg-[#C86969]/10"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Back to catalog button */}
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C7CFDA] hover:text-[#59708E] font-sans transition-colors duration-150 mt-4 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Order Summary (4 cols) */}
              <div className="lg:col-span-4 bg-[#1A2438] border border-[#2F3C56] p-6 rounded-2xl flex flex-col gap-5 shadow-sm">
                <h3 className="font-serif text-lg text-[#F5F2EC] border-b border-[#2F3C56] pb-3 font-semibold">
                  Summary
                </h3>

                <div className="flex flex-col gap-3.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#C7CFDA]">Cart Subtotal</span>
                    <span className="text-[#F5F2EC] font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C7CFDA]">Standard Delivery</span>
                    <span className="text-[#F5F2EC] font-medium">{formatPrice(DELIVERY_FEE)}</span>
                  </div>
                  <div className="border-t border-[#2F3C56] pt-4 flex justify-between items-baseline mt-1">
                    <span className="text-sm font-semibold text-[#F5F2EC]">Estimated Total</span>
                    <span className="font-serif text-xl font-bold text-[#C6A870]">{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link href="/checkout" className="w-full mt-2">
                  <Button variant="primary" size="lg" icon={ArrowRight} className="w-full text-center">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Info Card */}
                <div className="glass border border-[#C6A870]/20 p-3.5 flex gap-2.5 text-[11px] text-[#C7CFDA]/80 font-sans leading-relaxed mt-2 rounded-xl">
                  <Info className="w-4 h-4 text-[#C6A870] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#C6A870] block mb-0.5">Please Note:</span>
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
