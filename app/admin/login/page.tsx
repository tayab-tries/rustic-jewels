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
        router.push("/admin/dashboard");
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
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      {/* Background design accents */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-6">
        {/* Branding header */}
        <div className="text-center flex flex-col gap-2">
          <span className="font-serif text-3xl tracking-widest text-text-primary uppercase font-light">
            Rustic <span className="font-normal text-[#C9A96A]">Jewels</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-[#7D96B5]/80 font-sans">
            Catalogue Administration
          </span>
        </div>

        {/* Login form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#FFFFFF] border border-[#DCE5EF] p-8 shadow-2xl rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-medium tracking-wide text-text-primary">
              Sign In to Dashboard
            </h2>
          </div>

          {/* Configuration alert banner */}
          {!isSupabaseConfigured && (
            <div className="mb-6 bg-primary/10 border border-primary/30 p-3 text-xs text-primary font-sans flex items-start gap-2.5 rounded-[10px]">
              <KeyRound className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Demo Mode Active:</strong> Log in using the test credentials below:<br />
                <span className="font-mono text-text-primary block mt-1">
                  Email: admin@rusticjewels.com<br />
                  Password: admin
                </span>
              </div>
            </div>
          )}

          {/* General error message banner */}
          {errorMsg && (
            <div className="mb-6 bg-[#CF6A6A]/10 border border-[#CF6A6A]/30 p-4 text-xs text-[#CF6A6A] font-sans flex items-start gap-2.5 rounded-[10px]">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#CF6A6A]" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-text-secondary font-sans font-semibold">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@rusticjewels.com"
                  {...register("email")}
                  className="w-full bg-[#FFFFFF] border border-border focus:border-primary text-text-primary pl-10 pr-4 py-2.5 text-sm rounded-[10px] focus:outline-none placeholder:text-text-light font-sans"
                />
                <Mail className="w-4 h-4 text-primary absolute left-3.5 top-3.5" />
              </div>
              {errors.email && (
                <span className="text-[11px] text-[#CF6A6A] font-sans mt-0.5">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-text-secondary font-sans font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-[#FFFFFF] border border-border focus:border-primary text-text-primary pl-10 pr-4 py-2.5 text-sm rounded-[10px] focus:outline-none placeholder:text-text-light font-sans"
                />
                <Lock className="w-4 h-4 text-primary absolute left-3.5 top-3.5" />
              </div>
              {errors.password && (
                <span className="text-[11px] text-[#CF6A6A] font-sans mt-0.5">
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
          className="text-center text-xs uppercase tracking-widest text-text-secondary hover:text-primary font-sans transition-colors duration-150"
        >
          ← Return to Catalogue
        </Link>
      </div>
    </main>
  );
}
