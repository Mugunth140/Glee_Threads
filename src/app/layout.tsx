import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";
import "./globals.css";
// Toasts is a client component; load it dynamically to avoid SSR issues
// Toasts is a client component; import directly so Next can handle the client boundary
import Toasts from '@/components/Toasts';

const inter = Inter({
  subsets: ["latin"],
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Glee Threads - Premium T-Shirts & Custom Designs",
  description: "Your destination for custom and ready-made t-shirts. Create your unique style or choose from our curated collection. Located in Siddhapudur, Coimbatore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${figtree.variable} flex flex-col min-h-screen`}>
        <Navbar />
        {/* Global toast container (client) */}
        <Toasts />
        <main className="grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
