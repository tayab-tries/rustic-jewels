"use client";

import React, { useEffect, useState, Suspense, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { orderService } from "@/services/orderService";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import { Order, OrderStatus } from "@/types";
import { Search, Calendar, ShoppingBag, Info, ShieldAlert, CheckCircle2, ChevronRight, Clipboard, ClipboardCheck, Loader2 } from "lucide-react";

function OrderTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { addToast } = useCart();

  const [searchVal, setSearchVal] = useState(initialQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const lastSearchedRef = useRef("");

  // Load recent orders from local storage on mount
  useEffect(() => {
    async function loadRecent() {
      if (typeof window === "undefined") return;
      const recent = localStorage.getItem("rustic_recent_orders");
      if (!recent) return;

      try {
        const orderIds = JSON.parse(recent) as string[];
        if (orderIds.length === 0) return;

        setRecentLoading(true);
        // Load details for all of them
        const loaded: Order[] = [];
        for (const orderId of orderIds) {
          const ord = await orderService.getOrderByOrderId(orderId);
          if (ord) loaded.push(ord);
        }
        setRecentOrders(loaded);
      } catch (err) {
        console.error("Failed to load recent orders", err);
      } finally {
        setRecentLoading(false);
      }
    }
    loadRecent();
  }, []);

  const handleSearch = useCallback(async (queryStr: string) => {
    if (!queryStr.trim() || lastSearchedRef.current === queryStr.trim()) return;
    lastSearchedRef.current = queryStr.trim();
    setLoading(true);
    try {
      // trackOrders takes (orderId, phone, email).
      // We check if query looks like an Order ID, Email, or Phone.
      let idParam = "";
      let phoneParam = "";
      let emailParam = "";

      if (queryStr.toUpperCase().startsWith("RJ-")) {
        idParam = queryStr;
      } else if (queryStr.includes("@")) {
        emailParam = queryStr;
      } else {
        phoneParam = queryStr;
      }

      const results = await orderService.trackOrders(idParam, phoneParam, emailParam);
      setOrders(results);
      if (results.length === 0) {
        addToast("No orders found matching this parameter.", "info");
      } else {
        addToast(`Found ${results.length} order(s).`, "success");
      }
    } catch (err) {
      console.error("Failed to search orders", err);
      addToast("Error querying order database.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Run search if URL query param exists
  useEffect(() => {
    if (initialQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) {
      addToast("Please enter a tracking parameter.", "info");
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", searchVal.trim());
    router.replace(`?${params.toString()}`);
    lastSearchedRef.current = "";
    handleSearch(searchVal.trim());
  };

  const handleCopyId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      addToast("Order ID copied!", "success");
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case "Pending Payment":
        return "bg-amber-950/40 border-amber-700/50 text-amber-300";
      case "Payment Under Review":
        return "bg-blue-950/40 border-blue-700/50 text-blue-300";
      case "Approved":
        return "bg-emerald-950/40 border-emerald-700/50 text-emerald-300";
      case "Rejected":
        return "bg-red-950/40 border-red-700/50 text-red-300";
      case "Completed":
        return "bg-zinc-950/40 border-zinc-700/50 text-zinc-300";
      case "Cancelled":
        return "bg-zinc-950/40 border-zinc-800 text-zinc-400";
      default:
        return "bg-zinc-950 border-zinc-700 text-zinc-300";
    }
  };

  // Reusable Order Details Card Component
  const OrderDetailsCard = ({ ord }: { ord: Order }) => (
    <div key={ord.id} className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-charcoal-border/50 pb-4 gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-gold-300 select-all tracking-wide">{ord.order_id}</span>
            <button
              onClick={() => handleCopyId(ord.order_id)}
              className="text-brand-champagne/40 hover:text-gold-400 p-1 cursor-pointer transition-colors"
              title="Copy ID"
            >
              {copiedId === ord.order_id ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-[10px] text-brand-champagne/40 font-sans flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Placed on {formatDate(ord.created_at)}
          </span>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-sans font-bold border ${getStatusStyle(ord.status)}`}>
          {ord.status}
        </span>
      </div>

      {/* Customer Info Box */}
      <div className="flex flex-col gap-2.5 text-xs font-sans pb-4 border-b border-brand-charcoal-border/30">
        <span className="text-[10px] uppercase tracking-widest text-brand-champagne/40 font-semibold">Delivery To</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-brand-champagne">{ord.customer_name}</span>
            <span className="text-brand-champagne/70">{ord.shipping_address}, {ord.city}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-brand-champagne/60">Phone: {ord.phone}</span>
            {ord.email && <span className="text-brand-champagne/65">Email: {ord.email}</span>}
          </div>
        </div>
        {ord.notes && (
          <div className="text-brand-champagne/50 italic mt-1 font-light border-t border-brand-charcoal-border/25 pt-2">
            Note: &ldquo;{ord.notes}&rdquo;
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-brand-champagne/40 font-sans font-semibold">Ordered Masterpieces</span>
        <div className="flex flex-col divide-y divide-brand-charcoal-border/30">
          {ord.items && ord.items.map((oi) => (
            <div key={oi.id} className="py-3 flex items-center justify-between gap-4 text-xs font-sans first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {oi.listing_image && (
                  <img
                    src={oi.listing_image}
                    alt={oi.listing_title || "Jewelry piece"}
                    className="w-10 h-10 object-cover border border-brand-charcoal-border bg-brand-charcoal flex-shrink-0"
                  />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-brand-champagne line-clamp-1">{oi.listing_title}</span>
                  <span className="text-[9px] text-gold-400 uppercase tracking-widest font-semibold">Item Number: #{oi.item_number}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-brand-champagne">{formatPrice(oi.price)}</span>
                <span className="text-[10px] text-brand-champagne/40 block">Qty: {oi.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection notice box */}
      {ord.status === "Rejected" && ord.rejection_reason && (
        <div className="bg-red-950/20 border border-red-900/30 p-4 text-xs text-red-300 font-sans flex gap-3 items-start mt-2">
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1">Rejection Reason:</span>
            <p className="leading-relaxed">{ord.rejection_reason}</p>
            <p className="mt-2 text-[10px] text-red-400/80">Please check your details, transfer again or get in touch on Instagram DM with your Order ID.</p>
          </div>
        </div>
      )}

      {/* Payment instructions reminder on Pending */}
      {ord.status === "Pending Payment" && (
        <div className="bg-brand-charcoal border border-gold-500/10 p-4 text-xs text-brand-champagne/70 font-sans flex gap-3 items-start mt-2">
          <Info className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gold-400 block mb-0.5">Payment Required</span>
            To process this order, make a manual bank transfer of <strong className="text-gold-300">{formatPrice(ord.total)}</strong>.
            <Link href={`/payment-instructions/${ord.order_id}`} className="text-gold-400 hover:text-gold-300 font-medium inline-flex items-center gap-1 ml-1 cursor-pointer underline">
              View Payment Instructions <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Footer Total */}
      <div className="border-t border-brand-charcoal-border/50 pt-4 flex justify-between items-baseline font-sans text-xs">
        <span className="text-brand-champagne/40">Amount Total Paid/Due</span>
        <span className="font-serif text-lg font-bold text-gold-300">{formatPrice(ord.total)}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Header */}
      <div className="border-b border-brand-charcoal-border/50 pb-6 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-brand-champagne tracking-wide font-medium">
          Order Tracking
        </h1>
        <p className="text-xs text-brand-champagne/50 font-sans mt-1">
          Search, audit, and trace your pending circular fashion purchases.
        </p>
      </div>

      {/* Search form box */}
      <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-4 mb-10">
        <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-semibold">Track My Order</span>
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. RJ-2026-000001), Phone Number, or Email..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne pl-10 pr-4 py-3 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans font-medium"
            />
            <Search className="w-4 h-4 text-brand-champagne/40 absolute left-3.5 top-3.5" />
          </div>
          <Button variant="primary" size="lg" type="submit" isLoading={loading} className="px-8 cursor-pointer">
            Track Order
          </Button>
        </form>
        <p className="text-[10px] text-brand-champagne/35 font-sans leading-normal">
          * Note: Orders placed via guest checkouts can be retrieved by looking up the phone number or email registered on checkout.
        </p>
      </div>

      {/* Search results list */}
      {loading ? (
        <div className="py-20 flex justify-center border border-brand-charcoal-border/50 bg-brand-charcoal-light mb-10">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      ) : orders.length > 0 ? (
        <div className="flex flex-col gap-8 mb-10">
          <h3 className="font-serif text-xl text-brand-champagne tracking-wide font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Search Results ({orders.length})
          </h3>
          <div className="flex flex-col gap-6">
            {orders.map((ord) => (
              <OrderDetailsCard key={ord.id} ord={ord} />
            ))}
          </div>
        </div>
      ) : initialQuery && (
        <div className="text-center py-12 border border-brand-charcoal-border/50 bg-brand-charcoal-light text-brand-champagne/40 text-xs font-sans mb-10">
          No records found matching tracking lookup: <strong className="text-gold-400/90 font-mono">{initialQuery}</strong>
        </div>
      )}

      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <div className="flex flex-col gap-6 mt-6 border-t border-brand-charcoal-border/40 pt-10">
          <h3 className="font-serif text-xl text-brand-champagne tracking-wide font-medium flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-gold-400" />
            Your Recent Orders
          </h3>
          <div className="flex flex-col gap-6">
            {recentOrders.map((ord) => (
              <OrderDetailsCard key={ord.id} ord={ord} />
            ))}
          </div>
        </div>
      )}

      {recentLoading && (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-24 bg-brand-charcoal min-h-[80vh]">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto px-6 pt-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        }>
          <OrderTrackingContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
