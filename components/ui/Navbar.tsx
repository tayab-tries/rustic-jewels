"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { Instagram } from "@/components/ui/Icons";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
      setIsOpen(false); // Close mobile drawer if open
    }
  };

  // Detect scroll to style the navbar dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Catalogue", href: "/catalog" },
    { name: "Track Order", href: "/track-order" },
  ];

  const instagramUser = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME || "rusticjewels_";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-350 ${
          scrolled
            ? "glass py-4 shadow-lg border-b border-brand-charcoal-border/50"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex flex-col">
            <span className="font-serif text-2xl tracking-widest text-[#202124] group-hover:text-[#7D96B5] transition-colors duration-250 uppercase font-light">
              Rustic <span className="font-normal text-[#7D96B5]">Jewels</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#525B66] -mt-1 font-sans text-right font-medium">
              Digital Catalogue
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-sans text-xs uppercase tracking-widest transition-colors duration-200 relative py-1 ${
                    isActive ? "text-[#7D96B5] font-medium" : "text-[#525B66] hover:text-[#202124]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#7D96B5]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-6">
            <form onSubmit={handleSearchSubmit} className="relative w-36 lg:w-48">
              <input
                type="text"
                placeholder="Search catalogue..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] pl-8 pr-3 py-1.5 text-[10px] focus:outline-none placeholder:text-[#9EA8B5] font-sans tracking-wide"
              />
              <Search className="w-3.5 h-3.5 text-[#7D96B5] absolute left-2.5 top-2.5" />
            </form>

            <Link
              href="/cart"
              className="relative p-2 text-[#7D96B5] hover:text-[#6D88AA] transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#7D96B5] text-[#FFFFFF] text-[9px] font-bold h-4 w-4 flex items-center justify-center font-sans">
                  {cartCount}
                </span>
              )}
            </Link>

            <a
              href={`https://instagram.com/${instagramUser}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#525B66] hover:text-[#202124] transition-colors duration-200 border border-[#D8E1EB] hover:border-[#7D96B5]/60 px-4 py-2 glass"
            >
              <Instagram className="w-4 h-4 text-[#7D96B5]" />
              <span>Our Instagram</span>
            </a>
          </div>

          {/* Mobile controls: Cart icon + Toggle Menu */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/cart"
              className="relative p-2 text-[#7D96B5] hover:text-[#6D88AA] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#7D96B5] text-[#FFFFFF] text-[9px] font-bold h-4 w-4 flex items-center justify-center font-sans">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#7D96B5] hover:text-[#6D88AA] p-1 cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-[73px] z-35 bg-[#F8FAFD] glass flex flex-col md:hidden"
          >
            {/* Mobile Search Input */}
            <div className="px-8 pt-6 w-full">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search catalogue..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D8E1EB] focus:border-[#7D96B5] text-[#202124] pl-10 pr-4 py-3 text-xs focus:outline-none placeholder:text-[#9EA8B5] font-sans"
                />
                <Search className="w-4 h-4 text-[#7D96B5] absolute left-3.5 top-3.5" />
              </form>
            </div>

            <div className="flex-grow flex flex-col p-8 gap-8 justify-center items-center">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`font-serif text-3xl tracking-wider ${
                        isActive ? "text-[#7D96B5] font-medium" : "text-[#525B66] hover:text-[#202124]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-xs pt-8 border-t border-[#D8E1EB] flex flex-col items-center"
              >
                <a
                  href={`https://instagram.com/${instagramUser}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#7D96B5] text-[#FFFFFF] py-3 tracking-widest text-xs uppercase font-sans font-semibold hover:bg-[#6D88AA] transition-colors duration-200"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Visit Instagram</span>
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
