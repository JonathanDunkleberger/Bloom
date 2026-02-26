import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bloom — Grow Your Habits",
  description: "Build positive habits and watch your creatures evolve. A beautiful habit tracker with a terrarium theme.",
  keywords: ["habit tracker", "self improvement", "habit building", "creature evolution"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bloom",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8f8f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet" />
          <link rel="apple-touch-icon" href="/icon-192.svg" />
        </head>
        <body className="antialiased" style={{ background: "#f8f8f6", fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
