export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 56 56" className="shrink-0">
            <path d="M28,6 A22,22 0 1,1 8,34" fill="none" stroke="#fff" strokeWidth="1" opacity=".15"/>
            <path d="M28,12 A16,16 0 1,1 14,32" fill="none" stroke="#fff" strokeWidth="1" opacity=".25"/>
            <path d="M28,18 A10,10 0 1,1 20,30" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".45"/>
            <circle cx="28" cy="28" r="4" fill="#fff"/>
          </svg>
          <span className="text-stone-500 text-sm">
            Delphi — Inteligencia Predictiva para Plagas Agrícolas
          </span>
        </div>
        <p className="text-stone-600 text-xs">
          Equipo Delphi
        </p>
      </div>
    </footer>
  );
}
