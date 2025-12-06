import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { GroceryItemsProvider } from "@/contexts/GroceryItemsContext";
import "./globals.css";

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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
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
          <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-center z-50">
            <h1 className="text-2xl font-bold text-green-500">HarvestHub</h1>
          </header>

          <div className="flex min-h-screen bg-gray-900">
            {/* Sidebar - Desktop only */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-16 md:pb-0">
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
