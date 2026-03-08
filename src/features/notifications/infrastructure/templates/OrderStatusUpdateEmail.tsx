import * as React from "react";
import { Section, Text, Button, Heading, Container } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

const colors = {
  primary: "#4338CA",
  textPrimary: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  success: "#059669",
};

interface OrderStatusUpdateEmailProps {
  orderId: string | number;
  customerName: string;
  newStatus: string;
  trackingNumber?: string;
  locale?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://findeg.com";

// Map status to localized strings
/**
 *
 */
const getStatusLabel = (status: string, isRtl: boolean) => {
  const norm = status.toLowerCase();

  if (isRtl) {
    switch (norm) {
      case "pending":
        return "قيد الانتظار";
      case "processing":
        return "قيد التجهيز";
      case "shipped":
        return "تم الشحن";
      case "delivered":
        return "تم التوصيل";
      case "cancelled":
        return "تم الإلغاء";
      case "returned":
        return "تم الاسترجاع";
      default:
        return status;
    }
  } else {
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 *
 */
export const OrderStatusUpdateEmail = ({
  orderId = "10001",
  customerName = "Customer",
  newStatus = "shipped",
  trackingNumber,
  locale = "en",
}: OrderStatusUpdateEmailProps) => {
  const isRtl = locale === "ar";
  const localizedStatus = getStatusLabel(newStatus, isRtl);

  const content = {
    title: isRtl ? "تحديث حالة الطلب 📦" : "Order Status Update 📦",
    greeting: isRtl ? `مرحباً ${customerName}،` : `Hello ${customerName},`,
    message: isRtl
      ? `لقد تم تحديث حالة طلبك (#${orderId}) إلى: `
      : `Your order (#${orderId}) status has been updated to: `,
    trackingStr: isRtl ? "رقم التتبع: " : "Tracking Number: ",
    trackOrderStr: isRtl ? "تتبع الطلب" : "Track Order",
  };

  return (
    <EmailLayout previewText={`${content.title} - ${localizedStatus}`} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>

      <Text style={paragraph}>{content.greeting}</Text>
      <Text style={paragraph}>
        {content.message}
        <span style={statusBadge}>{localizedStatus}</span>
      </Text>

      {trackingNumber && (
        <Section style={trackingBox}>
          <Text style={trackingText}>
            <strong>{content.trackingStr}</strong>
            <span style={trackingCode}>{trackingNumber}</span>
          </Text>
        </Section>
      )}

      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}/${locale}/my-account/orders/${orderId}`}>
          {content.trackOrderStr}
        </Button>
      </Section>
    </EmailLayout>
  );
};

// Styles
const h1 = {
  color: colors.primary,
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "28px",
  margin: "0 0 24px 0",
};

const paragraph = {
  color: colors.textPrimary,
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const statusBadge = {
  backgroundColor: "#ECFDF5",
  color: colors.success,
  padding: "4px 8px",
  borderRadius: "16px",
  fontWeight: "600",
  display: "inline-block",
  marginLeft: "8px",
  marginRight: "8px",
};

const trackingBox = {
  backgroundColor: "#F9FAFB",
  border: `1px dashed ${colors.border}`,
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const trackingText = {
  fontSize: "16px",
  color: colors.textPrimary,
  margin: "0",
};

const trackingCode = {
  fontSize: "18px",
  fontWeight: "bold",
  color: colors.primary,
  display: "inline-block",
  marginLeft: "8px",
  marginRight: "8px",
  letterSpacing: "1px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const button = {
  backgroundColor: colors.primary,
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

export default OrderStatusUpdateEmail;
