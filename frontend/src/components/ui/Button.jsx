import React from "react";

export default function Button({
  children,
  type = "button",
  onClick,
  className = "",
  variant = "primary",
  size = "md",
}) {
  const baseStyles = "inline-flex justify-center items-center font-label-sm text-label-sm uppercase tracking-widest rounded transition-all duration-300 active:scale-95 text-center";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary-fixed shadow-[0_0_12px_rgba(173,198,255,0.2)] hover:shadow-[0_0_16px_rgba(173,198,255,0.4)]",
    outline: "bg-transparent border border-outline-variant text-on-surface hover:border-primary hover:text-primary",
    glow: "bg-[#3B82F6] text-[#F8FAFC] electric-glow hover:bg-primary-container",
  };

  const sizes = {
    sm: "py-2 px-4",
    md: "py-3 px-6",
    lg: "px-8 py-4",
    full: "w-full py-4",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </button>
  );
}
