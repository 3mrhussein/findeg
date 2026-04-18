import { routing } from "@i18n/routing";
import { Inter, Cairo } from "next/font/google";
import { cn } from "@lib/utils";
import { ThemeProvider } from "@/providers/ThemeProvider";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // We use the default locale as a fallback for the HTML shell.
  // The actual localized layout applies correct text direction and font classes internally.
  const locale = routing.defaultLocale;
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
