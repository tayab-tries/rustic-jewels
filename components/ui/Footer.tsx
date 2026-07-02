import React from "react";
import Link from "next/link";

import { Instagram } from "@/components/ui/Icons";

export default function Footer() {
  const instagramUser = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME || "rustic_jewels_instagram";


  return (
    <footer className="bg-brand-charcoal-light border-t border-brand-charcoal-border pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        {/* Branding & Story */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex flex-col w-fit">
            <span className="font-serif text-2xl tracking-widest text-brand-champagne uppercase font-light">
              Rustic <span className="font-normal text-gold-500">Jewels</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-gold-500/80 -mt-1 font-sans text-right">
              Digital Catalogue
            </span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg text-gold-400 tracking-wider font-medium">Navigation</h4>
          <ul className="flex flex-col gap-2 text-sm text-brand-champagne/70 font-sans">
            <li>
              <Link href="/" className="hover:text-gold-300 transition-colors duration-150">
                Home
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="hover:text-gold-300 transition-colors duration-150">
                Browse Catalogue
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard" className="hover:text-gold-300 transition-colors duration-150">
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>

        {/* Instagram Inquiry Details */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-lg text-gold-400 tracking-wider font-medium">Inquiries</h4>
          <p className="text-sm text-brand-champagne/60 font-sans leading-relaxed">
            All purchases are conducted directly through Instagram DM. Open any piece in our catalogue and click the inquire button to start a conversation.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              href={`https://instagram.com/${instagramUser}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-brand-charcoal-border hover:border-gold-500 flex items-center justify-center text-brand-champagne hover:text-gold-400 transition-all duration-200"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-brand-charcoal-border/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-champagne/45 font-sans">
        <p>© {new Date().getFullYear()} Rustic Jewels. All rights reserved.</p>
      </div>
    </footer>
  );
}
