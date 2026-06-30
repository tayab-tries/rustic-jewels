"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Home as HomeIcon, BookOpen } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const containerVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-24 flex items-center justify-center min-h-[80vh] bg-brand-charcoal relative">
        {/* Subtle gold design flourish */}
        <div className="absolute w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />

        <motion.div
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="max-w-md mx-auto px-6 text-center relative z-10 py-16 border border-brand-charcoal-border bg-brand-charcoal-light flex flex-col items-center gap-6"
        >
          <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold-500 font-sans font-bold block mb-1">
              Error Code 404
            </span>
            <h1 className="font-serif text-3xl text-brand-champagne tracking-wide font-medium">
              Jewel Not Found
            </h1>
            <div className="w-8 h-[1px] bg-gold-500/50 mx-auto mt-3" />
          </div>

          <p className="text-xs text-brand-champagne/60 leading-relaxed font-sans max-w-sm">
            The particular jewellery piece, category archive, or dashboard page route you tried to access does not exist or has been removed from our catalog.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4 justify-center">
            <Link href="/">
              <Button variant="secondary" size="sm" icon={HomeIcon} className="w-full">
                Home Page
              </Button>
            </Link>
            <Link href="/catalog">
              <Button variant="primary" size="sm" icon={BookOpen} className="w-full">
                Catalogue
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
