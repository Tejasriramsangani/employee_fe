import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASLI KAATA - Collector & Driver Field Companion",
  description: "Field Force Pickup, Digital Weighing & Live Route Navigation App for ASLI KAATA operations.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ASLI KAATA Field",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1B5E3A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      {/* Browser extensions can add body attributes before React hydrates. */}
      <body suppressHydrationWarning className="min-h-full bg-slate-950 text-slate-900 antialiased selection:bg-emerald-600 selection:text-white overscroll-none">
        {children}
      </body>
    </html>
  );
}
