import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Font,
} from "@react-email/components";

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
  locale?: string;
}

import env from "@findeg/env";

const BASE_URL = env.NEXT_PUBLIC_APP_URL;

const FIND_EG_COLORS = {
  primary: "#4338CA", // Deep Indigo
  accent: "#F59E0B", // Warm Amber
  background: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  textPrimary: "#111827",
  textMuted: "#6B7280",
};

/**
 * Shared wrapper for all FindEg transactional emails.
 * Includes consistent branding, responsive container, and bilingual/RTL support.
 */
export const EmailLayout = ({ children, previewText, locale = "en" }: EmailLayoutProps) => {
  const isRtl = locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Cairo"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/cairo/v28/SLXVc1nY6HkvangtZmpcWmhzfH5qWQ.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main(isRtl)}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${BASE_URL}/logo-horizontal.png`} // Assuming a logo exists here
              width="150"
              alt="FindEg Logo"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              {isRtl
                ? "فايند إي جي - منصتك الأولى للأدوات المدرسية والمكتبية في مصر"
                : "FindEg - Your premier destination for school & stationery supplies in Egypt."}
            </Text>
            <Text style={footerAddress}>
              {isRtl ? "القاهرة، مصر • support@findeg.com" : "Cairo, Egypt • support@findeg.com"}
            </Text>
            <Link href={`${BASE_URL}/unsubscribe`} style={unsubscribeLink}>
              {isRtl ? "إلغاء الاشتراك" : "Unsubscribe"}
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
/**
 *
 */
const main = (isRtl: boolean) => ({
  backgroundColor: FIND_EG_COLORS.background,
  fontFamily: isRtl
    ? 'Cairo, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
    : 'Inter, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  margin: "0",
  padding: "40px 0",
});

const container = {
  backgroundColor: FIND_EG_COLORS.surface,
  border: `1px solid ${FIND_EG_COLORS.border}`,
  borderRadius: "8px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "0",
  overflow: "hidden",
};

const header = {
  backgroundColor: FIND_EG_COLORS.primary,
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  display: "block",
  // Backup sizing if the image fails to load
  height: "40px",
  objectFit: "contain" as const,
  // We apply a CSS filter to make a dark logo white, assuming the default logo is dark.
  // In a real app, you'd link to a specific white logo variable.
  filter: "brightness(0) invert(1)",
};

const content = {
  padding: "40px",
};

const hr = {
  borderColor: FIND_EG_COLORS.border,
  margin: "0",
};

const footer = {
  padding: "32px 40px",
  backgroundColor: "#F3F4F6", // Slightly darker than background for contrast
  textAlign: "center" as const,
};

const footerText = {
  color: FIND_EG_COLORS.textMuted,
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 8px 0",
};

const footerAddress = {
  color: FIND_EG_COLORS.textMuted,
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0 0 16px 0",
};

const unsubscribeLink = {
  color: FIND_EG_COLORS.primary,
  fontSize: "12px",
  textDecoration: "underline",
};
