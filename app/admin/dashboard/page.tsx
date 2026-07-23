"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  LogOut,
  CheckCircle,
  XCircle,
  X,
  Save,
  Sparkles,
  ExternalLink,
  Settings as SettingsIcon,
  Grid,
  ShoppingBag,
  Home,
  LayoutDashboard,
  Eye,
  AlertTriangle,
  Upload,
  Loader2,
  Mail,
  ShoppingCart,
  ClipboardList,
  Calendar,
  Check,
  RotateCcw,
  Menu
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { authService } from "@/services/authService";
import { Product, Listing, Category, Settings, Order, OrderStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

// Validation schemas
const categoryFormSchema = zod.object({
  name: zod.string().min(1, "Name is required").max(60, "Name is too long"),
  slug: zod.string().min(1, "Slug is required").max(60, "Slug is too long"),
  discount_percentage: zod.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"),
});

const settingsFormSchema = zod.object({
  business_name: zod.string().min(1, "Business name is required"),
  hero_title: zod.string().min(1, "Hero title is required"),
  hero_subtitle: zod.string().min(1, "Hero subtitle is required"),
  instagram_url: zod.string().min(1, "Instagram URL is required").url("Must be a valid URL"),
  email: zod.string().min(1, "Email is required").email("Must be a valid email"),
  bank_name: zod.string().nullable().optional(),
  account_title: zod.string().nullable().optional(),
  account_number: zod.string().nullable().optional(),
  iban: zod.string().nullable().optional(),
  easypaisa_number: zod.string().nullable().optional(),
  jazzcash_number: zod.string().nullable().optional(),
  payment_instructions: zod.string().nullable().optional(),
});

type CategoryFormValues = zod.infer<typeof categoryFormSchema>;
type SettingsFormValues = zod.infer<typeof settingsFormSchema>;

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "categories" | "settings">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Modals state
  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);

  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [productToPreview, setProductToPreview] = useState<Product | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Rejection Reason Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Category Edit state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  // Settings state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsImage, setSettingsImage] = useState<string | null>(null);
  const [uploadingSettingsImage, setUploadingSettingsImage] = useState(false);

  // Toast status notices
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // React Hook Forms initialization
  const {
    register: registerCat,
    handleSubmit: handleSubmitCat,
    reset: resetCat,
    setValue: setValCat,
    formState: { errors: errorsCat },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", slug: "", discount_percentage: 0 },
  });

  const {
    register: registerSet,
    handleSubmit: handleSubmitSet,
    reset: resetSet,
    formState: { errors: errorsSet },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const email = await authService.getCurrentUserEmail();
      setUserEmail(email);

      const [productsList, categoriesList, settingsConfig, ordersList] = await Promise.all([
        productService.getListings({ includeDrafts: true }),
        productService.getCategories(),
        productService.getSettings(),
        orderService.getAdminOrders(),
      ]);

      setProducts(productsList);
      setCategories(categoriesList);
      setSettings(settingsConfig);
      setOrders(ordersList);

      // Populate Settings form
      resetSet({
        business_name: settingsConfig.business_name,
        hero_title: settingsConfig.hero_title,
        hero_subtitle: settingsConfig.hero_subtitle,
        instagram_url: settingsConfig.instagram_url,
        email: settingsConfig.email,
        bank_name: settingsConfig.bank_name || "",
        account_title: settingsConfig.account_title || "",
        account_number: settingsConfig.account_number || "",
        iban: settingsConfig.iban || "",
        easypaisa_number: settingsConfig.easypaisa_number || "",
        jazzcash_number: settingsConfig.jazzcash_number || "",
        payment_instructions: settingsConfig.payment_instructions || "",
      });
      setSettingsImage(settingsConfig.hero_image);
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
      addToast("Failed to sync database assets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [resetSet]);

  // Listen for storage events (to synchronize tabs automatically in Demo Mode)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "rustic_db_orders" ||
        e.key === "rustic_db_listings" ||
        e.key === "rustic_db_categories" ||
        e.key === "rustic_db_settings"
      ) {
        loadDashboardData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    try {
      const list = await productService.getProducts({ search: value, includeDrafts: true });
      setProducts(list);
    } catch (err) {
      console.error("Failed to query catalog", err);
    }
  };

  const handleOrderSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrderSearchQuery(value);
    try {
      const list = await orderService.getAdminOrders({
        search: value,
        status: orderStatusFilter === "all" ? undefined : orderStatusFilter,
      });
      setOrders(list);
    } catch (err) {
      console.error("Failed to query orders", err);
    }
  };

  const handleOrderStatusFilterChange = async (status: string) => {
    setOrderStatusFilter(status);
    try {
      const list = await orderService.getAdminOrders({
        search: orderSearchQuery,
        status: status === "all" ? undefined : status,
      });
      setOrders(list);
    } catch (err) {
      console.error("Failed to query orders by status", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error("Sign out failed", err);
      addToast("Failed to logout.", "error");
    }
  };

  // Product Delete
  const triggerDeleteProduct = (p: Product) => {
    setProductToDelete(p);
    setDeleteProductModalOpen(true);
  };

  const executeDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteProductLoading(true);
    try {
      const ok = await productService.deleteProduct(productToDelete.id);
      if (ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        addToast(`Deleted "${productToDelete.title}" successfully.`);
      } else {
        addToast("Failed to delete catalog item.", "error");
      }
    } catch (err) {
      addToast("An error occurred during deletion.", "error");
    } finally {
      setDeleteProductLoading(false);
      setDeleteProductModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Category CRUD submit handlers
  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    // Auto-slugify
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValCat("slug", slugVal);
  };

  const onSaveCategorySubmit = async (values: CategoryFormValues) => {
    setSavingCategory(true);
    try {
      if (editingCategory) {
        // Update category
        const res = await productService.updateCategory(editingCategory.id, {
          name: values.name,
          slug: values.slug,
          image: categoryImage,
          discount_percentage: values.discount_percentage,
        });
        if (res) {
          addToast(`Updated category "${values.name}" successfully.`);
          setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? res : c)));
          cancelCategoryEdit();
        } else {
          addToast("Failed to save category.", "error");
        }
      } else {
        // Create category
        const res = await productService.createCategory({
          name: values.name,
          slug: values.slug,
          image: categoryImage,
          discount_percentage: values.discount_percentage,
        });
        if (res) {
          addToast(`Created category "${values.name}" successfully.`);
          setCategories((prev) => [...prev, res]);
          resetCat();
          setCategoryImage(null);
        } else {
          addToast("Failed to create category.", "error");
        }
      }
    } catch (err) {
      addToast("Error occurred saving category.", "error");
    } finally {
      setSavingCategory(false);
    }
  };

  const startCategoryEdit = (cat: Category) => {
    setEditingCategory(cat);
    resetCat({
      name: cat.name,
      slug: cat.slug,
      discount_percentage: cat.discount_percentage || 0,
    });
    setCategoryImage(cat.image);
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    resetCat({ name: "", slug: "", discount_percentage: 0 });
    setCategoryImage(null);
  };

  const handleCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingCategoryImage(true);
    try {
      const file = e.target.files[0];
      const url = await productService.uploadCategoryImage(file);
      if (url) {
        setCategoryImage(url);
        addToast("Uploaded category photo.");
      }
    } catch (err) {
      addToast("Image upload failed.", "error");
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  // Category Delete
  const triggerDeleteCategory = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteCategoryModalOpen(true);
  };

  const executeDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteCategoryLoading(true);
    try {
      const ok = await productService.deleteCategory(categoryToDelete.id);
      if (ok) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        addToast(`Deleted category "${categoryToDelete.name}" successfully.`);
      } else {
        addToast("Failed to delete category.", "error");
      }
    } catch (err) {
      addToast("An error occurred during deletion.", "error");
    } finally {
      setDeleteCategoryLoading(false);
      setDeleteCategoryModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Settings Submit
  const onSaveSettingsSubmit = async (values: SettingsFormValues) => {
    if (!settingsImage) {
      addToast("Please provide a Hero background image.", "error");
      return;
    }
    setSavingSettings(true);
    try {
      const res = await productService.updateSettings({
        business_name: values.business_name,
        hero_title: values.hero_title,
        hero_subtitle: values.hero_subtitle,
        instagram_url: values.instagram_url,
        email: values.email,
        hero_image: settingsImage,
        bank_name: values.bank_name || null,
        account_title: values.account_title || null,
        account_number: values.account_number || null,
        iban: values.iban || null,
        easypaisa_number: values.easypaisa_number || null,
        jazzcash_number: values.jazzcash_number || null,
        payment_instructions: values.payment_instructions || null,
      });

      if (res) {
        setSettings(res);
        addToast("Saved settings successfully!");
      } else {
        addToast("Failed to save settings.", "error");
      }
    } catch (err) {
      addToast("Error saving configurations.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingsImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingSettingsImage(true);
    try {
      const file = e.target.files[0];
      const url = await productService.uploadProductImage(file); // Reuse general uploader
      if (url) {
        setSettingsImage(url);
        addToast("Uploaded new Hero background image.");
      }
    } catch (err) {
      addToast("Failed to upload background.", "error");
    } finally {
      setUploadingSettingsImage(false);
    }
  };

  // Order Status Updates
  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    
    // If status is rejected, open secondary modal instead
    if (status === "Rejected") {
      setRejectionReason("");
      setRejectError("");
      setRejectModalOpen(true);
      return;
    }

    setUpdatingOrderStatus(true);
    try {
      const updated = await orderService.updateOrderStatus(selectedOrder.id, status);
      if (updated) {
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        addToast(`Order ${updated.order_id} marked as ${status}.`, "success");
      } else {
        addToast("Failed to update order status.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating order status.", "error");
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const handleRejectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!rejectionReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }

    setUpdatingOrderStatus(true);
    try {
      const updated = await orderService.updateOrderStatus(
        selectedOrder.id,
        "Rejected",
        rejectionReason.trim()
      );
      if (updated) {
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        addToast(`Order ${updated.order_id} marked as Rejected.`, "success");
        setRejectModalOpen(false);
      } else {
        addToast("Failed to update order status.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating order status.", "error");
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  // Price formatter helper
  const formatPrice = (items?: Listing["items"]) => {
    if (!items || items.length === 0) return "Price on Inquiry";
    const prices = items.map((i) => i.price).filter((p): p is number => p !== null && p !== undefined && p > 0);
    if (prices.length === 0) return "Price on Inquiry";
    const minPrice = Math.min(...prices);
    const formatted = new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(minPrice);
    return `From ${formatted}`;
  };

  const formatRawPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending Payment":
        return "bg-amber-950/40 border-amber-800/40 text-amber-400";
      case "Payment Under Review":
        return "bg-blue-950/40 border-blue-800/40 text-blue-400";
      case "Approved":
        return "bg-emerald-950/40 border-emerald-800/40 text-emerald-400";
      case "Rejected":
        return "bg-red-950/40 border-red-800/40 text-red-400";
      case "Completed":
        return "bg-zinc-900 border-zinc-700 text-zinc-300";
      case "Cancelled":
        return "bg-zinc-950 border-zinc-800 text-zinc-500";
      default:
        return "bg-zinc-900 border-zinc-750 text-zinc-300";
    }
  };

  return (
    <>
      <div className="min-h-screen bg-brand-charcoal flex text-brand-champagne font-sans">
        
        {/* TOAST ALERTS OVERLAYS CONTAINER */}
        <div className="fixed top-6 right-6 z-55 flex flex-col gap-3">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`flex items-center gap-3 px-5 py-4 border shadow-xl w-72 text-xs font-sans font-semibold rounded-none ${
                  t.type === "error"
                    ? "bg-red-950/90 border-red-800 text-red-300"
                    : t.type === "info"
                    ? "bg-brand-charcoal-light/95 border-brand-charcoal-border text-gold-400"
                    : "bg-emerald-950/90 border-emerald-800 text-emerald-300"
                }`}
              >
                {t.type === "error" ? (
                  <XCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                )}
                <span>{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile Header (visible on mobile/tablet) */}
        <header className="lg:hidden w-full h-16 bg-brand-charcoal-light border-b border-brand-charcoal-border flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
          <div className="flex flex-col">
            <span className="font-serif text-sm tracking-widest text-brand-champagne uppercase font-light">
              Rustic <span className="font-normal text-gold-500">Jewels</span>
            </span>
            <span className="text-[7px] uppercase tracking-[0.2em] text-gold-500/80 -mt-1 font-sans">
              Admin Workspace
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-brand-champagne hover:text-gold-400 focus:outline-none cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          />
        )}

        {/* SIDEBAR NAVIGATION (LEFT SECTION) */}
        <aside
          className={`w-64 bg-brand-charcoal-light border-r border-brand-charcoal-border flex flex-col fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo brand box */}
          <div className="p-6 border-b border-brand-charcoal-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-widest text-brand-champagne uppercase font-light">
                Rustic <span className="font-normal text-gold-500">Jewels</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-gold-500/80 -mt-1 font-sans">
                Admin Workspace
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-brand-champagne hover:text-red-400 focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile session summary */}
          {userEmail && (
            <div className="px-6 py-4 border-b border-brand-charcoal-border bg-brand-charcoal/30 flex flex-col gap-0.5">
              <span className="text-[8px] uppercase tracking-widest text-brand-champagne/40">Logged in as:</span>
              <span className="text-[10px] font-mono text-brand-champagne/70 line-clamp-1">{userEmail}</span>
            </div>
          )}

          {/* Navigation link elements */}
          <nav className="flex-grow p-4 flex flex-col gap-1.5 mt-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "orders", label: "Orders", icon: ShoppingCart },
              { id: "products", label: "Products", icon: ShoppingBag },
              { id: "categories", label: "Categories", icon: Grid },
              { id: "settings", label: "Settings", icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    cancelCategoryEdit();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 text-xs uppercase tracking-widest font-sans border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-gold-500/10 border-gold-500 text-gold-400 font-bold"
                      : "bg-transparent border-transparent text-brand-champagne/70 hover:text-brand-champagne hover:bg-brand-charcoal/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-gold-400" : "text-brand-champagne/50"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Action Footer */}
          <div className="p-4 border-t border-brand-charcoal-border">
            <button
              onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-4.5 py-3 text-xs uppercase tracking-widest font-sans border border-transparent hover:border-red-900/30 text-brand-champagne/60 hover:text-red-400 hover:bg-red-950/10 transition-colors duration-150 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-brand-champagne/40" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* WORKSPACE AREA CONTENT PANEL (RIGHT SECTION) */}
        <main className="flex-grow lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col min-w-0 overflow-x-hidden">
          <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto flex-grow flex flex-col min-w-0 overflow-hidden">

            {/* TAB CONTAINER 1: OVERVIEW STATISTICS PANEL */}
            {activeTab === "dashboard" && (
              <div className="flex flex-col gap-8 flex-grow">
                {/* Intro summary header */}
                <div>
                  <h1 className="font-serif text-3xl text-brand-champagne tracking-wide font-medium">
                    Dashboard Overview
                  </h1>
                  <p className="text-xs text-brand-champagne/50 font-sans mt-1">
                    Snapshot details of orders, catalog items, collections, and configurations.
                  </p>
                </div>

                {/* Counter Metric badges grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Badge 1: Pending Orders */}
                  <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold">Pending Payments</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-4xl font-serif text-amber-400 font-normal">
                        {orders.filter((o) => o.status === "Pending Payment" || o.status === "Payment Under Review").length}
                      </strong>
                      <span className="text-[10px] text-brand-champagne/40 font-sans">awaiting review</span>
                    </div>
                  </div>

                  {/* Badge 2: Total Listings */}
                  <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold">Catalogue Products</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-4xl font-serif text-gold-400 font-normal">{products.length}</strong>
                      <span className="text-[10px] text-brand-champagne/40 font-sans">published & drafts</span>
                    </div>
                  </div>

                  {/* Badge 3: Featured items */}
                  <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold">Featured Showcase Pieces</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-4xl font-serif text-gold-400 font-normal">
                        {products.filter((p) => p.featured).length}
                      </strong>
                      <span className="text-[10px] text-brand-champagne/40 font-sans">on homepage</span>
                    </div>
                  </div>

                  {/* Badge 4: Categories count */}
                  <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-brand-champagne/50 font-sans font-semibold">Dynamic Collections</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-4xl font-serif text-gold-400 font-normal">{categories.length}</strong>
                      <span className="text-[10px] text-brand-champagne/40 font-sans">active categories</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recently Added items listing */}
                  <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-brand-charcoal-border/50 pb-3 mb-2">
                      <h2 className="font-serif text-xl text-brand-champagne font-medium">Recently Added Pieces</h2>
                      <button
                        onClick={() => setActiveTab("products")}
                        className="text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300 font-sans cursor-pointer transition-colors"
                      >
                        View All Products →
                      </button>
                    </div>

                    {loading ? (
                      <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>
                    ) : products.length === 0 ? (
                      <div className="py-10 text-center text-xs text-brand-champagne/40 font-sans">No products found.</div>
                    ) : (
                      <div className="flex flex-col divide-y divide-brand-charcoal-border/40">
                        {products.slice(0, 4).map((p) => (
                          <div key={p.id} className="py-3.5 flex items-center justify-between gap-4 text-xs font-sans first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <img src={p.featured_image} alt={p.title} className="w-10 h-10 object-cover border border-brand-charcoal-border flex-shrink-0 bg-brand-charcoal" />
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-brand-champagne">{p.title}</span>
                                <span className="text-[10px] text-brand-champagne/40">
                                  {p.categories?.map((c) => c.name).join(", ") || "No Category"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="font-medium text-gold-400/80">{formatPrice(p.items)}</span>
                              <div className="flex items-center gap-3.5">
                                <button
                                  onClick={() => {
                                    setProductToPreview(p);
                                    setPreviewModalOpen(true);
                                  }}
                                  className="text-brand-champagne/50 hover:text-gold-400 p-1 cursor-pointer transition-colors"
                                  title="Quick Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/admin/dashboard/edit/${p.id}`}
                                  className="text-brand-champagne/50 hover:text-gold-400 p-1 cursor-pointer transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Orders Overview */}
                  <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-brand-charcoal-border/50 pb-3 mb-2">
                      <h2 className="font-serif text-xl text-brand-champagne font-medium">Recent Orders</h2>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300 font-sans cursor-pointer transition-colors"
                      >
                        View All Orders →
                      </button>
                    </div>

                    {loading ? (
                      <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>
                    ) : orders.length === 0 ? (
                      <div className="py-10 text-center text-xs text-brand-champagne/40 font-sans">No orders registered yet.</div>
                    ) : (
                      <div className="flex flex-col divide-y divide-brand-charcoal-border/40">
                        {orders.slice(0, 4).map((o) => (
                          <div
                            key={o.id}
                            onClick={() => {
                              setSelectedOrder(o);
                              setOrderDetailModalOpen(true);
                            }}
                            className="py-3.5 flex items-center justify-between gap-4 text-xs font-sans first:pt-0 last:pb-0 cursor-pointer hover:bg-brand-charcoal/10 px-2 transition-all"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono font-semibold text-brand-champagne">{o.order_id}</span>
                              <span className="text-[10px] text-brand-champagne/40">
                                By {o.customer_name} • {formatDate(o.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="font-medium text-gold-300">{formatRawPrice(o.total)}</span>
                              <span className={`px-2 py-0.5 text-[8px] uppercase tracking-widest font-semibold border ${getStatusBadge(o.status)}`}>
                                {o.status.split(" ")[0]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTAINER 2: ORDERS MANAGEMENT */}
            {activeTab === "orders" && (
              <div className="flex flex-col gap-8 flex-grow">
                <div>
                  <h1 className="font-serif text-3xl text-brand-champagne tracking-wide font-medium">
                    Order Transactions
                  </h1>
                  <p className="text-xs text-brand-champagne/50 font-sans mt-1">
                    Manage manual billing verifications, process approvals, or cancel customer checkout carts.
                  </p>
                </div>

                {/* Filter and search controls */}
                <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search orders (ID, Name, Phone)..."
                      value={orderSearchQuery}
                      onChange={handleOrderSearchChange}
                      className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne pl-9 pr-4 py-2 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/30 font-sans"
                    />
                    <Search className="w-3.5 h-3.5 text-brand-champagne/40 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto py-1">
                    <span className="text-[10px] uppercase tracking-widest text-brand-champagne/45 font-sans font-bold flex-shrink-0">Filter Status:</span>
                    <div className="flex gap-1">
                      {["all", "Pending Payment", "Payment Under Review", "Approved", "Rejected", "Completed", "Cancelled"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleOrderStatusFilterChange(status)}
                          className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-sans border transition-all cursor-pointer whitespace-nowrap ${
                            orderStatusFilter === status
                              ? "bg-gold-500 border-gold-500 text-brand-charcoal font-bold"
                              : "bg-brand-charcoal border-brand-charcoal-border hover:border-gold-500/50 text-brand-champagne/70"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Orders table */}
                {loading ? (
                  <div className="flex justify-center py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light flex flex-col items-center gap-4">
                    <span className="font-serif text-lg text-brand-champagne/50">No orders found</span>
                    <p className="text-xs text-brand-champagne/40 font-sans max-w-xs leading-relaxed">
                      Verify that status filters or search parameters match active transaction requests.
                    </p>
                  </div>
                ) : (
                  <div className="border border-brand-charcoal-border bg-brand-charcoal-light overflow-x-auto w-full max-w-full">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="border-b border-brand-charcoal-border/70 text-[10px] sm:text-xs font-sans uppercase tracking-widest text-brand-champagne/55 bg-brand-charcoal/50">
                          <th className="p-2.5 sm:p-4 pl-3 sm:pl-6 w-24 sm:w-32">Order ID</th>
                          <th className="p-2.5 sm:p-4">Customer Details</th>
                          <th className="p-2.5 sm:p-4 w-24 sm:w-32">Date</th>
                          <th className="p-2.5 sm:p-4 w-24 sm:w-28">Amount</th>
                          <th className="p-2.5 sm:p-4 w-28 sm:w-36 text-center">Status</th>
                          <th className="p-2.5 sm:p-4 w-20 sm:w-24 text-right pr-3 sm:pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-charcoal-border/40 text-xs font-sans">
                        {orders.map((o) => (
                          <tr
                            key={o.id}
                            className="hover:bg-brand-charcoal/20 transition-all cursor-pointer"
                            onClick={() => {
                              setSelectedOrder(o);
                              setOrderDetailModalOpen(true);
                            }}
                          >
                            <td className="p-2.5 sm:p-4 pl-3 sm:pl-6 font-mono font-semibold text-gold-300">{o.order_id}</td>
                            <td className="p-2.5 sm:p-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-brand-champagne">{o.customer_name}</span>
                                <span className="text-[9px] sm:text-[10px] text-brand-champagne/45 font-mono">
                                  Phone: {o.phone}
                                </span>
                              </div>
                            </td>
                            <td className="p-2.5 sm:p-4 text-brand-champagne/70">{formatDate(o.created_at)}</td>
                            <td className="p-2.5 sm:p-4 text-gold-400 font-semibold">{formatRawPrice(o.total)}</td>
                            <td className="p-2.5 sm:p-4 text-center">
                              <span className={`px-2 py-0.5 text-[9px] uppercase font-sans font-bold border whitespace-nowrap ${getStatusBadge(o.status)}`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="p-2.5 sm:p-4 text-right pr-3 sm:pr-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(o);
                                  setOrderDetailModalOpen(true);
                                }}
                                className="text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300 font-sans border border-brand-charcoal-border/60 hover:border-gold-500/50 bg-brand-charcoal px-3 py-1.5 transition-all cursor-pointer"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTAINER 3: INVENTORY PRODUCTS LISTING TABLE */}
            {activeTab === "products" && (
              <div className="flex flex-col gap-8 flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-3xl text-brand-champagne tracking-wide font-medium">
                      Inventory Management
                    </h1>
                    <p className="text-xs text-brand-champagne/50 font-sans mt-1">
                      Modify, review, or delete items within the digital catalogue grid.
                    </p>
                  </div>
                  <Link href="/admin/dashboard/new">
                    <Button variant="primary" size="md" icon={Plus}>
                      Add Jewellery Item
                    </Button>
                  </Link>
                </div>

                {/* Filtering controls */}
                <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne pl-9 pr-4 py-2 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/30 font-sans"
                    />
                    <Search className="w-3.5 h-3.5 text-brand-champagne/40 absolute left-3 top-2.5" />
                  </div>
                  <div className="text-xs font-sans text-brand-champagne/60 tracking-wider uppercase font-semibold">
                    Total Products: <strong className="text-gold-400 font-bold">{products.length}</strong>
                  </div>
                </div>

                {/* Grid Table */}
                {loading ? (
                  <div className="flex justify-center py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20 border border-brand-charcoal-border/50 bg-brand-charcoal-light flex flex-col items-center gap-4">
                    <span className="font-serif text-lg text-brand-champagne/50">No items found</span>
                    <p className="text-xs text-brand-champagne/40 font-sans max-w-xs leading-relaxed">
                      Add a new piece using the button above or search for another term.
                    </p>
                  </div>
                ) : (
                  <div className="border border-brand-charcoal-border bg-brand-charcoal-light overflow-x-auto w-full max-w-full">
                    <table className="w-full text-left border-collapse min-w-[580px]">
                      <thead>
                        <tr className="border-b border-brand-charcoal-border/70 text-[10px] sm:text-xs font-sans uppercase tracking-widest text-brand-champagne/55 bg-brand-charcoal/50">
                          <th className="p-2.5 sm:p-4 pl-3 sm:pl-6 w-16 sm:w-20">Preview</th>
                          <th className="p-2.5 sm:p-4">Item Details</th>
                          <th className="p-2.5 sm:p-4 w-20 sm:w-28">Category</th>
                          <th className="p-2.5 sm:p-4 w-20 sm:w-28">Price</th>
                          <th className="p-2.5 sm:p-4 w-20 sm:w-24 text-center">Featured</th>
                          <th className="p-2.5 sm:p-4 w-20 sm:w-24 text-center">Status</th>
                          <th className="p-2.5 sm:p-4 w-24 sm:w-32 text-right pr-3 sm:pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-charcoal-border/40 text-xs font-sans">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-brand-charcoal/20 transition-colors duration-150">
                            <td className="p-2.5 sm:p-4 pl-3 sm:pl-6">
                              <img src={p.featured_image} alt={p.title} className="w-10 h-10 sm:w-12 sm:h-12 object-cover border border-brand-charcoal-border bg-brand-charcoal" />
                            </td>
                            <td className="p-2.5 sm:p-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-serif text-sm font-semibold text-brand-champagne line-clamp-1">{p.title}</span>
                                <span className="text-[10px] text-brand-champagne/44 line-clamp-1 max-w-xs">
                                  {p.material || "No Materials"} {p.collection ? `• ${p.collection}` : ""}
                                </span>
                              </div>
                            </td>
                            <td className="p-2.5 sm:p-4 text-brand-champagne/80 font-medium">
                              {p.categories?.map((c) => c.name).join(", ") || "None"}
                            </td>
                            <td className="p-2.5 sm:p-4 text-gold-400 font-medium">{formatPrice(p.items)}</td>
                            <td className="p-2.5 sm:p-4 text-center">
                              <div className="flex justify-center">
                                {p.featured ? <Sparkles className="w-4 h-4 text-gold-400" /> : <span className="text-brand-champagne/20">—</span>}
                              </div>
                            </td>
                            <td className="p-2.5 sm:p-4 text-center">
                              <span className={`px-2 py-0.5 text-[9px] uppercase font-sans font-bold border ${
                                p.published 
                                  ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-400" 
                                  : "bg-amber-950/30 border-amber-800/40 text-amber-400"
                              }`}>
                                {p.published ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="p-2.5 sm:p-4 text-right pr-3 sm:pr-6">
                              <div className="flex justify-end gap-2.5">
                                <button
                                  onClick={() => {
                                    setProductToPreview(p);
                                    setPreviewModalOpen(true);
                                  }}
                                  className="text-brand-champagne/50 hover:text-gold-400 p-1.5 cursor-pointer border border-transparent hover:border-brand-charcoal-border hover:bg-brand-charcoal transition-all"
                                  title="Quick Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <Link href={`/admin/dashboard/edit/${p.id}`}>
                                  <button
                                    className="text-brand-champagne/50 hover:text-gold-400 p-1.5 cursor-pointer border border-transparent hover:border-brand-charcoal-border hover:bg-brand-charcoal transition-all"
                                    title="Edit Item"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => triggerDeleteProduct(p)}
                                  className="text-brand-champagne/50 hover:text-red-400 p-1.5 cursor-pointer border border-transparent hover:border-brand-charcoal-border hover:bg-brand-charcoal transition-all"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTAINER 4: CATEGORY CRUD MANAGEMENT PANELS */}
            {activeTab === "categories" && (
              <div className="flex flex-col gap-8 flex-grow">
                <div>
                  <h1 className="font-serif text-3xl text-brand-champagne tracking-wide font-medium">
                    Category Management
                  </h1>
                  <p className="text-xs text-brand-champagne/50 font-sans mt-1">
                    Manage collection archives, slugs, and cover backdrops.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Side: Create / Edit Category Panel (5 cols) */}
                  <div className="lg:col-span-5 bg-brand-charcoal-light border border-brand-charcoal-border p-6 flex flex-col gap-5">
                    <h2 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 font-medium">
                      {editingCategory ? "Edit Category" : "Create New Category"}
                    </h2>

                    <form onSubmit={handleSubmitCat(onSaveCategorySubmit)} className="flex flex-col gap-4">
                      {/* Name input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Category Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Brooches"
                          {...registerCat("name", { onChange: handleCategoryNameChange })}
                          className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-2 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                        />
                        {errorsCat.name && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsCat.name.message}</span>}
                      </div>

                      {/* Slug input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">URL Slug *</label>
                        <input
                          type="text"
                          placeholder="e.g. brooches"
                          {...registerCat("slug")}
                          className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-2 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans font-mono"
                        />
                        {errorsCat.slug && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsCat.slug.message}</span>}
                      </div>

                      {/* Image Upload for Category */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Category cover photo</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer border border-brand-charcoal-border bg-brand-charcoal hover:border-gold-500/50 px-3 py-2 text-[10px] uppercase tracking-widest font-sans text-brand-champagne/70 hover:text-brand-champagne transition-all">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCategoryImageChange}
                              className="hidden"
                            />
                            {uploadingCategoryImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>Upload</span>
                          </label>
                          {categoryImage && (
                            <div className="relative w-10 h-10 border border-brand-charcoal-border bg-brand-charcoal flex-shrink-0">
                              <img src={categoryImage} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setCategoryImage(null)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
 
                      {/* Discount input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Category Discount (%)</label>
                        <input
                          type="number"
                          placeholder="e.g. 15"
                          min="0"
                          max="100"
                          {...registerCat("discount_percentage", { valueAsNumber: true })}
                          className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-3 py-2 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                        />
                        {errorsCat.discount_percentage && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsCat.discount_percentage.message}</span>}
                      </div>

                      {/* Buttons Action */}
                      <div className="flex gap-3 mt-2">
                        {editingCategory && (
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            className="w-1/2"
                            onClick={cancelCategoryEdit}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          isLoading={savingCategory}
                          icon={Plus}
                          className={editingCategory ? "w-1/2" : "w-full"}
                        >
                          {editingCategory ? "Save Category" : "Add Category"}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Right Side: Category Table List (7 cols) */}
                  <div className="lg:col-span-7 bg-brand-charcoal-light border border-brand-charcoal-border p-4 sm:p-6 flex flex-col gap-4 overflow-x-auto w-full max-w-full">
                    <h2 className="font-serif text-lg text-brand-champagne border-b border-brand-charcoal-border/50 pb-3 font-medium">
                      Active Collections
                    </h2>

                    {categories.length === 0 ? (
                      <div className="text-center py-10 text-xs text-brand-champagne/45 font-sans">No categories found.</div>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[360px]">
                        <thead>
                          <tr className="border-b border-brand-charcoal-border/70 text-[10px] font-sans uppercase tracking-widest text-brand-champagne/55 bg-brand-charcoal/50">
                            <th className="p-2 pl-3 w-14">Cover</th>
                            <th className="p-2">Category Info</th>
                            <th className="p-2 w-32">Slug</th>
                            <th className="p-2 w-20 text-right pr-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-charcoal-border/40 text-xs font-sans">
                          {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-brand-charcoal/20 transition-all">
                              <td className="p-2 pl-3">
                                {cat.image ? (
                                  <img src={cat.image} alt={cat.name} className="w-8 h-8 object-cover border border-brand-charcoal-border bg-brand-charcoal" />
                                ) : (
                                  <div className="w-8 h-8 border border-brand-charcoal-border bg-brand-charcoal/30 flex items-center justify-center text-[9px] text-brand-champagne/20">None</div>
                                )}
                              </td>
                              <td className="p-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-brand-champagne text-sm">{cat.name}</span>
                                  {cat.discount_percentage ? (
                                    <span className="text-[9px] text-red-400 font-semibold uppercase">
                                      {cat.discount_percentage}% OFF
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="p-2 font-mono text-[10px] text-brand-champagne/50">{cat.slug}</td>
                              <td className="p-2 text-right pr-3">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => startCategoryEdit(cat)}
                                    className="text-brand-champagne/50 hover:text-gold-400 p-1 cursor-pointer transition-colors"
                                    title="Edit Category"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => triggerDeleteCategory(cat)}
                                    className="text-brand-champagne/50 hover:text-red-400 p-1 cursor-pointer transition-colors"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTAINER 5: BRAND GLOBAL SETTINGS EDIT FORM */}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-8 flex-grow">
                <div>
                  <h1 className="font-serif text-3xl text-brand-champagne tracking-wide font-medium">
                    Global Settings & Manual Billing
                  </h1>
                  <p className="text-xs text-brand-champagne/50 font-sans mt-1">
                    Manage brand configurations, visual sliders, manual bank information, and Instagram credentials.
                  </p>
                </div>

                <div className="bg-brand-charcoal-light border border-brand-charcoal-border p-8 sm:p-10 max-w-3xl">
                  <form onSubmit={handleSubmitSet(onSaveSettingsSubmit)} className="flex flex-col gap-6">
                    {/* General Section */}
                    <div>
                      <h3 className="font-serif text-base text-brand-champagne border-b border-brand-charcoal-border/50 pb-2 mb-4 font-semibold">
                        General Settings
                      </h3>
                      <div className="flex flex-col gap-4">
                        {/* Business Name */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Business name *</label>
                          <input
                            type="text"
                            placeholder="Rustic Jewels"
                            {...registerSet("business_name")}
                            className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                          />
                          {errorsSet.business_name && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsSet.business_name.message}</span>}
                        </div>

                        {/* Hero Title */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Hero banner title *</label>
                          <input
                            type="text"
                            placeholder="Timeless Elegance Handcrafted for You"
                            {...registerSet("hero_title")}
                            className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                          />
                          {errorsSet.hero_title && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsSet.hero_title.message}</span>}
                        </div>

                        {/* Hero Subtitle */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Hero banner subtitle *</label>
                          <textarea
                            rows={2}
                            placeholder="Browse our curated collection of fine artisan jewellery..."
                            {...registerSet("hero_subtitle")}
                            className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans resize-none"
                          />
                          {errorsSet.hero_subtitle && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsSet.hero_subtitle.message}</span>}
                        </div>

                        {/* Hero Image file uploader */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Hero cover background photo *</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer border border-brand-charcoal-border bg-brand-charcoal hover:border-gold-500/50 px-4 py-3 text-xs uppercase tracking-widest font-sans text-brand-champagne/70 hover:text-brand-champagne transition-all">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleSettingsImageChange}
                                className="hidden"
                              />
                              {uploadingSettingsImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                              <span>Upload new background</span>
                            </label>
                            {settingsImage && (
                              <div className="relative w-16 h-12 border border-brand-charcoal-border bg-brand-charcoal flex-shrink-0">
                                <img src={settingsImage} alt="hero background" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setSettingsImage(null)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-650 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Instagram link */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Instagram Profile URL *</label>
                            <input
                              type="text"
                              placeholder="https://instagram.com/..."
                              {...registerSet("instagram_url")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                            />
                            {errorsSet.instagram_url && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsSet.instagram_url.message}</span>}
                          </div>

                          {/* Email address */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Inquiries Email *</label>
                            <input
                              type="email"
                              placeholder="contact@rusticjewels.com"
                              {...registerSet("email")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                            />
                            {errorsSet.email && <span className="text-[10px] text-red-400 font-sans mt-0.5">{errorsSet.email.message}</span>}
                          </div>
                        </div>

                        {/* Settings Form Footer Spacer */}
                      </div>
                    </div>

                    {/* Payment / Accounts Section */}
                    <div className="mt-6 pt-6 border-t border-brand-charcoal-border/50">
                      <h3 className="font-serif text-base text-brand-champagne border-b border-brand-charcoal-border/50 pb-2 mb-4 font-semibold">
                        Manual Payment Accounts
                      </h3>
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Bank Name */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Bank Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Habib Bank Limited"
                              {...registerSet("bank_name")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                            />
                          </div>

                          {/* Account Title */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Account Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Rustic Jewels"
                              {...registerSet("account_title")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Account Number */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Account Number</label>
                            <input
                              type="text"
                              placeholder="e.g. 1234567890123"
                              {...registerSet("account_number")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                            />
                          </div>

                          {/* IBAN */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">IBAN Number</label>
                            <input
                              type="text"
                              placeholder="e.g. PK00HABB01234..."
                              {...registerSet("iban")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Easypaisa */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Easypaisa Mobile Wallet No.</label>
                            <input
                              type="text"
                              placeholder="e.g. 03001234567"
                              {...registerSet("easypaisa_number")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans font-mono"
                            />
                          </div>

                          {/* JazzCash */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">JazzCash Mobile Wallet No.</label>
                            <input
                              type="text"
                              placeholder="e.g. 03009876543"
                              {...registerSet("jazzcash_number")}
                              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans font-mono"
                            />
                          </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans font-semibold">Buyer Payment Instructions</label>
                          <textarea
                            rows={3}
                            placeholder="Please transfer manual payments to bank or mobile wallets..."
                            {...registerSet("payment_instructions")}
                            className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-brand-charcoal-border/50">
                      <Button
                        variant="primary"
                        size="lg"
                        type="submit"
                        isLoading={savingSettings}
                        icon={Save}
                      >
                        Save Configurations
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CONFIRMATION OVERLAY MODAL: PRODUCT DELETION */}
      <Modal
        isOpen={deleteProductModalOpen}
        onClose={() => setDeleteProductModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="flex flex-col gap-4 text-sm font-sans py-2">
          <div className="flex gap-3 items-start bg-red-950/20 border border-red-900/30 p-4 mb-2 text-red-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Warning: Deletion is Permanent</span>
              This action cannot be undone and will immediately remove the piece from the public catalogue.
            </div>
          </div>
          <p className="text-brand-champagne/80 leading-relaxed">
            Are you sure you want to delete <strong className="text-brand-champagne">&quot;{productToDelete?.title}&quot;</strong>?
          </p>
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-brand-charcoal-border/50">
            <Button
              variant="text"
              size="sm"
              onClick={() => setDeleteProductModalOpen(false)}
              disabled={deleteProductLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={executeDeleteProduct}
              isLoading={deleteProductLoading}
            >
              Delete Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION OVERLAY MODAL: CATEGORY DELETION */}
      <Modal
        isOpen={deleteCategoryModalOpen}
        onClose={() => setDeleteCategoryModalOpen(false)}
        title="Confirm Category Deletion"
      >
        <div className="flex flex-col gap-4 text-sm font-sans py-2">
          <div className="flex gap-3 items-start bg-red-950/20 border border-red-900/30 p-4 mb-2 text-red-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Warning: Deletion is Permanent</span>
              Removing this category will automatically break mappings for all products assigned to it.
            </div>
          </div>
          <p className="text-brand-champagne/80 leading-relaxed">
            Are you sure you want to delete <strong className="text-brand-champagne">&quot;{categoryToDelete?.name}&quot;</strong>?
          </p>
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-brand-charcoal-border/50">
            <Button
              variant="text"
              size="sm"
              onClick={() => setDeleteCategoryModalOpen(false)}
              disabled={deleteCategoryLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={executeDeleteCategory}
              isLoading={deleteCategoryLoading}
            >
              Delete Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* INTERACTIVE FULL SHOWCASE PRODUCT PREVIEW MODAL */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Storefront Preview"
      >
        {productToPreview && (
          <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-1 text-brand-champagne font-sans pt-2">
            <span className="text-[10px] uppercase tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3 py-1 font-bold w-max">
              PREVIEW ONLY (GUEST VIEW MODE)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Product Cover image */}
              <div className="relative aspect-square border border-brand-charcoal-border bg-brand-charcoal overflow-hidden">
                <img
                  src={productToPreview.featured_image}
                  alt={productToPreview.title}
                  className="w-full h-full object-cover"
                />
                {(!productToPreview.items || !productToPreview.items.some((i) => i.is_available)) && (
                  <div className="absolute top-3 left-3 bg-brand-charcoal/90 text-gold-300 border border-gold-500/20 px-2 py-0.5 text-[9px] uppercase tracking-widest">
                    All Items Sold
                  </div>
                )}
              </div>

              {/* Product Info details replica */}
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold block mb-1">
                    {productToPreview.categories?.map((c) => c.name).join(", ") || "Fine Jewellery"}
                  </span>
                  <h3 className="font-serif text-2xl text-brand-champagne font-semibold tracking-wide">
                    {productToPreview.title}
                  </h3>
                  <p className="font-serif text-lg text-gold-300 mt-1.5 font-bold">
                    {(() => {
                      const items = productToPreview.items || [];
                      const prices = items.map((i) => i.price).filter((p): p is number => p !== null && p !== undefined && p > 0);
                      if (prices.length === 0) return "Price on Inquiry";
                      const minPrice = Math.min(...prices);
                      return `From PKR ${minPrice.toLocaleString()}`;
                    })()}
                  </p>
                </div>

                <div className="border-t border-brand-charcoal-border/50 pt-4 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-brand-champagne/45 font-bold">Description Preview</span>
                  <p className="text-xs text-brand-champagne/85 leading-relaxed font-light font-sans mb-1.5">
                    {productToPreview.short_description}
                  </p>
                  <p className="text-xs text-brand-champagne/60 leading-relaxed font-light font-sans">
                    {productToPreview.full_description}
                  </p>
                </div>

                <div className="border-t border-brand-charcoal-border/50 pt-4 grid grid-cols-2 gap-y-2 text-[11px]">
                  {productToPreview.material && (
                    <>
                      <span className="text-brand-champagne/40">Materials:</span>
                      <span className="text-brand-champagne font-medium text-right">{productToPreview.material}</span>
                    </>
                  )}
                  {productToPreview.collection && (
                    <>
                      <span className="text-brand-champagne/40">Collection:</span>
                      <span className="text-brand-champagne font-medium text-right">{productToPreview.collection}</span>
                    </>
                  )}
                  <span className="text-brand-champagne/40">Item Availability:</span>
                  <span className={`font-semibold text-right ${productToPreview.items?.some((i) => i.is_available) ? "text-emerald-400" : "text-amber-500"}`}>
                    {productToPreview.items?.some((i) => i.is_available) ? `${productToPreview.items.filter((i) => i.is_available).length} Items Available` : "All Items Sold"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-brand-charcoal-border/50 pt-5 flex justify-end mt-2">
              <Button variant="secondary" size="sm" onClick={() => setPreviewModalOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* FULL DETAIL REVIEW MODAL: ORDER MANIFEST */}
      <Modal
        isOpen={orderDetailModalOpen}
        onClose={() => setOrderDetailModalOpen(false)}
        title={`Review Transaction: ${selectedOrder?.order_id}`}
      >
        {selectedOrder && (
          <div className="flex flex-col gap-6 max-h-[85vh] overflow-y-auto pr-1 text-brand-champagne font-sans pt-2">
            
            {/* Status Summary & Quick Actions */}
            <div className="bg-brand-charcoal p-5 border border-brand-charcoal-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-brand-champagne/40">Current Transaction Status</span>
                <span className={`px-3 py-1 text-xs uppercase tracking-widest font-bold border mt-1.5 w-max ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Status Actions buttons group */}
              <div className="flex flex-wrap gap-2 items-center">
                {selectedOrder.status === "Pending Payment" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpdateStatus("Payment Under Review")}
                    isLoading={updatingOrderStatus}
                    className="cursor-pointer"
                  >
                    Mark Under Review
                  </Button>
                )}

                {(selectedOrder.status === "Pending Payment" || selectedOrder.status === "Payment Under Review") && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus("Approved")}
                      isLoading={updatingOrderStatus}
                      className="cursor-pointer"
                    >
                      Approve (Mark Sold)
                    </Button>
                    <button
                      onClick={() => handleUpdateStatus("Rejected")}
                      disabled={updatingOrderStatus}
                      className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/10 transition-all cursor-pointer"
                    >
                      Reject Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "Approved" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus("Completed")}
                    isLoading={updatingOrderStatus}
                    className="cursor-pointer"
                  >
                    Mark Completed
                  </Button>
                )}

                {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Completed" && (
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => handleUpdateStatus("Cancelled")}
                    isLoading={updatingOrderStatus}
                    className="text-brand-champagne/40 hover:text-red-400 hover:bg-red-950/10 cursor-pointer"
                  >
                    Cancel Order
                  </Button>
                )}

                {(selectedOrder.status === "Cancelled" || selectedOrder.status === "Completed" || selectedOrder.status === "Rejected") && (
                  <button
                    onClick={() => handleUpdateStatus("Pending Payment")}
                    disabled={updatingOrderStatus}
                    className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold border border-brand-charcoal-border hover:border-gold-500/30 text-brand-champagne/60 hover:text-gold-400 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset status
                  </button>
                )}
              </div>
            </div>

            {/* Rejection comments warning */}
            {selectedOrder.status === "Rejected" && selectedOrder.rejection_reason && (
              <div className="bg-red-950/15 border border-red-900/30 p-4 text-xs text-red-300 font-sans flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-1">Rejection comments (Visible to client):</span>
                  <p className="leading-relaxed">{selectedOrder.rejection_reason}</p>
                </div>
              </div>
            )}

            {/* Customer Details Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-charcoal/30 border border-brand-charcoal-border/50 p-5 font-sans">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-brand-champagne/40 font-bold border-b border-brand-charcoal-border/50 pb-1.5">Shipping Destination</span>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-brand-champagne text-sm">{selectedOrder.customer_name}</span>
                  <span className="text-brand-champagne/80 mt-0.5">{selectedOrder.shipping_address}</span>
                  <span className="text-brand-champagne/70 font-semibold">{selectedOrder.city}</span>
                  <span className="text-brand-champagne/60 mt-1">Phone: <a href={`tel:${selectedOrder.phone}`} className="underline text-gold-400">{selectedOrder.phone}</a></span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-brand-champagne/40 font-bold border-b border-brand-charcoal-border/50 pb-1.5">Contact Details & Remarks</span>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-gold-300">Instagram Handle: @{selectedOrder.instagram_username}</span>
                  {selectedOrder.email && <span className="text-brand-champagne/70 mt-0.5">Email: {selectedOrder.email}</span>}
                  <span className="text-[10px] text-brand-champagne/40 mt-1">Date Created:</span>
                  <span className="text-brand-champagne/60">{formatDate(selectedOrder.created_at)}</span>
                  {selectedOrder.notes && (
                    <div className="mt-2 p-2.5 bg-brand-charcoal border border-brand-charcoal-border/40 italic text-brand-champagne/50">
                      Notes: &ldquo;{selectedOrder.notes}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Items Table */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] uppercase tracking-widest text-brand-champagne/40 font-bold border-b border-brand-charcoal-border/50 pb-1.5">Ordered Listings</span>
              <div className="border border-brand-charcoal-border/50 bg-brand-charcoal/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-brand-charcoal-border/55 bg-brand-charcoal/60 text-[10px] uppercase tracking-widest text-brand-champagne/40">
                      <th className="p-3 pl-4">Showcase Title</th>
                      <th className="p-3 w-32">Selected Item No.</th>
                      <th className="p-3 w-32">Price Paid</th>
                      <th className="p-3 w-20 text-center">Qty</th>
                      <th className="p-3 w-28 text-right pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-charcoal-border/30">
                    {selectedOrder.items && selectedOrder.items.map((oi) => (
                      <tr key={oi.id} className="hover:bg-brand-charcoal/10">
                        <td className="p-3 pl-4 font-semibold text-brand-champagne">{oi.listing_title}</td>
                        <td className="p-3 font-mono font-bold text-gold-400">#{oi.item_number}</td>
                        <td className="p-3 text-brand-champagne/80">{formatRawPrice(oi.price)}</td>
                        <td className="p-3 text-center text-brand-champagne/70">{oi.quantity}</td>
                        <td className="p-3 text-right pr-4 text-gold-300 font-semibold">{formatRawPrice(oi.price * oi.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Grand Total */}
              <div className="flex justify-between items-baseline font-sans text-xs mt-2 px-1">
                <span className="text-brand-champagne/45 uppercase tracking-widest font-bold">Subtotal Amount Due</span>
                <span className="font-serif text-xl font-bold text-gold-300">{formatRawPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Close */}
            <div className="border-t border-brand-charcoal-border/50 pt-5 flex justify-end mt-2">
              <Button variant="secondary" size="sm" onClick={() => setOrderDetailModalOpen(false)}>
                Close Manifest
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* REJECTION REASON DIALOG MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Transaction Billing"
      >
        <form onSubmit={handleRejectOrderSubmit} className="flex flex-col gap-4 text-xs font-sans py-1">
          <div className="flex gap-3 items-start bg-red-950/20 border border-red-900/30 p-4 mb-1 text-red-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Customer Visibility Notice</span>
              This rejection comment will be immediately visible to the customer on their order status tracking page. Explain clearly why their billing transaction was rejected (e.g. invalid payment screenshot, missing details, incorrect amount).
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-semibold">Rejection Comment / Feedback *</label>
            <textarea
              rows={4}
              placeholder="e.g. We did not receive a corresponding transfer in our account title. Please make sure the screenshot matches the bank transfer receipt transaction code..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setRejectError("");
              }}
              className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-red-500 text-brand-champagne px-4 py-2.5 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 resize-none"
            />
            {rejectError && <span className="text-[10px] text-red-400 font-semibold mt-0.5">{rejectError}</span>}
          </div>

          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-brand-charcoal-border/50">
            <Button
              variant="text"
              size="sm"
              type="button"
              onClick={() => setRejectModalOpen(false)}
              disabled={updatingOrderStatus}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={updatingOrderStatus}
              className="px-4 py-2 text-xs uppercase tracking-widest font-semibold bg-red-950 border border-red-800 text-red-300 hover:bg-red-900/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {updatingOrderStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>Reject Transaction</span>
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
