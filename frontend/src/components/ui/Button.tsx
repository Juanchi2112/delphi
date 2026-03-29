import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-stone-950 font-semibold",
  secondary:
    "border border-stone-600 hover:border-stone-400 text-stone-200 hover:text-stone-50 font-medium",
  ghost:
    "text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-6 py-3 rounded-xl transition-colors duration-150 cursor-pointer ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
