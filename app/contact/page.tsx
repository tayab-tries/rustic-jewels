"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Check, Send, AlertCircle } from "lucide-react";
import { Instagram } from "@/components/ui/Icons";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { productService } from "@/services/productService";
import { Settings } from "@/types";

// Validation schema
const contactFormSchema = zod.object({
  name: zod.string().min(1, "Name is required").max(60, "Name is too long"),
  email: zod.string().min(1, "Email is required").email("Please enter a valid email"),
  subject: zod.string().min(1, "Subject is required").max(100, "Subject is too long"),
  message: zod.string().min(10, "Message must be at least 10 characters long"),
});

type ContactFormValues = zod.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load contact info
  useEffect(() => {
    async function loadContacts() {
      try {
        const config = await productService.getSettings();
        setSettings(config);
      } catch (err) {
        console.error("Failed to load settings in Contact", err);
      }
    }
    loadContacts();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccessModalOpen(true);
      reset();
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
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
        className="flex-grow pt-32 pb-24"
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* Header titles */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-sans font-semibold">
              Get in Touch
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-brand-champagne mt-2 tracking-wide font-medium">
              Inquire or Collaborate
            </h1>
            <p className="text-xs text-brand-champagne/60 font-sans mt-3 leading-relaxed">
              Have questions about commissions, or a specific catalogue piece? Reach out to us. We would love to hear from you.
            </p>
            <div className="w-12 h-[1px] bg-gold-500/50 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left side details (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-8 bg-brand-charcoal-light border border-brand-charcoal-border p-8 sm:p-10">
              <h2 className="font-serif text-2xl text-brand-champagne tracking-wide">
                Direct Contact
              </h2>
              <p className="text-xs text-brand-champagne/60 font-sans leading-relaxed">
                We respond fastest to Instagram Direct Messages. If you are looking to inquire about availability or request bespoke design variations, clicking below will send you directly to our inbox.
              </p>

              <div className="flex flex-col gap-6 mt-2">
                {/* Instagram direct */}
                <a
                  href={settings?.instagram_url || "https://instagram.com/rustic_jewels_instagram"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group p-4 border border-brand-charcoal-border bg-brand-charcoal hover:border-gold-500/35 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-brand-charcoal transition-all duration-300">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-brand-champagne font-sans font-semibold">Instagram DM</h4>
                    <span className="text-[10px] text-brand-champagne/45 font-sans lowercase mt-0.5 block">
                      @{settings?.instagram_url.split("/").pop() || "rustic_jewels_instagram"}
                    </span>
                  </div>
                </a>

                {/* Email direct */}
                <a
                  href={`mailto:${settings?.email || "contact@rusticjewels.com"}`}
                  className="flex items-center gap-4 group p-4 border border-brand-charcoal-border bg-brand-charcoal hover:border-gold-500/35 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-brand-charcoal transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-brand-champagne font-sans font-semibold">Email Us</h4>
                    <span className="text-[10px] text-brand-champagne/45 font-sans mt-0.5 block">
                      {settings?.email || "contact@rusticjewels.com"}
                    </span>
                  </div>
                </a>
              </div>

              <div className="border-t border-brand-charcoal-border/50 pt-6 mt-4">
                <span className="text-[10px] uppercase tracking-widest text-gold-500 font-sans font-semibold block mb-2">
                  Response Window
                </span>
                <p className="text-[10px] text-brand-champagne/50 leading-relaxed font-sans">
                  Monday to Friday: 9:00 AM – 6:00 PM (GMT)<br />
                  Replies are usually sent within 12–24 business hours.
                </p>
              </div>
            </div>

            {/* Right side form input fields (7 cols) */}
            <div className="lg:col-span-7 bg-brand-charcoal-light border border-brand-charcoal-border p-8 sm:p-10 flex flex-col gap-6">
              <h2 className="font-serif text-2xl text-brand-champagne tracking-wide">
                Send an Inquiry Message
              </h2>

              {errorMsg && (
                <div className="bg-red-950/40 border border-red-800/40 p-4 text-xs text-red-300 font-sans flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    {...register("name")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  {errors.name && (
                    <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.name.message}</span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. eleanor@example.com"
                    {...register("email")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  {errors.email && (
                    <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.email.message}</span>
                  )}
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                    Subject / Topic *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Ring Sizing Commission"
                    {...register("subject")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans"
                  />
                  {errors.subject && (
                    <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.subject.message}</span>
                  )}
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-brand-champagne/60 font-sans font-medium">
                    Message Details *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Please specify size constraints, gemstone selections, metal finishes or catalogue reference numbers..."
                    {...register("message")}
                    className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne px-4 py-3 text-xs rounded-none focus:outline-none placeholder:text-brand-champagne/20 font-sans resize-none"
                  />
                  {errors.message && (
                    <span className="text-[10px] text-red-400 font-sans mt-0.5">{errors.message.message}</span>
                  )}
                </div>

                <div className="mt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={submitting}
                    icon={Send}
                    className="w-full sm:w-auto"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Success Modal Confirmation */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Message Received"
      >
        <div className="flex flex-col items-center text-center gap-4 py-4 font-sans">
          <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/40 rounded-full flex items-center justify-center text-gold-400 mb-2">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl text-brand-champagne">Inquiry Sent Successfully</h3>
          <p className="text-xs text-brand-champagne/60 leading-relaxed max-w-sm">
            Thank you for contacting Rustic Jewels. We have received your query and will reply to your email address as soon as possible.
          </p>
          <p className="text-[10px] text-gold-400/80 leading-relaxed max-w-sm mt-1">
            To expedite custom orders, feel free to send a Direct Message containing your query details to our Instagram profile as well!
          </p>
          <div className="flex gap-4 w-full mt-6 justify-center">
            <Button variant="secondary" size="sm" onClick={() => setSuccessModalOpen(false)}>
              Close Window
            </Button>
            <a
              href={settings?.instagram_url || "https://instagram.com/rustic_jewels_instagram"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="sm" icon={Instagram}>
                DM on Instagram
              </Button>
            </a>
          </div>
        </div>
      </Modal>

      <Footer />
    </>
  );
}
