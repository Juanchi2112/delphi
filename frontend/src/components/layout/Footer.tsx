export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-stone-950 font-bold text-[10px]">
            D
          </span>
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
