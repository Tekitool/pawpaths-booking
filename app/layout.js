import { Inter, Baloo_Bhaina_2, Plus_Jakarta_Sans, Laila } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const balooBhaina2 = Baloo_Bhaina_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo"
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta"
});
const laila = Laila({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Laila from Google Fonts only supports up to 700
  variable: "--font-laila"
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pawpathsae.com'
  ),
  title: {
    default: "Pawpaths | Premium Pet Relocation UAE",
    template: "%s | Pawpaths",
  },
  description: "Expert international pet relocation services in the UAE. Safe, stress-free pet transport handled by specialists.",
  icons: {
    icon: [
      { url: "/ppicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

import Providers from "@/components/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${balooBhaina2.variable} ${plusJakartaSans.variable} ${laila.variable} font-sans bg-surface-ivory min-h-screen overflow-x-hidden`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
