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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
