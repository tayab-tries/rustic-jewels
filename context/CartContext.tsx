"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartItem, Listing, ListingItem, getListingItemPrice } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (listing: Listing, selectedItem: ListingItem, quantity?: number) => void;
  removeFromCart: (listingId: string, itemNumber: string) => void;
  updateQuantity: (listingId: string, itemNumber: string, quantity: number) => void;
  clearCart: () => void;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const storedCart = localStorage.getItem("rustic_cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error("Failed to parse cart items from localStorage", err);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("rustic_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const addToCart = (listing: Listing, selectedItem: ListingItem, quantity: number = 1) => {
    // Validate availability
    if (!selectedItem.is_available) {
      addToast("This item is already sold.", "error");
      return;
    }

    // Check if item is already in cart using the current cartItems state
    const existingIdx = cartItems.findIndex(
      (item) =>
        item.listing.id === listing.id &&
        item.selectedItem.item_number === selectedItem.item_number
    );

    const price = getListingItemPrice(selectedItem, listing.categories) || 0;

    if (existingIdx > -1) {
      // For thrifted item numbers, we usually want max quantity to be 1, but we can allow updating if specified.
      // Let's cap quantity at 1 for numbered items as they are unique physical objects
      const hasNumberedItem = selectedItem.item_number && selectedItem.item_number.trim() !== "";
      if (hasNumberedItem) {
        addToast("This unique item is already in your cart.", "info");
        return;
      }

      setCartItems((prevItems) => {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        return updated;
      });
      addToast(`Updated quantity of "${listing.title}" in cart.`);
    } else {
      setCartItems((prevItems) => [...prevItems, { listing, selectedItem, price, quantity }]);
      addToast(`Added "${listing.title}" (Item #${selectedItem.item_number}) to cart.`);
    }
  };

  const removeFromCart = (listingId: string, itemNumber: string) => {
    const target = cartItems.find(
      (item) =>
        item.listing.id === listingId &&
        item.selectedItem.item_number === itemNumber
    );
    if (target) {
      addToast(`Removed "${target.listing.title}" (Item #${itemNumber}) from cart.`, "info");
      setCartItems((prevItems) =>
        prevItems.filter(
          (item) =>
            !(item.listing.id === listingId && item.selectedItem.item_number === itemNumber)
        )
      );
    }
  };

  const updateQuantity = (listingId: string, itemNumber: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(listingId, itemNumber);
      return;
    }

    const item = cartItems.find(
      (it) => it.listing.id === listingId && it.selectedItem.item_number === itemNumber
    );

    if (item) {
      // Cap quantity at 1 for unique numbered items
      const isUnique = item.selectedItem.item_number && item.selectedItem.item_number.trim() !== "";
      if (isUnique && quantity > 1) {
        addToast("Only 1 available for this unique vintage piece.", "info");
        return;
      }

      setCartItems((prevItems) =>
        prevItems.map((it) => {
          if (it.listing.id === listingId && it.selectedItem.item_number === itemNumber) {
            return { ...it, quantity };
          }
          return it;
        })
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToast,
      }}
    >
      {children}

      {/* Global toast notification portals */}
      <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-sm z-55 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 px-5 py-4 border border-[#c8d8f8] bg-[#e4eefe] shadow-xl text-xs font-sans font-semibold rounded-none pointer-events-auto text-[#2d5080]"
            >
              {toast.type === "error" ? (
                <XCircle className="w-4 h-4 flex-shrink-0 text-[#5D7899]" />
              ) : toast.type === "info" ? (
                <Info className="w-4 h-4 flex-shrink-0 text-[#7D96B5]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#7D96B5]" />
              )}
              <span className="flex-grow">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
