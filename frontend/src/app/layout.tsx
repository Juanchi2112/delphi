import type { Metadata } from "next";
import { Space_Grotesk, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delphi — Inteligencia Predictiva para Plagas Agrícolas",
  description:
    "Plataforma de ML que anticipa brotes de chicharrita del maíz en Argentina usando datos climáticos y de monitoreo real.",
  openGraph: {
    title: "Delphi",
    description: "Predicción de riesgo de plagas agrícolas con Machine Learning",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0C0A09] text-stone-50">
        {children}
      </body>
    </html>
  );
}
