"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ArrowLeft, Save, X, Image as ImageIcon, Loader2, AlertCircle, Plus, Trash2, Hash, CheckCircle2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { productService } from "@/services/productService";
import { Category, ListingItemInput } from "@/types";

const listingFormSchema = zod.object({
  title: zod.string().min(1, "Title is required").max(120, "Title is too long"),
  short_description: zod.string().min(1, "Short description is required").max(300, "Short description is too long"),
  full_description: zod.string().min(1, "Full description is required"),
  material: zod.string().optional(),
  collection: zod.string().optional(),
  instagram_post_url: zod.string().optional(),
  featured: zod.boolean(),
  published: zod.boolean(),
});

type ListingFormValues = zod.infer<typeof listingFormSchema>;

export default function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Categories list & selection state
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // DYNAMIC INLINE ITEM MANAGER STATE
  const [items, setItems] = useState<ListingItemInput[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
  });

  // Fetch listing to edit & categories
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [p, cats] = await Promise.all([
          productService.getListingById(id),
          productService.getCategories()
        ]);

        setCategoriesList(cats);
        setLoadingCategories(false);

        if (p) {
          // Prepopulate form values
          reset({
            title: p.title,
            short_description: p.short_description,
            full_description: p.full_description,
            material: p.material || "",
            collection: p.collection || "",
            instagram_post_url: p.instagram_post_url || "",
            featured: p.featured,
            published: p.published,
          });

          setSelectedCategoryIds(p.categories?.map((c) => c.id) || []);

          // Re-assemble images array: cover first, then gallery
          const combinedImages = p.featured_image
            ? [p.featured_image, ...(p.gallery_images || [])]
            : p.gallery_images || [];
          setImages(combinedImages);

          // Prepopulate item rows
          if (p.items && p.items.length > 0) {
            const prep: ListingItemInput[] = p.items.map((it) => ({
              id: it.id,
              item_number: it.item_number,
              item_name: it.item_name || "",
              price: it.price !== undefined ? it.price : null,
              notes: it.notes || "",
              is_available: it.is_available
            }));
            setItems(prep);
          } else {
            setItems([{ item_number: "1", item_name: "", price: null, notes: "", is_available: true }]);
          }
        } else {
          setErrorMsg("The requested listing does not exist.");
        }
      } catch (err) {
        console.error("Failed to load listing to edit", err);
        setErrorMsg("Failed to load listing details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, reset]);

  // Inline Item Manager actions
  const handleAddItemRow = () => {
    const nextNum = (items.length + 1).toString();
    setItems((prev) => [
      ...prev,
      { item_number: nextNum, item_name: "", price: null, notes: "", is_available: true }
    ]);
  };

  const handleUpdateItemRow = (index: number, field: keyof ListingItemInput, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) {
      setErrorMsg("A listing must contain at least one item.");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    setErrorMsg(null);
    try {
      const filesArray = Array.from(e.target.files);
      const uploadedUrls: string[] = [];

      for (const file of filesArray) {
        const url = await productService.uploadProductImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Image upload failed", err);
      setErrorMsg("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((cId) => cId !== catId) : [...prev, catId]
    );
  };

  const onSubmit = async (values: ListingFormValues) => {
    setErrorMsg(null);

    if (images.length === 0) {
      setErrorMsg("Please upload at least one listing showcase image.");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setErrorMsg("Please select at least one category.");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Please add at least one item number for this listing.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].item_number || items[i].item_number.trim() === "") {
        setErrorMsg(`Item Row #${i + 1} is missing an Item Number.`);
        return;
      }
    }

    const generatedSlug = values.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setSaving(true);
    try {
      const featuredImg = images[0];
      const galleryImgs = images.slice(1);

      const updated = await productService.updateListing(id, {
        slug: generatedSlug,
        title: values.title,
        short_description: values.short_description,
        full_description: values.full_description,
        featured_image: featuredImg,
        gallery_images: galleryImgs,
        instagram_post_url: values.instagram_post_url,
        featured: values.featured,
        published: values.published,
        material: values.material,
        collection: values.collection,
        category_ids: selectedCategoryIds,
        items: items
      });

      if (updated) {
        router.push("/admin/dashboard");
      } else {
        setErrorMsg("Failed to update listing.");
      }
    } catch (err) {
      console.error("Error updating listing", err);
      setErrorMsg("An unexpected error occurred while updating.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-charcoal pt-32 pb-24 flex items-center justify-center text-brand-champagne">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-charcoal pt-28 pb-24 text-brand-champagne font-sans">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-brand-charcoal-border">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/60 hover:text-gold-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="font-serif text-3xl text-brand-champagne font-medium tracking-wide">
              Edit Multi-Item Listing
            </h1>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSubmit(onSubmit)}
            isLoading={saving}
          >
            Update Listing
          </Button>
        </div>

        {/* Global Error Notice */}
        {errorMsg && (
          <div className="bg-red-950/40 border border-red-800/50 p-4 mb-8 text-xs text-red-300 font-sans flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Fields (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Showcase Information Card */}
            <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 sm:p-8 flex flex-col gap-6">
              <h2 className="font-serif text-xl text-brand-champagne border-b border-brand-charcoal-border/60 pb-3 font-medium">
                Showcase Information
              </h2>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/80 font-medium">
                  Listing Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Silver Rings Collection"
                  {...register("title")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-sm rounded-none focus:outline-none"
                />
                {errors.title && <span className="text-xs text-red-400">{errors.title.message}</span>}
              </div>

              {/* Short Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/80 font-medium">
                  Short Summary *
                </label>
                <input
                  type="text"
                  placeholder="A showcase of handcrafted sterling silver rings..."
                  {...register("short_description")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-sm rounded-none focus:outline-none"
                />
                {errors.short_description && <span className="text-xs text-red-400">{errors.short_description.message}</span>}
              </div>

              {/* Full Detailed Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/80 font-medium">
                  Full Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the materials or ordering instructions..."
                  {...register("full_description")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne p-4 text-sm rounded-none focus:outline-none resize-none"
                />
                {errors.full_description && <span className="text-xs text-red-400">{errors.full_description.message}</span>}
              </div>
            </div>

            {/* DYNAMIC INLINE ITEM MANAGER CARD */}
            <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-brand-charcoal-border/60 pb-3">
                <div>
                  <h2 className="font-serif text-xl text-brand-champagne font-medium flex items-center gap-2">
                    <Hash className="w-5 h-5 text-gold-500" />
                    Numbered Items Manager
                  </h2>
                  <p className="text-xs text-brand-champagne/60 mt-1">
                    Add or modify numbered jewelry items for this showcase.
                  </p>
                </div>
                <Button variant="secondary" size="sm" type="button" icon={Plus} onClick={handleAddItemRow}>
                  Add Item Row
                </Button>
              </div>

              {/* Item Manager Dynamic Rows */}
              <div className="flex flex-col gap-4">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-brand-charcoal border border-brand-charcoal-border/70 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif text-gold-400 font-semibold flex items-center gap-1">
                        Item Row #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-red-400/80 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      {/* Item Number */}
                      <div className="sm:col-span-3 flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60">
                          Number # *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 15"
                          value={item.item_number}
                          onChange={(e) => handleUpdateItemRow(idx, "item_number", e.target.value)}
                          className="w-full bg-brand-charcoal-light border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-2 text-xs rounded-none focus:outline-none"
                        />
                      </div>

                      {/* Price */}
                      <div className="sm:col-span-4 flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60">
                          Price (PKR)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 2500"
                          value={item.price !== null && item.price !== undefined ? item.price : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateItemRow(idx, "price", val === "" ? null : parseFloat(val));
                          }}
                          className="w-full bg-brand-charcoal-light border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-2 text-xs rounded-none focus:outline-none"
                        />
                      </div>

                      {/* Status Toggle */}
                      <div className="sm:col-span-5 flex flex-col gap-1 justify-end">
                        <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60">
                          Availability Status
                        </label>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemRow(idx, "is_available", !item.is_available)}
                          className={`w-full py-2 px-3 text-xs uppercase tracking-wider font-sans border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${item.is_available
                              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                              : "bg-amber-950/40 border-amber-500/40 text-amber-300"
                            }`}
                        >
                          {item.is_available ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Available
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Marked as Sold
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Optional Item Name */}
                      <div className="sm:col-span-6 flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Optional Item Title"
                          value={item.item_name || ""}
                          onChange={(e) => handleUpdateItemRow(idx, "item_name", e.target.value)}
                          className="w-full bg-brand-charcoal-light border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-1.5 text-xs rounded-none focus:outline-none"
                        />
                      </div>
                      {/* Optional Notes */}
                      <div className="sm:col-span-6 flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Optional Notes (e.g. 18K Gold Plated)"
                          value={item.notes || ""}
                          onChange={(e) => handleUpdateItemRow(idx, "notes", e.target.value)}
                          className="w-full bg-brand-charcoal-light border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-1.5 text-xs rounded-none focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Showcase Image Upload */}
            <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 sm:p-8 flex flex-col gap-6">
              <h2 className="font-serif text-xl text-brand-champagne border-b border-brand-charcoal-border/60 pb-3 font-medium">
                Numbered Showcase Photo *
              </h2>

              <div className="relative border-2 border-dashed border-brand-charcoal-border hover:border-gold-500/50 p-8 text-center flex flex-col items-center justify-center gap-3 bg-brand-charcoal">
                <ImageIcon className="w-10 h-10 text-gold-500/60" />
                <div>
                  <p className="text-sm font-medium text-brand-champagne">Click to upload photos</p>
                  <p className="text-xs text-brand-champagne/40 mt-1">First photo acts as the main showcase image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-xs text-gold-400 font-sans mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-square bg-brand-charcoal border border-brand-charcoal-border group overflow-hidden">
                      <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-gold-500 text-brand-charcoal px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                          Main
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-950 text-red-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 sm:p-8 flex flex-col gap-6">
              <h2 className="font-serif text-xl text-brand-champagne border-b border-brand-charcoal-border/60 pb-3 font-medium">
                Attributes & Social Link
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/80 font-medium">
                    Metal / Material
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sterling Silver"
                    {...register("material")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-sm rounded-none focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/80 font-medium">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vintage Collection"
                    {...register("collection")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-sm rounded-none focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/80 font-medium">
                  Instagram Post URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/p/..."
                  {...register("instagram_post_url")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-sm rounded-none focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Controls (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Categories */}
            <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-4">
              <h3 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/60 pb-3 font-medium">
                Categories *
              </h3>

              {loadingCategories ? (
                <div className="flex items-center gap-2 text-xs text-brand-champagne/50 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : categoriesList.length === 0 ? (
                <p className="text-xs text-brand-champagne/50 py-2">No categories available.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {categoriesList.map((cat) => {
                    const checked = selectedCategoryIds.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleCategoryToggle(cat.id)}
                        className={`flex items-center justify-between p-3 border cursor-pointer transition-colors select-none ${checked
                            ? "bg-gold-500/10 border-gold-500/50 text-gold-300"
                            : "bg-brand-charcoal border-brand-charcoal-border/70 text-brand-champagne/70 hover:border-gold-500/30"
                          }`}
                      >
                        <span className="text-xs font-medium">{cat.name}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => { }}
                          className="accent-gold-500 h-4 w-4 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Visibility Settings */}
            <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-4">
              <h3 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/60 pb-3 font-medium">
                Visibility Settings
              </h3>

              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between p-3 bg-brand-charcoal border border-brand-charcoal-border cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-brand-champagne block">Published</span>
                    <span className="text-[10px] text-brand-champagne/50">Visible on storefront catalogue</span>
                  </div>
                  <input
                    type="checkbox"
                    {...register("published")}
                    className="accent-gold-500 h-4 w-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-brand-charcoal border border-brand-charcoal-border cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-brand-champagne block">Featured Listing</span>
                    <span className="text-[10px] text-brand-champagne/50">Showcase on homepage grid</span>
                  </div>
                  <input
                    type="checkbox"
                    {...register("featured")}
                    className="accent-gold-500 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Submit Action Button */}
            <Button
              variant="primary"
              size="lg"
              icon={Save}
              onClick={handleSubmit(onSubmit)}
              isLoading={saving}
              className="w-full py-4 text-center"
            >
              Update & Save Listing
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
