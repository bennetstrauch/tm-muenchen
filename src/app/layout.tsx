import type { Metadata } from "next";
import { Geist, Lora, Plus_Jakarta_Sans } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import StickyCta from "@/components/sticky-cta";
import TopBar from "@/components/top-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TM München – Transzendentale Meditation",
  description:
    "Die einzige Meditationstechnik, die ohne Konzentration funktioniert — wissenschaftlich belegt, in 4 Tagen erlernbar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${cormorant.variable} ${lora.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TopBar />
        {children}
        <StickyCta />
      </body>
    </html>
  );
}
