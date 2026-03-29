import type { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`glass rounded-2xl p-6 ${hover ? "transition-transform duration-200 hover:-translate-y-0.5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
