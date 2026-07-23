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
        className="flex-grow pt-32 pb-24 bg-[#FFFFFF] min-h-[75vh]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E8F1] pb-6 mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#202124] tracking-wide font-medium">Your Shopping Bag</h1>
              <p className="text-xs text-[#525B66] font-sans mt-1">Review your selected items before proceeding to checkout.</p>
            </div>
            {cartItems.length > 0 && (
              <span className="text-xs uppercase tracking-widest text-[#5D7899] font-sans font-semibold border border-[#DCE5EF] px-3 py-1.5 bg-[#EDF3F9] self-start md:self-auto">
                {itemCount} {itemCount === 1 ? "Item" : "Items"} Total
              </span>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 border border-[#E1E8F1] bg-[#FFFFFF] flex flex-col items-center gap-6 shadow-xs">
              <ShoppingBag className="w-16 h-16 text-[#7D96B5]" />
              <div className="flex flex-col gap-2 max-w-md">
                <h2 className="font-serif text-2xl text-[#202124]">Your Bag is Currently Empty</h2>
                <p className="text-xs text-[#525B66] font-sans leading-relaxed">
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
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#e4eefe] border border-[#c8d8f8] hover:border-[#7D96B5] transition-all duration-300 gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-4 flex-grow">
                      <img
                        src={item.listing.featured_image}
                        alt={item.listing.title}
                        className="w-16 h-16 object-cover border border-[#E1E8F1] bg-[#EAF0F8] flex-shrink-0"
                      />
                      <div className="flex flex-col gap-1">
                        <Link href={`/products/${item.listing.slug}`}>
                          <h3 className="font-serif text-base text-[#202124] hover:text-[#7D96B5] transition-colors font-medium">
                            {item.listing.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-widest text-[#5D7899] font-sans font-bold bg-[#EDF3F9] px-2 py-0.5 border border-[#DCE5EF]">
                            Item #{item.selectedItem.item_number}
                          </span>
                          {item.selectedItem.item_name && (
                            <span className="text-xs text-[#525B66] font-sans line-clamp-1">
                              • {item.selectedItem.item_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E1E8F1]">
                      <div className="text-left sm:text-right flex flex-col">
                        <span className="font-serif text-lg font-bold text-[#7D96B5]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-[#525B66] font-sans">
                            {formatPrice(item.price)} each
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.listing.id, item.selectedItem.item_number)}
                        className="p-2 text-[#7D96B5] hover:text-red-450 transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#525B66] hover:text-[#7D96B5] font-sans transition-colors duration-150 mt-4 cursor-pointer bg-[#f2f6fe] border border-[#c8d8f8] px-4 py-2.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Order Summary (4 cols) */}
              <div className="lg:col-span-4 bg-[#e4eefe] border border-[#c8d8f8] p-6 flex flex-col gap-5 shadow-xs">
                <h3 className="font-serif text-lg text-[#202124] border-b border-[#E1E8F1] pb-3 font-medium">
                  Summary
                </h3>

                <div className="flex flex-col gap-3.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#525B66]">Cart Subtotal</span>
                    <span className="text-[#202124] font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525B66]">Standard Delivery</span>
                    <span className="text-[#202124] font-medium">{formatPrice(DELIVERY_FEE)}</span>
                  </div>
                  <div className="border-t border-[#E1E8F1] pt-4 flex justify-between items-baseline mt-1">
                    <span className="text-sm font-semibold text-[#202124]">Estimated Total</span>
                    <span className="font-serif text-xl font-bold text-[#7D96B5]">{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link href="/checkout" className="w-full mt-2">
                  <Button variant="primary" size="lg" icon={ArrowRight} className="w-full text-center">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Info Card */}
                <div className="glass border border-[#E1E8F1] p-3.5 flex gap-2.5 text-[11px] text-[#525B66] font-sans leading-relaxed mt-2">
                  <Info className="w-4 h-4 text-[#7D96B5] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#202124] block mb-0.5">Please Note:</span>
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
