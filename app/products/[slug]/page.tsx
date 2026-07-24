"use client";

import React, { use, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, Info, ChevronLeft, ChevronRight, Share2, Check, ExternalLink, Hash, CheckCircle2, XCircle, ShoppingCart } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { productService } from "@/services/productService";
import { Listing, ListingItem, getListingItemPrice } from "@/types";
import { useCart } from "@/context/CartContext";

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
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [, startTransition] = useTransition();
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const item = await productService.getListingBySlug(slug);
        setListing(item);
        
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

  // Sync selected item when initialItemNum or listing changes
  useEffect(() => {
    if (listing && listing.items && listing.items.length > 0) {
      let matched = listing.items.find((i) => i.item_number === initialItemNum);
      if (!matched) {
        matched = listing.items.find((i) => i.is_available) || listing.items[0];
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItem(matched);
    }
  }, [listing, initialItemNum]);

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
        <main className="flex-grow pt-32 pb-24 flex items-center justify-center bg-[#f2f6fa] min-h-screen">
          <Loader2 className="w-8 h-8 text-[#7D96B5] animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 text-center min-h-[70vh] flex flex-col justify-center items-center bg-[#f2f6fa]">
          <div className="flex flex-col items-center gap-4 py-20 border border-[#c8d8f8] bg-white w-full max-w-xl shadow-xs">
            <AlertCircle className="w-12 h-12 text-[#7D96B5]" />
            <h2 className="font-serif text-2xl text-[#202124]">Catalogue Listing Not Found</h2>
            <p className="text-sm text-[#525B66] font-sans max-w-md">
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
  
  const hasNumberedItems = items.some((i) => i.item_number && i.item_number.trim() !== "");
  const isSingleProduct = items.length <= 1 || !hasNumberedItems;

  // Cart actions helper
  const handleAddToCart = () => {
    if (listing && selectedItem) {
      addToCart(listing, selectedItem, 1);
    }
  };

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
        className="flex-grow pt-32 pb-24 bg-[#f2f6fa]"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Navigation Button */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#525B66] hover:text-[#7D96B5] font-sans transition-colors duration-150 mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogue</span>
          </Link>

          {/* Listing View Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Showcase Image View */}
              <div className="relative aspect-square bg-white border border-[#E1E8F1] overflow-hidden shadow-xs">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 text-[#525B66] hover:text-[#7D96B5] flex items-center justify-center border border-[#E1E8F1] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 text-[#525B66] hover:text-[#7D96B5] flex items-center justify-center border border-[#E1E8F1] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Selected Item badge floating overlay */}
                {selectedItem && (
                  <div className="absolute top-4 left-4 bg-white/90 text-[#7D96B5] border border-[#c8d8f8] px-3.5 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold flex items-center gap-2 shadow-xs">
                    <Hash className="w-3.5 h-3.5 text-[#7D96B5]" />
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
                        activeImageIdx === idx ? "border-[#7D96B5]" : "border-[#E1E8F1] opacity-60 hover:opacity-100"
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
                <span className="text-xs uppercase tracking-widest text-[#7D96B5] font-sans font-semibold">
                  {listing.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
                </span>
                <h1 className="font-serif text-3xl md:text-4xl text-[#202124] mt-1 tracking-wide leading-snug font-medium">
                  {listing.title}
                </h1>
              </div>

              {/* ITEM DETAILS & SELECTOR SECTION */}
              <div className="border border-[#c8d8f8] p-5 bg-[#e2edff] flex flex-col gap-4 shadow-xs">
                {/* Show Item Selector Header & Chips ONLY if listing has 2 or more items */}
                {!isSingleProduct && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-[#7D96B5]" />
                        Select Item Number:
                      </span>
                      {selectedItem && (
                        <span className={`text-xs font-sans font-medium flex items-center gap-1 ${selectedItem.is_available ? "text-[#3E6B52]" : "text-amber-500"}`}>
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
                                  ? "bg-[#7D96B5] border-[#7D96B5] text-white font-bold shadow-sm"
                                  : item.is_available
                                  ? "bg-white border-[#DCE5EF] hover:border-[#7D96B5] text-[#202124]"
                                  : "bg-[#F4F6FE]/40 border-[#DCE5EF]/40 text-[#525B66]/30 cursor-not-allowed line-through"
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
                  (() => {
                    const originalPrice = selectedItem.price || 0;
                    const discountedPrice = getListingItemPrice(selectedItem, listing?.categories) || 0;
                    const hasDiscount = discountedPrice < originalPrice && originalPrice > 0;
                    const discountPercent = hasDiscount
                      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                      : 0;

                    return (
                      <div className={`flex flex-col gap-2 ${!isSingleProduct ? "mt-2 pt-4 border-t border-[#c8d8f8]/60" : ""}`}>
                        {selectedItem.item_name && (
                          <h4 className="font-serif text-lg text-[#202124] font-medium">
                            {selectedItem.item_name}
                          </h4>
                        )}
                        <div className="flex flex-col gap-2 mt-1">
                          <span className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold">
                            Price
                          </span>
                          <div className="flex items-baseline gap-3 flex-wrap">
                            {hasDiscount ? (
                              <>
                                <span className="font-serif text-3xl text-[#7D96B5] font-bold tracking-wide">
                                  {formatPrice(discountedPrice)}
                                </span>
                                <span className="font-serif text-base text-[#525B66]/50 line-through font-normal">
                                  {formatPrice(originalPrice)}
                                </span>
                                <span className="bg-[#FFFFFF] text-[#CF6A6A] border border-[#CF6A6A]/30 text-[10px] uppercase font-sans font-extrabold px-2.5 py-1 tracking-wider shadow-xs">
                                  {discountPercent}% OFF
                                </span>
                              </>
                            ) : (
                              <span className="font-serif text-3xl text-[#7D96B5] font-bold tracking-wide">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          {hasDiscount && (
                            <div className="text-[11px] text-[#3E6B52] font-sans font-medium tracking-wide flex items-center gap-1.5 bg-[#FFFFFF] border border-[#DCE5EF] px-3 py-1.5 w-fit shadow-xs">
                              <span>You save {formatPrice(originalPrice - discountedPrice)} ({discountPercent}% OFF)</span>
                            </div>
                          )}
                        </div>
                        {selectedItem.notes && (
                          <p className="text-xs text-[#7D96B5] font-sans italic bg-[#F4F6FE] p-2.5 border border-[#c8d8f8] mt-1">
                            Notes: {selectedItem.notes}
                          </p>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-amber-600 font-sans">Please select an item number above to view details and inquire.</p>
                )}
              </div>

              {/* Listing Description */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold mb-2">
                  Showcase Overview
                </h3>
                <p className="text-sm text-[#202124] font-sans leading-relaxed whitespace-pre-line font-light mb-3">
                  {listing.short_description}
                </p>
                {listing.full_description && (
                  <p className="text-sm text-[#525B66] font-sans leading-relaxed whitespace-pre-line font-light">
                    {listing.full_description}
                  </p>
                )}
              </div>

              {/* Listing specifications table */}
              <div className="border-t border-[#c8d8f8]/50 pt-6">
                <h3 className="text-xs uppercase tracking-widest text-[#525B66] font-sans font-semibold mb-3">
                  Specifications
                </h3>
                <dl className="grid grid-cols-2 gap-y-3 text-sm font-sans">
                  {listing.material && (
                    <>
                      <dt className="text-[#525B66]">Metal / Materials</dt>
                      <dd className="text-[#202124] font-medium">{listing.material}</dd>
                    </>
                  )}
                  {listing.collection && (
                    <>
                      <dt className="text-[#525B66]">Collection</dt>
                      <dd className="text-[#202124] font-medium">{listing.collection}</dd>
                    </>
                  )}
                </dl>
              </div>

              {/* Dynamic Cart & Action Buttons */}
              <div className="border-t border-[#c8d8f8]/50 pt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {/* Add to Cart button */}
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ShoppingCart}
                    disabled={!selectedItem || !selectedItem.is_available}
                    onClick={handleAddToCart}
                    className="w-full text-center cursor-pointer"
                  >
                    {selectedItem
                      ? !selectedItem.is_available
                        ? "Sold Out"
                        : isSingleProduct || !selectedItem.item_number || selectedItem.item_number.trim() === ""
                        ? "Add to Cart"
                        : `Add Item #${selectedItem.item_number} to Cart`
                      : "Select Item to Add"}
                  </Button>

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
                        className="w-full text-center cursor-pointer"
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
                    className="w-full border border-[#c8d8f8] hover:border-[#7D96B5] text-[#525B66] hover:text-[#7D96B5] bg-white py-2.5 cursor-pointer"
                  >
                    {shareCopied ? "Item Link Copied!" : "Share Item Link"}
                  </Button>
                </div>

                {/* Instruction card overlay */}
                <div className="bg-[#e4eefe] border border-[#c8d8f8] p-4 flex gap-3 text-xs text-[#525B66] font-sans leading-relaxed shadow-xs">
                  <Info className="w-5 h-5 text-[#7D96B5] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#202124] block mb-1">Manual Payment Checkout:</span>
                    Add your desired items to the cart and click checkout. You will be provided bank details and mobile accounts to manually transfer funds, and you will track your order using a generated Order ID.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Listings list */}
          {relatedListings.length > 0 && (
            <div className="border-t border-[#c8d8f8]/50 pt-16 mt-16">
              <h2 className="font-serif text-2xl text-[#202124] tracking-wide mb-8 font-medium">
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
