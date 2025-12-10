import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pawpaths Pets Relocation Services | Book Your Pet's Travel",
  description: "Professional pet relocation services. Book your pet's safe journey with Pawpaths. International pet transport specialists.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
