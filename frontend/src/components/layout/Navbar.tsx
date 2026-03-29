"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Mapa", href: "#mapa" },
  { label: "Datos", href: "#datos" },
  { label: "Planes", href: "#planes" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[2000] transition-all duration-300 ${
        scrolled ? "glass-subtle py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-stone-950 font-bold text-sm">
            D
          </span>
          <span className="text-stone-50 font-semibold text-lg tracking-tight">
            Delphi
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Demo badge */}
        <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-500 border border-stone-700">
          HackITBA 2026
        </span>
      </div>
    </nav>
  );
}
