import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASLI KAATA - Collector & Driver Field Companion",
  description: "Field Force Pickup, Digital Weighing & Live Route Navigation App for ASLI KAATA operations.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ASLI KAATA Field",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-900">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-900 select-none overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
