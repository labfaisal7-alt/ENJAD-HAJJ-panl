import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "border border-transparent bg-slate-900 text-white shadow-sm hover:opacity-95",
  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:pointer-events-none disabled:opacity-50",
        variants[variant] || variants.default,
        className,
      )}
      {...props}
    />
  );
}
