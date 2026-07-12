import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { NavigationLoadingProvider } from "@/components/layout/NavigationLoadingProvider";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "India Sports - Celebrating Indian Athletes & Sports",
  description:
    "Your complete guide to Indian sports. Track tournaments, players, achievements, and support Indian athletes through crowdfunding.",
  keywords: [
    "India sports",
    "Indian cricket",
    "Indian football",
    "badminton India",
    "hockey India",
    "Indian athletes",
    "sports tournaments India",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <AdminAuthProvider>
          <NavigationLoadingProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </NavigationLoadingProvider>
        </AdminAuthProvider>
        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
