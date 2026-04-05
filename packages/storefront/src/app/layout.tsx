// Root layout for Next.js 16 App Router (required: must include <html> and <body> tags)
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FindEg Storefront",
  description: "FindEg E-commerce Platform - Customer Shop",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
