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
          <svg width="32" height="32" viewBox="0 0 56 56" className="shrink-0">
            <path d="M28,6 A22,22 0 1,1 8,34" fill="none" stroke="#fff" strokeWidth="1" opacity=".15"/>
            <path d="M28,12 A16,16 0 1,1 14,32" fill="none" stroke="#fff" strokeWidth="1" opacity=".25"/>
            <path d="M28,18 A10,10 0 1,1 20,30" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".45"/>
            <circle cx="28" cy="28" r="4" fill="#fff"/>
          </svg>
          <span className="text-stone-50 font-semibold text-lg tracking-[0.35em] uppercase">
            Delphi
          </span>
        </a>

        {/* Links - truly centered via equal spacers */}
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

        {/* Invisible spacer — same width as logo to balance centering */}
        <div className="hidden md:flex items-center gap-2 invisible" aria-hidden="true">
          <svg width="32" height="32" className="shrink-0" />
          <span className="text-lg tracking-[0.35em] uppercase">Delphi</span>
        </div>
      </div>
    </nav>
  );
}
