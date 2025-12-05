import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
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
          <div className="flex min-h-screen bg-gray-900">
            {/* Sidebar - Desktop only */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pb-16 md:pb-0">
              {children}
            </main>

            {/* Bottom Navigation - Mobile only */}
            <BottomNav />
          </div>
        </GroceryItemsProvider>
      </body>
    </html>
  );
}
