"use client";

import React from "react";
import { motion } from "framer-motion";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#59708E]/50 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#324A6A] hover:bg-[#3E5C85] text-[#F5F2EC] font-medium border-0 shadow-sm",
    secondary: "bg-transparent hover:bg-[#59708E]/15 text-[#F5F2EC] border border-[#43516D]",
    text: "bg-transparent hover:bg-[#1E2A44] text-[#F5F2EC] border border-[#2F3C56]",
    danger: "bg-red-950/80 hover:bg-red-900/90 text-red-200 border border-red-800/50"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs tracking-wider uppercase",
    md: "px-6 py-2.5 text-sm tracking-wider uppercase",
    lg: "px-8 py-3 text-base tracking-wider uppercase"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.99 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as Record<string, unknown>)}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      
      {!isLoading && Icon && iconPosition === "left" && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      
      <span>{children}</span>
      
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </motion.button>
  );
}
