"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";

import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import { Order, Settings } from "@/types";
import { Copy, ArrowRight, ClipboardCheck, Info, Loader2, CheckCircle2 } from "lucide-react";
import { Instagram as InstagramIcon } from "@/components/ui/Icons";
import { motion } from "framer-motion";

interface PaymentInstructionsPageProps {
  params: Promise<{ orderId: string }>;
}

export default function PaymentInstructionsPage({ params }: PaymentInstructionsPageProps) {
  const { orderId } = use(params);
  const { addToast } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [orderData, settingsData] = await Promise.all([
          orderService.getOrderByOrderId(orderId),
          productService.getSettings(),
        ]);
        setOrder(orderData);
        setSettings(settingsData);
      } catch (err) {
        console.error("Failed to load payment instructions data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      addToast("Order ID copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 3000);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-24 flex items-center justify-center bg-[#F8FAFD] min-h-screen">
          <Loader2 className="w-8 h-8 text-[#7D96B5] animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 min-h-[70vh] flex flex-col justify-center items-center text-center">
          <div className="flex flex-col items-center gap-4 py-20 border border-[#DCE5EF] bg-[#FFFFFF] w-full max-w-lg shadow-xs">
            <Info className="w-12 h-12 text-[#7D96B5]" />
            <h2 className="font-serif text-2xl text-text-primary">Order Not Found</h2>
            <p className="text-xs text-text-secondary font-sans max-w-xs mt-1.5 leading-relaxed">
              We couldn&apos;t retrieve the details for Order ID: <span className="font-mono text-primary font-semibold">{orderId}</span>.
            </p>
            <Link href="/catalog" className="mt-4">
              <Button variant="secondary" size="sm">
                Return to Catalogue
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const instagramUrl = settings?.instagram_url || "https://instagram.com/rusticjewels_";

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-grow pt-32 pb-24 bg-[#F8FAFD]"
      >
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Order Success Card */}
          <div className="bg-[#FFFFFF] border border-[#DCE5EF] p-8 text-center flex flex-col items-center gap-4 mb-8">
            <CheckCircle2 className="w-12 h-12 text-[#59A870]" />
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-text-primary font-medium">Order Placed Successfully!</h1>
              <p className="text-xs text-text-secondary font-sans mt-1.5 leading-relaxed">
                Thank you for shopping with us. Your order is registered in our database under status <strong className="text-[#7D96B5]">Pending Payment</strong>.
              </p>
            </div>

            {/* Display Order ID & Total */}
            <div className="w-full max-w-md bg-[#F8FAFD] border border-[#E1E8F1] p-5 mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-sans text-center">Order ID Reference</span>
                <div className="flex items-center justify-center gap-2 bg-[#FFFFFF] border border-[#DCE5EF]/50 py-2.5 px-4 max-w-sm mx-auto w-full">
                  <strong className="text-lg md:text-xl font-mono text-[#7D96B5] font-bold select-all tracking-wider">
                    {order.order_id}
                  </strong>
                  <button
                    onClick={handleCopyId}
                    className="p-1.5 text-text-secondary hover:text-[#7D96B5] transition-colors cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copied ? <ClipboardCheck className="w-4.5 h-4.5 text-[#59A870]" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-[#E1E8F1] pt-3.5 flex justify-between items-baseline font-sans text-xs">
                <span className="text-text-secondary">Total Amount Due</span>
                <span className="font-serif text-xl font-bold text-[#7D96B5]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment details panel */}
          <div className="bg-[#FFFFFF] border border-[#DCE5EF] p-6 sm:p-8 flex flex-col gap-6 mb-8">
            <h3 className="font-serif text-xl text-text-primary border-b border-[#DCE5EF] pb-3 font-medium">
              Payment Transfer Accounts
            </h3>

            <div className="bg-[#F8FAFD] border border-[#E1E8F1] p-6 flex flex-col gap-5">
              {/* Account Title (Shared) */}
              {settings?.account_title && (
                <div className="flex justify-between items-center border-b border-[#E1E8F1] pb-4">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-sans font-bold">Account Title</span>
                  <span className="font-serif text-base font-semibold text-[#7D96B5] select-all">{settings.account_title}</span>
                </div>
              )}

              {/* Grid Column split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans">
                
                {/* Bank Transfer Details */}
                {settings?.bank_name && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#7D96B5] font-bold block border-b border-[#E1E8F1] pb-1">
                      Bank Transfer Option
                    </span>
                    <dl className="grid grid-cols-3 gap-y-2.5">
                      <dt className="text-text-secondary">Bank Name:</dt>
                      <dd className="col-span-2 text-text-primary font-medium">{settings.bank_name}</dd>

                      <dt className="text-text-secondary">Account No:</dt>
                      <dd className="col-span-2 text-[#7D96B5] font-mono font-semibold select-all">{settings.account_number}</dd>

                      {settings.iban && (
                        <>
                          <dt className="text-text-secondary">IBAN:</dt>
                          <dd className="col-span-2 text-[#7D96B5] font-mono font-semibold select-all text-[11px] break-all">{settings.iban}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                )}

                {/* Mobile Wallet Accounts */}
                {(settings?.easypaisa_number || settings?.jazzcash_number) && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#7D96B5] font-bold block border-b border-[#E1E8F1] pb-1">
                      Mobile Wallet Options
                    </span>
                    <dl className="grid grid-cols-3 gap-y-2.5">
                      {settings.easypaisa_number && (
                        <>
                          <dt className="text-text-secondary">Easypaisa:</dt>
                          <dd className="col-span-2 text-[#7D96B5] font-mono font-semibold select-all">{settings.easypaisa_number}</dd>
                        </>
                      )}
                      {settings.jazzcash_number && (
                        <>
                          <dt className="text-text-secondary">JazzCash:</dt>
                          <dd className="col-span-2 text-[#7D96B5] font-mono font-semibold select-all">{settings.jazzcash_number}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                )}

              </div>
            </div>
            {/* Instructions */}
            <div className="border-t border-[#E1E8F1] pt-5 text-xs font-sans leading-relaxed">
              <span className="font-semibold text-text-primary uppercase tracking-widest block mb-3 text-[10px]">What to do next:</span>
              <ol className="list-decimal list-inside flex flex-col gap-2.5 text-text-secondary">
                <li>Complete your manual payment transfer to one of the accounts listed above.</li>
                <li>Take a clear **screenshot** or PDF confirmation of the completed payment.</li>
                <li>Copy your unique Order ID: <span className="font-mono text-[#7D96B5] font-semibold">{order.order_id}</span>.</li>
                <li>Click the **Open Instagram** button below to open our Direct Messages.</li>
                <li>Send us both: **Payment Screenshot** and **Order ID**.</li>
              </ol>

              {settings?.payment_instructions && (
                <p className="mt-4 p-3 bg-[#F5F8FC] border border-[#DCE5EF] text-text-secondary italic leading-relaxed text-[11px]">
                  Note from Curator: {settings.payment_instructions}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#E1E8F1]">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 block"
              >
                <Button
                  variant="primary"
                  size="lg"
                  icon={InstagramIcon}
                  className="w-full text-center cursor-pointer"
                >
                  Open Instagram
                </Button>
              </a>

              <Link href={`/track-order?q=${order.order_id}`} className="w-full sm:w-1/2 block">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={ArrowRight}
                  className="w-full text-center cursor-pointer"
                >
                  Track My Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
