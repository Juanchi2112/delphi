"use client";

import { FC, ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface HighlightCardProps {
  title: string;
  description: string[];
  icon?: ReactNode;
}

const HighlightCard: FC<HighlightCardProps> = ({ title, description, icon }) => {
  return (
    <div className="group cursor-pointer transform transition-all duration-500 hover:scale-105">
      <Card className="text-white rounded-2xl border border-stone-500/30 bg-white/5 backdrop-blur-xl relative overflow-hidden hover:border-stone-400/40 hover:bg-white/10 transition-all duration-500 w-full">

        <div className="p-8 md:p-10 relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="p-4 rounded-full border border-stone-600/30 bg-stone-800/60 transform group-hover:scale-110 transition-all duration-500">
              {icon}
            </div>
          </div>

          <h3 className="mb-3 text-2xl md:text-3xl font-bold text-stone-100 transform group-hover:scale-105 transition-transform duration-300">
            {title}
          </h3>

          <div className="space-y-1 max-w-sm">
            {description.map((line, idx) => (
              <p
                key={idx}
                className="text-stone-400 text-base leading-relaxed group-hover:text-stone-300 transition-colors duration-300"
              >
                {line}
              </p>
            ))}
          </div>

          <div className="mt-4 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-stone-500 to-transparent rounded-full transform group-hover:w-1/2 transition-all duration-500"></div>
        </div>
      </Card>
    </div>
  );
};

export default HighlightCard;
