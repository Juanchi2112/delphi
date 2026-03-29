"use client";

import { motion } from "motion/react";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin } from "lucide-react";
import { useState } from "react";

const teamMembers = [
  {
    name: "Ignacio Vargas",
    year: "4to Año",
    image: "/assets/Ignacio_Vargas.JPG",
    location: "UdeSA",
    linkedin: "https://www.linkedin.com/in/ignacio-vargas-fernández-9273a3367/",
  },
  {
    name: "Juan Quiroga",
    year: "4to Año",
    image: "/assets/Juan_Quiroga.JPG",
    location: "UdeSA",
    linkedin: "https://www.linkedin.com/in/juan-andres-quiroga/",
  },
  {
    name: "Alex Bodman",
    year: "5to Año",
    image: "/assets/Alex_bodman.png",
    location: "UdeSA",
    linkedin: "https://www.linkedin.com/in/alexanderbodner/",
  },
  {
    name: "Ana Paula Tissera",
    year: "4to Año",
    image: "/assets/Ana_paula_Tissera.jpg",
    location: "UdeSA",
    linkedin: "https://www.linkedin.com/in/ana-paula-tissera/",
  },
];

function TeamMemberCard({
  member,
  index,
}: {
  member: (typeof teamMembers)[0];
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ScrollReveal delay={0.1 * index} className="h-full">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="group relative h-full"
      >
        <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-950/60 backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.15)] h-full">
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

<div className="relative z-10 p-6">
            {/* Avatar */}
            <div className="mb-5 flex justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Avatar container */}
                <div className="h-28 w-28 overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={140}
                    height={140}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </motion.div>
            </div>

            {/* Info */}
            <div className="text-center">
              <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-stone-100 font-[family-name:var(--font-space-grotesk)]">
                {member.name}
              </h3>

              <Badge
                variant="secondary"
                className="mb-2.5 rounded-md bg-stone-800 text-[10px] uppercase tracking-[0.2em] text-stone-300 border border-stone-500"
              >
                Ing. en Inteligencia Artificial
              </Badge>

              <div className="mb-2 flex items-center justify-center gap-1.5 text-xs text-stone-500">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                <span>{member.year}</span>
              </div>

              <div className="flex items-center justify-center gap-2.5 text-xs text-stone-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden />
                  <span>{member.location}</span>
                </div>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-500 transition-colors duration-200 hover:text-emerald-400"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function TeamSection() {
  return (
    <section
      aria-labelledby="team-section-heading"
      className="relative w-full overflow-hidden px-4 py-24"
    >
      {/* Background decorative glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-emerald-500/8 blur-[160px]" />
        <div className="absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-stone-400/5 blur-[160px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <ScrollReveal className="mb-16 text-center">
          <h2
            id="team-section-heading"
            className="mb-4 text-4xl font-bold tracking-tight text-stone-100 font-[family-name:var(--font-space-grotesk)] md:text-5xl"
          >
            Quiénes{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              somos
            </span>
          </h2>

          <p className="mx-auto max-w-xl text-base text-stone-400">
            Estudiantes de Ingeniería en Inteligencia Artificial construyendo
            herramientas predictivas para la agricultura argentina.
          </p>
        </ScrollReveal>

        {/* Team Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
