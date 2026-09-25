import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/layout/AuthModal";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Wonderlight — Book Movie Tickets",
  description:
    "Experience cinema at its finest. Book tickets for the latest blockbusters at Wonderlight.",
  keywords: ["movies", "cinema", "tickets", "booking", "IMAX", "now showing"],
  openGraph: {
    title: "Wonderlight",
    description: "Book movie tickets. Live the experience.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#141414",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-text-primary font-body antialiased">
        <Providers>
          <Navbar />
          <AuthModal />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1F1F1F",
                color: "#FFFFFF",
                border: "1px solid #333",
                borderRadius: "8px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#46D369", secondary: "#1F1F1F" },
                style: { borderColor: "#46D369" },
              },
              error: {
                iconTheme: { primary: "#E50914", secondary: "#1F1F1F" },
                style: { borderColor: "#E50914" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
