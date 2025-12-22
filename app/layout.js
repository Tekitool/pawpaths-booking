import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pawpaths Pets Relocation Services | Book Your Pet's Travel",
  description: "Professional pet relocation services. Book your pet's safe journey with Pawpaths. International pet transport specialists.",
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
      <body className={`${inter.className} bg-gray-50 min-h-screen`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
