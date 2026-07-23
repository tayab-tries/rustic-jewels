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
        return "bg-[#D8A949]/15 border-[#D8A949]/30 text-[#D8A949]";
      case "Payment Under Review":
        return "bg-[#7D96B5]/15 border-[#7D96B5]/30 text-[#7D96B5]";
      case "Approved":
      case "Completed":
        return "bg-[#59A870]/15 border-[#59A870]/30 text-[#59A870]";
      case "Rejected":
        return "bg-[#CF6A6A]/15 border-[#CF6A6A]/30 text-[#CF6A6A]";
      case "Cancelled":
        return "bg-[#A3ABB5]/15 border-[#A3ABB5]/30 text-[#A3ABB5]";
      default:
        return "bg-[#7D96B5]/15 border-[#7D96B5]/30 text-[#7D96B5]";
    }
  };

  // Reusable Order Details Card Component
  const OrderDetailsCard = ({ ord }: { ord: Order }) => (
    <div key={ord.id} className="bg-[#FFFFFF] border border-[#DCE5EF] p-6 flex flex-col gap-5 rounded-2xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#DCE5EF] pb-4 gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#C9A96A] select-all tracking-wide">{ord.order_id}</span>
            <button
              onClick={() => handleCopyId(ord.order_id)}
              className="text-text-secondary hover:text-[#7D96B5] p-1 cursor-pointer transition-colors"
              title="Copy ID"
            >
              {copiedId === ord.order_id ? <ClipboardCheck className="w-3.5 h-3.5 text-[#59A870]" /> : <Clipboard className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-[10px] text-text-muted font-sans flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Placed on {formatDate(ord.created_at)}
          </span>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-sans font-bold border rounded-full ${getStatusStyle(ord.status)}`}>
          {ord.status}
        </span>
      </div>

      {/* Customer Info Box */}
      <div className="flex flex-col gap-2.5 text-xs font-sans pb-4 border-b border-[#DCE5EF]">
        <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Delivery To</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-text-primary">{ord.customer_name}</span>
            <span className="text-text-secondary">{ord.shipping_address}, {ord.city}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-text-secondary">Phone: {ord.phone}</span>
            {ord.email && <span className="text-text-secondary">Email: {ord.email}</span>}
          </div>
        </div>
        {ord.notes && (
          <div className="text-text-muted italic mt-1 font-light border-t border-border/25 pt-2">
            Note: &ldquo;{ord.notes}&rdquo;
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-text-muted font-sans font-semibold">Ordered Masterpieces</span>
        <div className="flex flex-col divide-y divide-[#DCE5EF]">
          {ord.items && ord.items.map((oi) => (
            <div key={oi.id} className="py-3 flex items-center justify-between gap-4 text-xs font-sans first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {oi.listing_image && (
                  <img
                    src={oi.listing_image}
                    alt={oi.listing_title || "Jewelry piece"}
                    className="w-10 h-10 object-cover border border-border bg-background flex-shrink-0 rounded-[10px]"
                  />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-text-primary line-clamp-1">{oi.listing_title}</span>
                  <span className="text-[9px] text-[#7D96B5] uppercase tracking-widest font-semibold">Item Number: #{oi.item_number}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-[#C9A96A]">{formatPrice(oi.price)}</span>
                <span className="text-[10px] text-text-secondary block">Qty: {oi.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection notice box */}
      {ord.status === "Rejected" && ord.rejection_reason && (
        <div className="bg-[#CF6A6A]/10 border border-[#CF6A6A]/30 p-4 text-xs text-[#CF6A6A] font-sans flex gap-3 items-start mt-2 rounded-[10px]">
          <ShieldAlert className="w-5 h-5 text-[#CF6A6A] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1">Rejection Reason:</span>
            <p className="leading-relaxed">{ord.rejection_reason}</p>
            <p className="mt-2 text-[10px] text-[#CF6A6A]/80">Please check your details, transfer again or get in touch on Instagram DM with your Order ID.</p>
          </div>
        </div>
      )}

      {/* Payment instructions reminder on Pending */}
      {ord.status === "Pending Payment" && (
        <div className="bg-[#F5F8FC] border border-[#DCE5EF] p-4 text-xs text-text-secondary font-sans flex gap-3 items-start mt-2 rounded-2xl">
          <Info className="w-5 h-5 text-[#7D96B5] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-primary block mb-0.5">Payment Required</span>
            To process this order, make a manual bank transfer of <strong className="text-[#C9A96A]">{formatPrice(ord.total)}</strong>.
            <Link href={`/payment-instructions/${ord.order_id}`} className="text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1 ml-1 cursor-pointer underline">
              View Payment Instructions <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Footer Total */}
      <div className="border-t border-[#DCE5EF] pt-4 flex justify-between items-baseline font-sans text-xs">
        <span className="text-text-secondary">Amount Total Paid/Due</span>
        <span className="font-serif text-lg font-bold text-[#C9A96A]">{formatPrice(ord.total)}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary tracking-wide font-medium">
          Order Tracking
        </h1>
        <p className="text-xs text-text-secondary font-sans mt-1">
          Search, audit, and trace your pending circular fashion purchases.
        </p>
      </div>

      {/* Search form box */}
      <div className="bg-[#FFFFFF] border border-[#DCE5EF] p-6 flex flex-col gap-4 mb-10 rounded-2xl">
        <span className="text-xs uppercase tracking-widest text-text-muted font-sans font-semibold">Track My Order</span>
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. RJ-2026-000001), Phone Number, or Email..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-border focus:border-primary text-text-primary pl-10 pr-4 py-3 text-xs rounded-[10px] focus:outline-none placeholder:text-text-light font-sans font-medium"
            />
            <Search className="w-4 h-4 text-primary absolute left-3.5 top-3.5" />
          </div>
          <Button variant="primary" size="lg" type="submit" isLoading={loading} className="px-8 cursor-pointer">
            Track Order
          </Button>
        </form>
        <p className="text-[10px] text-text-light font-sans leading-normal">
          * Note: Orders placed via guest checkouts can be retrieved by looking up the phone number or email registered on checkout.
        </p>
      </div>

      {/* Search results list */}
      {loading ? (
        <div className="py-20 flex justify-center border border-[#DCE5EF] bg-[#FFFFFF] mb-10 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length > 0 ? (
        <div className="flex flex-col gap-8 mb-10">
          <h3 className="font-serif text-xl text-text-primary tracking-wide font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#59A870]" /> Search Results ({orders.length})
          </h3>
          <div className="flex flex-col gap-6">
            {orders.map((ord) => (
              <OrderDetailsCard key={ord.id} ord={ord} />
            ))}
          </div>
        </div>
      ) : initialQuery && (
        <div className="text-center py-12 border border-[#DCE5EF] bg-[#FFFFFF] text-text-secondary text-xs font-sans mb-10 rounded-2xl">
          No records found matching tracking lookup: <strong className="text-primary font-mono">{initialQuery}</strong>
        </div>
      )}

      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <div className="flex flex-col gap-6 mt-6 border-t border-border/40 pt-10">
          <h3 className="font-serif text-xl text-text-primary tracking-wide font-medium flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-primary" />
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
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-24 bg-[#F8FAFD] min-h-[80vh]">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto px-6 pt-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        }>
          <OrderTrackingContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
