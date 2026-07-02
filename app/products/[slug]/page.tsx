"use client";

import React, { use, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, Info, ChevronLeft, ChevronRight, Share2, Check, ExternalLink, Hash, CheckCircle2, XCircle } from "lucide-react";
import { Instagram } from "@/components/ui/Icons";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { productService } from "@/services/productService";
import { Listing, ListingItem, Settings } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const Loader2 = ({ className }: { className?: string }) => (
  <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500 border-r-2 ${className}`} />
);

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialItemNum = searchParams.get("item") || "";

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [item, config] = await Promise.all([
          productService.getListingBySlug(slug),
          productService.getSettings()
        ]);
        
        setListing(item);
        setSettings(config);
        
        if (item && item.items && item.items.length > 0) {
          // If URL has an item query, match it; otherwise auto-select first available item
          let matched = item.items.find((i) => i.item_number === initialItemNum);
          if (!matched) {
            matched = item.items.find((i) => i.is_available) || item.items[0];
          }
          setSelectedItem(matched);
        }
        
        if (item) {
          const catSlugs = item.categories?.map((c) => c.slug) || [];
          const allItems = await productService.getListings();
          const related = allItems
            .filter((p) => p.id !== item.id && p.categories?.some((c) => catSlugs.includes(c.slug)))
            .slice(0, 4);
          setRelatedListings(related);
        }
      } catch (err) {
        console.error("Failed to load listing by slug", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // Handle selecting a item number
  const handleSelectItem = (item: ListingItem) => {
    setSelectedItem(item);
    const params = new URLSearchParams(searchParams.toString());
    params.set("item", item.item_number);
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleShare = async () => {
    if (!listing) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: `${listing.title} ${selectedItem ? `- Item #${selectedItem.item_number}` : ""}`,
      text: listing.short_description,
      url: shareUrl
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Web share failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        console.error("Copy link failed", err);
      }
    }
  };

  if (loading) {
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

  if (!listing) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 text-center min-h-[70vh] flex flex-col justify-center items-center">
          <div className="flex flex-col items-center gap-4 py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light w-full max-w-xl">
            <AlertCircle className="w-12 h-12 text-gold-500" />
            <h2 className="font-serif text-2xl text-brand-champagne">Catalogue Listing Not Found</h2>
            <p className="text-sm text-brand-champagne/60 font-sans max-w-md">
              The listing you are looking for might have been removed, or the slug link is incorrect.
            </p>
            <Link href="/catalog" className="mt-2">
              <Button variant="secondary" size="sm">
                Back to Catalogue
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined || price <= 0) return "Price on Inquiry";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imagesList = [listing.featured_image, ...(listing.gallery_images || [])];
  const items = listing.items || [];
  
  const isSingleProduct = items.length === 1;

  // inquiry message prefill with required item selection
  const inquiryMessage = selectedItem
    ? selectedItem.item_number && selectedItem.item_number !== "1" && selectedItem.item_number !== "N/A"
      ? `Hi! I am inquiring about "${listing.title}" (Item Number: ${selectedItem.item_number}) listed in your catalogue. Is this piece available?`
      : `Hi! I am inquiring about "${listing.title}" listed in your catalogue. Is this piece available?`
    : `Hi! I am inquiring about "${listing.title}" listed in your catalogue. Is this piece available?`;
    
  const instagramInquiryUrl = settings?.instagram_url || "https://instagram.com/rustic_jewels_instagram";

  const nextImage = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = () => {
    if (imagesList.length <= 1) return;
    setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  return (
    <>
      <Navbar />
      
      <motion.main 
        initial="initial"
        animate="animate"
        variants={pageVariants}
        className="flex-grow pt-32 pb-24 bg-brand-charcoal"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Navigation Button */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/70 hover:text-gold-400 font-sans transition-colors duration-150 mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogue</span>
          </Link>

          {/* Listing View Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Showcase Image View */}
              <div className="relative aspect-square bg-brand-charcoal-light border border-brand-charcoal-border overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIdx}
                    src={imagesList[activeImageIdx] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"}
                    alt={`${listing.title} Showcase ${activeImageIdx + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Carousel Arrow buttons if multiple images */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-charcoal/80 text-brand-champagne hover:text-gold-400 flex items-center justify-center border border-brand-charcoal-border transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-charcoal/80 text-brand-champagne hover:text-gold-400 flex items-center justify-center border border-brand-charcoal-border transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Selected Item badge floating overlay */}
                {selectedItem && (
                  <div className="absolute top-4 left-4 bg-brand-charcoal/90 text-gold-300 border border-gold-500/30 px-3.5 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold flex items-center gap-2 glass">
                    <Hash className="w-3.5 h-3.5 text-gold-400" />
                    <span>Item Number #{selectedItem.item_number}</span>
                  </div>
                )}
              </div>

              {/* Gallery thumbnails */}
              {imagesList.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-square border overflow-hidden transition-colors cursor-pointer ${
                        activeImageIdx === idx ? "border-gold-500" : "border-brand-charcoal-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Multi-Item Selection Actions Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6" id="items">
              {/* Breadcrumb & Title */}
              <div>
                <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
                  {listing.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
                </span>
                <h1 className="font-serif text-3xl md:text-4xl text-brand-champagne mt-1 tracking-wide leading-snug font-medium">
                  {listing.title}
                </h1>
              </div>

              {/* ITEM DETAILS & SELECTOR SECTION */}
              <div className="border-t border-b border-brand-charcoal-border p-5 bg-brand-charcoal-light flex flex-col gap-4">
                {/* Show Item Selector Header & Chips ONLY if listing has 2 or more items */}
                {!isSingleProduct && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-semibold flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-gold-500" />
                        Select Item Number:
                      </span>
                      {selectedItem && (
                        <span className={`text-xs font-sans font-medium flex items-center gap-1 ${selectedItem.is_available ? "text-emerald-400" : "text-amber-500"}`}>
                          {selectedItem.is_available ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Available
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Item Sold
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Item Numbers Chips Grid */}
                    {items.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                        {items.map((item) => {
                          const isSelected = selectedItem?.id === item.id || selectedItem?.item_number === item.item_number;
                          return (
                            <button
                              key={item.id || item.item_number}
                              onClick={() => handleSelectItem(item)}
                              className={`px-3 py-2 text-xs uppercase tracking-wider font-sans font-medium border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                isSelected
                                  ? "bg-gold-500 border-gold-500 text-brand-charcoal font-bold shadow-lg"
                                  : item.is_available
                                  ? "bg-brand-charcoal border-brand-charcoal-border hover:border-gold-500/50 text-brand-champagne"
                                  : "bg-brand-charcoal/40 border-brand-charcoal-border/40 text-brand-champagne/30 cursor-pointer line-through"
                              }`}
                            >
                              <span>#{item.item_number}</span>
                              {!item.is_available && (
                                <span className="text-[9px] no-underline uppercase text-amber-500 font-semibold">Sold</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-brand-champagne/50 font-sans italic">No individual items registered for this listing.</p>
                    )}
                  </>
                )}

                {/* ITEM DETAILS DISPLAY */}
                {selectedItem ? (
                  <div className={`flex flex-col gap-2 ${!isSingleProduct ? "mt-2 pt-4 border-t border-brand-charcoal-border/60" : ""}`}>
                    {selectedItem.item_name && (
                      <h4 className="font-serif text-lg text-brand-champagne font-medium">
                        {selectedItem.item_name}
                      </h4>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs uppercase tracking-widest text-brand-champagne/50 font-sans">Price</span>
                      <span className="font-serif text-2xl text-gold-300 font-semibold">
                        {formatPrice(selectedItem.price)}
                      </span>
                    </div>
                    {selectedItem.notes && (
                      <p className="text-xs text-gold-400/90 font-sans italic bg-brand-charcoal/60 p-2.5 border border-brand-charcoal-border/40 mt-1">
                        Notes: {selectedItem.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-400 font-sans">Please select an item number above to view details and inquire.</p>
                )}
              </div>

              {/* Listing Description */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold mb-2">
                  Showcase Overview
                </h3>
                <p className="text-sm text-brand-champagne/80 font-sans leading-relaxed whitespace-pre-line font-light mb-3">
                  {listing.short_description}
                </p>
                {listing.full_description && (
                  <p className="text-sm text-brand-champagne/60 font-sans leading-relaxed whitespace-pre-line font-light">
                    {listing.full_description}
                  </p>
                )}
              </div>

              {/* Listing specifications table */}
              <div className="border-t border-brand-charcoal-border/50 pt-6">
                <h3 className="text-xs uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold mb-3">
                  Specifications
                </h3>
                <dl className="grid grid-cols-2 gap-y-3 text-sm font-sans">
                  {listing.material && (
                    <>
                      <dt className="text-brand-champagne/50">Metal / Materials</dt>
                      <dd className="text-brand-champagne font-medium">{listing.material}</dd>
                    </>
                  )}
                  {listing.collection && (
                    <>
                      <dt className="text-brand-champagne/50">Collection</dt>
                      <dd className="text-brand-champagne font-medium">{listing.collection}</dd>
                    </>
                  )}
                </dl>
              </div>

              {/* Dynamic Inquiry Dual Action Buttons */}
              <div className="border-t border-brand-charcoal-border/50 pt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {/* Primary DM Inquiry button */}
                  <a
                    href={instagramInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Instagram}
                      disabled={!selectedItem}
                      className="w-full text-center"
                    >
                      {selectedItem
                        ? isSingleProduct || !selectedItem.item_number || selectedItem.item_number === "1"
                          ? "Inquire on Instagram"
                          : `Inquire for Item #${selectedItem.item_number}`
                        : "Select Item to Inquire"}
                    </Button>
                  </a>

                  {/* Dynamic Secondary "View Instagram Post" link */}
                  {listing.instagram_post_url && (
                    <a
                      href={listing.instagram_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button
                        variant="secondary"
                        size="lg"
                        icon={ExternalLink}
                        className="w-full text-center"
                      >
                        View Instagram Post
                      </Button>
                    </a>
                  )}

                  {/* Share button tool */}
                  <Button
                    variant="text"
                    size="md"
                    icon={shareCopied ? Check : Share2}
                    onClick={handleShare}
                    className="w-full border border-brand-charcoal-border hover:border-gold-500/25 py-2.5"
                  >
                    {shareCopied ? "Item Link Copied!" : "Share Item Link"}
                  </Button>
                </div>

                {/* Instruction card overlay */}
                <div className="glass border border-gold-500/10 p-4 flex gap-3 text-xs text-brand-champagne/70 font-sans leading-relaxed">
                  <Info className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gold-400 block mb-1">How to Inquire:</span>
                    When you click the primary button, you will navigate to our Instagram profile. 
                    Copy the template message below and paste it into our Direct Messages:
                    <strong className="block text-brand-champagne mt-1.5 bg-brand-charcoal/60 p-3 font-mono select-all border border-brand-charcoal-border/50 rounded-none text-[11px] leading-normal">
                      {inquiryMessage}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Listings list */}
          {relatedListings.length > 0 && (
            <div className="border-t border-brand-charcoal-border/50 pt-16 mt-16">
              <h2 className="font-serif text-2xl text-brand-champagne tracking-wide mb-8 font-medium">
                Related Collections
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedListings.map((prod) => (
                  <Card key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
