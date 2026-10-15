import type { Metadata, Viewport } from "next";
import { Anton, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const instrumentSerif = Instrument_Serif({ weight: "400", style: "italic", subsets: ["latin"], variable: "--font-instrument" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "Qumt'asim · Sistema de gestión", template: "%s · Qumt'asim" },
  description: "Sistema de gestión del Restaurante Qumt'asim.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#140102",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${anton.variable} ${instrumentSerif.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
