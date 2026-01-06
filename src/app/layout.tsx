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
  metadataBase: new URL('https://gleethreads.com'), // Replace with actual domain
  title: {
    default: "Glee Threads - Premium T-Shirts & Custom Designs",
    template: "%s | Glee Threads"
  },
  description: "Your destination for custom and ready-made t-shirts. Create your unique style or choose from our curated collection. Located in Siddhapudur, Coimbatore.",
  keywords: ["custom t-shirts", "printed t-shirts", "coimbatore t-shirts", "glee threads", "clothing store"],
  authors: [{ name: "Glee Threads" }],
  creator: "Glee Threads",
  publisher: "Glee Threads",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://gleethreads.com",
    title: "Glee Threads - Premium T-Shirts & Custom Designs",
    description: "Your destination for custom and ready-made t-shirts. Create your unique style or choose from our curated collection.",
    siteName: "Glee Threads",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Glee Threads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glee Threads - Premium T-Shirts & Custom Designs",
    description: "Your destination for custom and ready-made t-shirts. Create your unique style or choose from our curated collection.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
