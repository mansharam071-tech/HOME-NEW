import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants: Record<string, string> = {
      default: "bg-[#1E3A8A] text-white hover:bg-[#172554] shadow-sm",
      destructive: "bg-[#EF4444] text-white hover:bg-red-600 shadow-sm",
      outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      ghost: "text-slate-700 hover:bg-slate-100",
      link: "text-[#1E3A8A] underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes: Record<string, string> = {
      default: "h-11 px-4 py-2",
      sm: "h-9 px-3 text-xs rounded-lg",
      lg: "h-12 px-6 text-base rounded-2xl",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
