import type { Metadata } from "next";
import { Geist, Lora, Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import CookieBanner from "@/components/cookie-banner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = (await headers()).get('x-is-admin') === '1';
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${cormorant.variable} ${lora.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {!isAdmin && <Analytics />}
        {!isAdmin && <CookieBanner />}
      </body>
    </html>
  );
}
