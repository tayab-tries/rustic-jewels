"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useCart } from "@/context/CartContext";
import { orderService } from "@/services/orderService";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import { ArrowLeft, CreditCard, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Checkout Form Validation Schema
const checkoutSchema = zod.object({
  customer_name: zod.string().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  phone: zod
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\s()-]+$/, "Invalid phone number format"),
  email: zod.string().optional().refine((val) => !val || zod.string().email().safeParse(val).success, {
    message: "Invalid email format",
  }),
  shipping_address: zod.string().min(5, "Address must be at least 5 characters").max(250, "Address is too long"),
  city: zod.string().min(2, "City name is required").max(60, "City name is too long"),
  notes: zod.string().max(300, "Additional notes are too long").optional(),
});

type CheckoutFormValues = zod.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart, addToast } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      shipping_address: "",
      city: "",
      notes: "",
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      addToast("Your cart is empty.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const orderItemsInput = cartItems.map((item) => ({
        listing_id: item.listing.id,
        item_number: item.selectedItem.item_number,
        price: item.price,
        quantity: item.quantity,
      }));

      const newOrder = await orderService.createOrder(
        {
          customer_name: values.customer_name,
          phone: values.phone,
          instagram_username: "", // Optional/removed on checkout form
          email: values.email || null,
          shipping_address: values.shipping_address,
          city: values.city,
          notes: values.notes || null,
          subtotal: cartTotal,
          total: cartTotal, // Free manual delivery or manual cost included
        },
        orderItemsInput
      );

      if (newOrder) {
        addToast("Order placed successfully!", "success");

        // Save order tracking references to local storage (for returning tracking session)
        if (typeof window !== "undefined") {
          const recent = localStorage.getItem("rustic_recent_orders");
          let recentList = [];
          if (recent) {
            try {
              recentList = JSON.parse(recent);
            } catch {}
          }
          if (!recentList.includes(newOrder.order_id)) {
            recentList.push(newOrder.order_id);
          }
          localStorage.setItem("rustic_recent_orders", JSON.stringify(recentList));
        }

        // Clear cart items
        clearCart();

        // Redirect to payment instructions page
        router.push(`/payment-instructions/${newOrder.order_id}`);
      } else {
        addToast("Failed to place order. Please try again.", "error");
      }
    } catch (err) {
      console.error("Failed to submit order checkout", err);
      addToast("An error occurred during checkout.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) {
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

  // Redirect if cart is empty on loading checkout page
  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 min-h-[70vh] flex flex-col justify-center items-center text-center">
          <div className="flex flex-col items-center gap-4 py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light w-full max-w-lg">
            <AlertCircle className="w-12 h-12 text-gold-500" />
            <h2 className="font-serif text-2xl text-brand-champagne">Your Cart is Empty</h2>
            <p className="text-xs text-brand-champagne/50 font-sans max-w-xs mt-1.5 leading-relaxed">
              You must add items to your cart before proceeding to checkout.
            </p>
            <Link href="/catalog" className="mt-4">
              <Button variant="secondary" size="sm" icon={ArrowLeft}>
                Return to Catalogue
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-grow pt-32 pb-24 bg-brand-charcoal"
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* Back link */}
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/60 hover:text-gold-400 font-sans transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl text-brand-champagne tracking-wide mb-8 font-medium">
            Checkout Details
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Form Details Column (7 cols) */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 bg-brand-charcoal-light border border-brand-charcoal-border p-6 sm:p-8">
                <h3 className="font-serif text-xl text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 font-medium flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-gold-400" />
                  Shipping & Order Information
                </h3>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Customer Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    {...register("customer_name")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  {errors.customer_name && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.customer_name.message}</span>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Phone Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 03001234567"
                    {...register("phone")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  {errors.phone && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.phone.message}</span>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. buyer@example.com"
                    {...register("email")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  {errors.email && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.email.message}</span>}
                </div>

                {/* Shipping Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Shipping Address *</label>
                  <textarea
                    rows={3}
                    placeholder="Enter complete delivery street address, house number, area..."
                    {...register("shipping_address")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans resize-none"
                  />
                  {errors.shipping_address && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.shipping_address.message}</span>}
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    {...register("city")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  {errors.city && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.city.message}</span>}
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Additional Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Special requests or instructions for shipping..."
                    {...register("notes")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans resize-none"
                  />
                  {errors.notes && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.notes.message}</span>}
                </div>

                <div className="mt-4">
                  <Button variant="primary" size="lg" type="submit" isLoading={submitting} className="w-full text-center py-3">
                    Submit Order & View Payment Info
                  </Button>
                </div>
              </form>
            </div>

            {/* Checkout Items Summary Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5 bg-brand-charcoal-light border border-brand-charcoal-border p-6">
              <h3 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 font-medium flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                Order Summary
              </h3>

              {/* Items List */}
              <div className="flex flex-col divide-y divide-brand-charcoal-border/30 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.listing.id}-${item.selectedItem.item_number}`} className="py-3 flex items-center justify-between gap-3 text-xs font-sans first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={item.listing.featured_image} alt={item.listing.title} className="w-10 h-10 object-cover border border-brand-charcoal-border bg-brand-charcoal flex-shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-brand-champagne line-clamp-1">{item.listing.title}</span>
                        <span className="text-[9px] text-gold-400 uppercase tracking-widest font-medium">Item #{item.selectedItem.item_number}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-brand-champagne">{formatPrice(item.price)}</span>
                      <span className="text-[10px] text-brand-champagne/40 block">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-brand-charcoal-border/50 pt-4 flex flex-col gap-3 text-xs font-sans">
                <div className="flex justify-between text-brand-champagne/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-brand-champagne/60">
                  <span>Manual Shipping Fee</span>
                  <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[9px] mt-0.5">Free</span>
                </div>
                <div className="border-t border-brand-charcoal-border/40 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-brand-champagne">Total Amount Due</span>
                  <span className="font-serif text-xl font-bold text-gold-300">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
