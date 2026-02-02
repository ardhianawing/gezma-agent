import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F60000",
};

export const metadata: Metadata = {
  title: "GEZMA Agent - Travel Agency Operations Dashboard",
  description: "SaaS Dashboard untuk Travel Agency Umrah (PPIU). Kelola jemaah, paket, keberangkatan, dan operasional travel umrah Anda.",
  keywords: "umrah, travel agency, ppiu, dashboard, saas, manajemen jemaah",
  authors: [{ name: "GEZMA" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GEZMA Agent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
