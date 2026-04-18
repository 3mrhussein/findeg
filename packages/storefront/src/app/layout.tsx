import { getLocale, getMessages } from "next-intl/server";
import { Inter, Cairo } from "next/font/google";
import { cn } from "@lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-cairo",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(inter.variable, cairo.variable)}
    >
      <body
        suppressHydrationWarning
        className={cn("font-sans antialiased", locale === "ar" ? "font-arabic" : "font-inter")}
      >
        {children}
      </body>
    </html>
  );
}
