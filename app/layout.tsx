import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AxoMed",
  description: "Gestión Inteligente para Clínicas de Fisioterapia",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/api/icons?size=32", sizes: "32x32", type: "image/png" },
      { url: "/api/icons?size=16", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AxoMed",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ServiceWorkerRegister />
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
