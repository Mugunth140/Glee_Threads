import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";
import "./globals.css";

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
        <AuthProvider>
          <Navbar />
          <main className="grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
