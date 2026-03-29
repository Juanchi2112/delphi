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
        scrolled ? "glass-subtle py-4" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* Logo - left */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-stone-950 font-bold text-base">
            D
          </span>
          <span className="text-stone-50 font-semibold text-xl tracking-tight">
            Delphi
          </span>
        </a>

        {/* Links - centered */}
        <div className="hidden md:flex items-center gap-12 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-base text-stone-400 hover:text-stone-200 transition-colors pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-emerald-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
