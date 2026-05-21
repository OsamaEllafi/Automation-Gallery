import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  metadataBase: new URL("https://taskmaster-todo-8e733.web.app"),
  title: "Osama K. Ellafi — The Automation Gallery",
  description: "A curated archive of real-world automation systems, n8n workflows, and intelligent process engineering.",
  openGraph: {
    title: "Osama K. Ellafi — The Automation Gallery",
    description: "A curated archive of real-world automation systems, n8n workflows, and intelligent process engineering.",
    url: "https://taskmaster-todo-8e733.web.app",
    siteName: "The Automation Gallery",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Osama K. Ellafi — The Automation Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Osama K. Ellafi — The Automation Gallery",
    description: "A curated archive of real-world automation systems, n8n workflows, and intelligent process engineering.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-grow">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
