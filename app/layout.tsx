import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { GroceryItemsProvider } from "@/contexts/GroceryItemsContext";
import "./globals.css";
import leafMark from "../ChatGPT Image Sep 28, 2026, 07_38_01 PM.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HarvestHub - Your Grocery Shopping Companion",
  description: "A progressive web app for managing grocery lists with smart organization and offline support",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HarvestHub",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#29231f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GroceryItemsProvider>
          {/* Mobile Header - Mobile only */}
          <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center bg-[var(--background)] px-4">
            <h1 className="flex items-center gap-2 text-2xl tracking-tight"><Image src={leafMark} alt="" aria-hidden="true" className="h-7 w-7 object-contain" priority /><span><span className="font-bold text-[var(--brand)]">Harvest</span><span className="font-normal text-[var(--foreground)]">Hub</span></span></h1>
          </header>

          <div className="flex min-h-screen bg-[var(--background)]">
            {/* Sidebar - Desktop only */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-24 md:pb-0">
              {children}
            </main>

            {/* Bottom Navigation - Mobile only */}
            <BottomNav />
          </div>

          {/* PWA Install Prompt */}
          <InstallPrompt />

          {/* Service Worker Registration */}
          <ServiceWorkerRegistration />
        </GroceryItemsProvider>
      </body>
    </html>
  );
}
