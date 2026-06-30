"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import { Lock, Mail, AlertTriangle, KeyRound } from "lucide-react";
import Button from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Zod Login Validation Schema
const loginSchema = zod.object({
  email: zod.string().min(1, "Email is required").email("Invalid email format"),
  password: zod.string().min(1, "Password is required"),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.signIn(values.email, values.password);
      if (res.success) {
        window.location.href = "/admin/dashboard";
      } else {
        setErrorMsg(res.error || "Authentication failed.");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-charcoal flex flex-col items-center justify-center p-6 relative">
      {/* Background design accents */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-6">
        {/* Branding header */}
        <div className="text-center flex flex-col gap-2">
          <span className="font-serif text-3xl tracking-widest text-brand-champagne uppercase font-light">
            Rustic <span className="font-normal text-gold-500">Jewels</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-gold-500/80 font-sans">
            Catalogue Administration
          </span>
        </div>

        {/* Login form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-brand-charcoal-light border border-brand-charcoal-border p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-charcoal-border/50">
            <Lock className="w-5 h-5 text-gold-500" />
            <h2 className="font-serif text-xl font-medium tracking-wide text-brand-champagne">
              Sign In to Dashboard
            </h2>
          </div>

          {/* Configuration alert banner */}
          {!isSupabaseConfigured && (
            <div className="mb-6 bg-gold-500/10 border border-gold-500/30 p-3 text-xs text-gold-400 font-sans flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Demo Mode Active:</strong> Log in using the test credentials below:<br />
                <span className="font-mono text-brand-champagne block mt-1">
                  Email: admin@rusticjewels.com<br />
                  Password: admin
                </span>
              </div>
            </div>
          )}

          {/* General error message banner */}
          {errorMsg && (
            <div className="mb-6 bg-red-950/40 border border-red-800/40 p-4 text-xs text-red-300 font-sans flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@rusticjewels.com"
                  {...register("email")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne pl-10 pr-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/25 font-sans"
                />
                <Mail className="w-4 h-4 text-brand-champagne/40 absolute left-3.5 top-3.5" />
              </div>
              {errors.email && (
                <span className="text-[11px] text-red-400 font-sans mt-0.5">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-brand-champagne/60 font-sans">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-brand-charcoal border border-brand-charcoal-border focus:border-gold-500 text-brand-champagne pl-10 pr-4 py-2.5 text-sm rounded-none focus:outline-none placeholder:text-brand-champagne/25 font-sans"
                />
                <Lock className="w-4 h-4 text-brand-champagne/40 absolute left-3.5 top-3.5" />
              </div>
              {errors.password && (
                <span className="text-[11px] text-red-400 font-sans mt-0.5">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full mt-2 py-3"
            >
              Log In
            </Button>
          </form>
        </motion.div>

        {/* Back Link to Catalogue */}
        <Link
          href="/catalog"
          className="text-center text-xs uppercase tracking-widest text-brand-champagne/50 hover:text-gold-400 font-sans transition-colors duration-150"
        >
          ← Return to Catalogue
        </Link>
      </div>
    </main>
  );
}
