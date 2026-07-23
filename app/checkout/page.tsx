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
import { ArrowLeft, CreditCard, ShoppingBag, Loader2, AlertCircle, Truck } from "lucide-react";
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

  if (cartItems.length === 0) {
    addToast("Your cart is empty.", "error");
    return null;
  }

  const DELIVERY_FEE = 250;
  const finalTotal = cartTotal + DELIVERY_FEE;

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitting(true);
    try {
      // Map cart items into listing_items schema for backend submission
      const orderItemsInput = cartItems.map((item) => ({
        listing_id: item.listing.id,
        listing_title: item.listing.title,
        listing_image: item.listing.featured_image,
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
          total: finalTotal, // Subtotal + PKR 250 Standard Delivery
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
        <main className="flex-grow pt-32 pb-24 flex items-center justify-center bg-[#F4F7FB] min-h-screen">
          <Loader2 className="w-8 h-8 text-[#7D96B5] animate-spin" />
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
          <div className="flex flex-col items-center gap-4 py-20 border border-[#E1E8F1] bg-[#FFFFFF] w-full max-w-lg shadow-xs rounded-2xl">
            <AlertCircle className="w-12 h-12 text-[#7D96B5]" />
            <h2 className="font-serif text-2xl text-[#202124]">Your Cart is Empty</h2>
            <p className="text-xs text-[#525B66] font-sans max-w-xs mt-1.5 leading-relaxed">
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
        className="flex-grow pt-32 pb-24 bg-[#F4F7FB]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E1E8F1] pb-6 mb-8 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#202124] tracking-wide font-medium">Order Checkout</h1>
              <p className="text-xs text-[#525B66] font-sans mt-1">Provide your delivery details to complete your order reservation.</p>
            </div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#525B66] hover:text-[#7D96B5] font-sans transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Shopping Bag</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E1E8F1] p-6 sm:p-8 shadow-xs rounded-2xl">
              <h2 className="font-serif text-xl text-[#202124] border-b border-[#E1E8F1] pb-4 mb-6 font-medium flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#7D96B5]" />
                Shipping & Delivery Address
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Recipient Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold">Recipient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ayesha Khan"
                    {...register("customer_name")}
                    className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] px-4 py-2.5 text-xs rounded-[10px] focus:outline-none placeholder:text-[#9EA8B5] font-sans"
                  />
                  {errors.customer_name && <span className="text-[10px] text-[#CF6A6A] font-sans mt-0.5">{errors.customer_name.message}</span>}
                </div>

                {/* Mobile Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold">Phone Number * (for Courier delivery SMS)</label>
                  <input
                    type="text"
                    placeholder="e.g. 03001234567"
                    {...register("phone")}
                    className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] px-4 py-2.5 text-xs rounded-[10px] focus:outline-none placeholder:text-[#9EA8B5] font-sans"
                  />
                  {errors.phone && <span className="text-[10px] text-[#CF6A6A] font-sans mt-0.5">{errors.phone.message}</span>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] px-4 py-2.5 text-xs rounded-[10px] focus:outline-none placeholder:text-[#9EA8B5] font-sans"
                  />
                  {errors.email && <span className="text-[10px] text-[#CF6A6A] font-sans mt-0.5">{errors.email.message}</span>}
                </div>

                {/* Complete Street Shipping Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold">Complete Street Address *</label>
                  <textarea
                    rows={3}
                    placeholder="House/Apartment #, Street #, Block/Sector, Area"
                    {...register("shipping_address")}
                    className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] px-4 py-2.5 text-xs rounded-[10px] focus:outline-none placeholder:text-[#9EA8B5] font-sans resize-none"
                  />
                  {errors.shipping_address && <span className="text-[10px] text-[#CF6A6A] font-sans mt-0.5">{errors.shipping_address.message}</span>}
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    {...register("city")}
                    className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] px-4 py-2.5 text-xs rounded-[10px] focus:outline-none placeholder:text-[#9EA8B5] font-sans"
                  />
                  {errors.city && <span className="text-[10px] text-[#CF6A6A] font-sans mt-0.5">{errors.city.message}</span>}
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold">Additional Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Special requests or instructions for shipping..."
                    {...register("notes")}
                    className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] px-4 py-2.5 text-xs rounded-[10px] focus:outline-none placeholder:text-[#9EA8B5] font-sans resize-none"
                  />
                  {errors.notes && <span className="text-[10px] text-[#CF6A6A] font-sans mt-0.5">{errors.notes.message}</span>}
                </div>

                <div className="mt-4">
                  <Button variant="primary" size="lg" type="submit" isLoading={submitting} className="w-full text-center py-3">
                    Submit Order & View Payment Info
                  </Button>
                </div>
              </form>
            </div>

            {/* Checkout Items Summary Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5 bg-[#FFFFFF] border border-[#E1E8F1] p-6 shadow-xs rounded-2xl">
              <h3 className="font-serif text-lg text-[#202124] border-b border-[#E1E8F1] pb-3 font-medium flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#7D96B5]" />
                Order Summary
              </h3>

              {/* Items List */}
              <div className="flex flex-col divide-y divide-[#E1E8F1]/60 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.listing.id}-${item.selectedItem.item_number}`} className="py-3 flex items-center justify-between gap-3 text-xs font-sans first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={item.listing.featured_image} alt={item.listing.title} className="w-10 h-10 object-cover border border-[#E1E8F1] bg-[#EAF0F8] flex-shrink-0 rounded-[10px]" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[#202124] line-clamp-1">{item.listing.title}</span>
                        <span className="text-[9px] text-[#7D96B5] uppercase tracking-widest font-semibold">Item #{item.selectedItem.item_number}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#C9A96A]">{formatPrice(item.price)}</span>
                      <span className="text-[10px] text-[#525B66] block">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-[#E1E8F1] pt-4 flex flex-col gap-3 text-xs font-sans">
                <div className="flex justify-between text-[#525B66]">
                  <span>Subtotal</span>
                  <span className="text-[#202124] font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-[#525B66]">
                  <span>Standard Delivery</span>
                  <span className="text-[#202124] font-medium">{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="border-t border-[#E1E8F1] pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-[#202124]">Total Amount Due</span>
                  <span className="font-serif text-xl font-bold text-[#C9A96A]">{formatPrice(finalTotal)}</span>
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
