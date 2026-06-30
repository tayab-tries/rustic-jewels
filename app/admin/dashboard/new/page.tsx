"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ArrowLeft, Save, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { productService } from "@/services/productService";
import { Category } from "@/types";

// Form Validation Schema using Zod
const productFormSchema = zod.object({
  name: zod.string().min(1, "Name is required").max(120, "Name is too long"),
  short_description: zod.string().min(1, "Short description is required").max(300, "Short description is too long"),
  full_description: zod.string().min(1, "Full description is required"),
  material: zod.string().optional(),
  collection: zod.string().optional(),
  instagram_post_url: zod.string().optional(),
  featured: zod.boolean(),
  published: zod.boolean(),
  is_available: zod.boolean(),
});

type ProductFormValues = zod.infer<typeof productFormSchema>;

export default function NewProduct() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Price States
  const [priceOnInquiry, setPriceOnInquiry] = useState(false);
  const [priceValue, setPriceValue] = useState<string>("");

  // Categories list & selection state
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Image Upload State
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load available categories from database
  useEffect(() => {
    async function loadCats() {
      try {
        const list = await productService.getCategories();
        setCategoriesList(list);
      } catch (err) {
        console.error("Error loading categories", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCats();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      short_description: "",
      full_description: "",
      material: "",
      collection: "",
      instagram_post_url: "",
      featured: false,
      published: true,
      is_available: true,
    },
  });

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

  const handleCategoryToggle = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const onSubmit = async (values: ProductFormValues) => {
    setErrorMsg(null);
    
    // Validate image selection
    if (images.length === 0) {
      setErrorMsg("Please upload at least one product image.");
      return;
    }

    // Validate category selection
    if (selectedCategoryIds.length === 0) {
      setErrorMsg("Please select at least one category for this item.");
      return;
    }

    // Process price
    let parsedPrice: number | null = null;
    if (!priceOnInquiry) {
      const parsed = parseFloat(priceValue);
      if (isNaN(parsed) || parsed < 0) {
        setErrorMsg("Please provide a valid price or check 'Price on Inquiry'.");
        return;
      }
      parsedPrice = parsed;
    }

    // Generate url-safe slug from product name
    const generatedSlug = values.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric chars
      .replace(/\s+/g, "-") // Convert spaces to dashes
      .replace(/-+/g, "-") // Collapse consecutive dashes
      .replace(/(^-|-$)+/g, ""); // Trim leading/trailing dashes

    setSaving(true);
    try {
      const res = await productService.createProduct({
        name: values.name,
        slug: generatedSlug,
        short_description: values.short_description,
        full_description: values.full_description,
        material: values.material || "",
        collection: values.collection || "",
        instagram_post_url: values.instagram_post_url || "",
        featured: values.featured,
        published: values.published,
        is_available: values.is_available,
        category_ids: selectedCategoryIds,
        price: parsedPrice,
        featured_image: images[0], // First image is cover
        gallery_images: images.slice(1), // Remaining go to gallery
      });

      if (res) {
        router.push("/admin/dashboard");
      } else {
        setErrorMsg("Failed to save the product to the database.");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during save.";
      setErrorMsg(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Header bar */}
      <header className="bg-brand-charcoal-light border-b border-brand-charcoal-border py-4 fixed top-0 left-0 right-0 z-30">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-champagne/70 hover:text-gold-400 font-sans transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="font-serif text-sm text-gold-500 uppercase tracking-widest font-semibold">
            Add New Item
          </span>
        </div>
      </header>

      {/* Main Form content */}
      <main className="min-h-screen bg-brand-charcoal pt-24 pb-20 flex flex-col">
        <div className="max-w-4xl mx-auto px-6 w-full mt-6">
          {/* Main Error display */}
          {errorMsg && (
            <div className="mb-6 bg-red-950/40 border border-red-800/40 p-4 text-xs text-red-300 font-sans flex items-start gap-2.5">
              <span className="font-bold">Error:</span>
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Metadata & Details (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6 bg-brand-charcoal-light border border-brand-charcoal-border p-6 sm:p-8">
              <h2 className="font-serif text-xl text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 mb-2 font-medium">
                Product Details
              </h2>

              {/* Title / Name Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                  Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Emerald Ring"
                  {...register("name")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                />
                {errors.name && (
                  <span className="text-[11px] text-red-400 font-sans mt-0.5">{errors.name.message}</span>
                )}
              </div>

              {/* Multi-category select checklist */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                  Categories * <span className="text-[10px] text-brand-champagne/40 lowercase normal-case">(select all that apply)</span>
                </label>
                {loadingCategories ? (
                  <div className="text-xs text-brand-champagne/40 font-sans py-2">Loading categories...</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-brand-charcoal/30 border border-brand-charcoal-border/40 p-4">
                    {categoriesList.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer select-none text-xs font-sans text-brand-champagne/80 hover:text-brand-champagne py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="accent-gold-500 cursor-pointer h-3.5 w-3.5"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Fields */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                  Price ($ USD)
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <input
                    type="number"
                    disabled={priceOnInquiry}
                    placeholder="e.g. 1200"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    className="w-full sm:w-44 bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs uppercase tracking-widest font-sans border border-brand-charcoal-border/50 bg-brand-charcoal/50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={priceOnInquiry}
                      onChange={(e) => setPriceOnInquiry(e.target.checked)}
                      className="accent-gold-500 cursor-pointer h-3.5 w-3.5"
                    />
                    <span className="text-brand-champagne/80">Inquire for Price</span>
                  </label>
                </div>
              </div>

              {/* Materials & Collection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans">
                    Materials
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18K Yellow Gold"
                    {...register("material")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans">
                    Collection
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Heritage Collection"
                    {...register("collection")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                </div>
              </div>

              {/* Short Description Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                  Short Description * <span className="text-[10px] text-brand-champagne/45 uppercase tracking-normal font-normal">(Card preview, max 300 chars)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. An exquisite yellow gold ring holding a hand-selected 2.5-carat emerald..."
                  {...register("short_description")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                />
                {errors.short_description && (
                  <span className="text-[11px] text-red-400 font-sans mt-0.5">{errors.short_description.message}</span>
                )}
              </div>

              {/* Full Description Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                  Full Story Description *
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe details regarding gemstone cuts, band sizing options, design inspirations and handcrafted history..."
                  {...register("full_description")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans resize-none"
                />
                {errors.full_description && (
                  <span className="text-[11px] text-red-400 font-sans mt-0.5">{errors.full_description.message}</span>
                )}
              </div>
            </div>

            {/* Right Column - Images & Actions (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Image upload box */}
              <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-4">
                <h2 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 font-medium">
                  Product Images *
                </h2>

                {/* Dropzone input wrapper */}
                <label className="border border-dashed border-brand-charcoal-border hover:border-gold-500/50 bg-brand-charcoal/50 p-6 text-center flex flex-col items-center gap-2 cursor-pointer transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-brand-champagne/40" />
                  )}
                  <span className="text-xs font-sans text-brand-champagne/80 mt-1">
                    {uploadingImage ? "Uploading files..." : "Click to upload product photos"}
                  </span>
                  <span className="text-[10px] text-brand-champagne/40 font-sans">
                    Supports PNG, JPG or WEBP (First file becomes COVER)
                  </span>
                </label>

                {/* Images Preview list grid */}
                {images.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-gold-400 font-sans font-semibold">Uploaded Photos:</span>
                    <div className="grid grid-cols-3 gap-2 mt-1 max-h-56 overflow-y-auto pr-1">
                      {images.map((url, idx) => (
                        <div key={idx} className={`relative aspect-square border bg-brand-charcoal ${idx === 0 ? 'border-gold-500' : 'border-brand-charcoal-border'}`}>
                          <img src={url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-650 hover:bg-red-750 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-gold-500 text-[8px] text-brand-charcoal font-sans uppercase font-bold text-center py-0.5">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status configuration details */}
              <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-4">
                <h2 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 font-medium">
                  Visibility & Status
                </h2>

                <div className="flex flex-col gap-3">
                  {/* Published/Draft Visibility toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none text-xs uppercase tracking-widest font-sans border border-brand-charcoal-border bg-brand-charcoal p-3.5">
                    <span className="text-brand-champagne/85">Publish Listing</span>
                    <input
                      type="checkbox"
                      {...register("published")}
                      className="accent-gold-500 cursor-pointer h-4 w-4"
                    />
                  </label>

                  {/* Featured toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none text-xs uppercase tracking-widest font-sans border border-brand-charcoal-border bg-brand-charcoal p-3.5">
                    <span className="text-brand-champagne/85">Feature in Showcase</span>
                    <input
                      type="checkbox"
                      {...register("featured")}
                      className="accent-gold-500 cursor-pointer h-4 w-4"
                    />
                  </label>

                  {/* Available toggle */}
                  <label className="flex items-center justify-between cursor-pointer select-none text-xs uppercase tracking-widest font-sans border border-brand-charcoal-border bg-brand-charcoal p-3.5">
                    <span className="text-brand-champagne/85">Mark In Stock</span>
                    <input
                      type="checkbox"
                      {...register("is_available")}
                      className="accent-gold-500 cursor-pointer h-4 w-4"
                    />
                  </label>
                </div>

                {/* Optional Custom Instagram inquiry Link */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans">
                    Custom Instagram Post URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://instagram.com/p/..."
                    {...register("instagram_post_url")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-2 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  <span className="text-[10px] text-brand-champagne/40 leading-relaxed font-sans">
                    Link to your matching post on Instagram. Leave blank to point inquiries to your default profile DM inbox.
                  </span>
                </div>
              </div>

              {/* Actions submit buttons block */}
              <div className="flex gap-4">
                <Link href="/admin/dashboard" className="w-1/2">
                  <Button variant="secondary" size="md" type="button" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  isLoading={saving}
                  icon={Save}
                  className="w-1/2"
                >
                  Save Item
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
