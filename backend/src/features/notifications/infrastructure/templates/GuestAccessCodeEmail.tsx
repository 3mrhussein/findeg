import * as React from 'react';
import { Section, Text, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

const colors = {
  primary: '#4338CA',
  textPrimary: '#111827',
  textMuted: '#6B7280',
};

interface GuestAccessCodeEmailProps {
  orderReference: string;
  code: string;
  expiresInMinutes: number;
  locale?: string;
}

export const GuestAccessCodeEmail = ({
  orderReference = 'FE-ABC123',
  code = '123456',
  expiresInMinutes = 15,
  locale = 'en',
}: GuestAccessCodeEmailProps) => {
  const isRtl = locale === 'ar';

  const content = {
    title: isRtl ? 'رمز الوصول إلى طلبك' : 'Your order access code',
    message: isRtl
      ? `استخدم الرمز التالي لعرض طلبك ${orderReference}. الرمز صالح لمدة ${expiresInMinutes} دقيقة.`
      : `Use this code to view your order ${orderReference}. It is valid for ${expiresInMinutes} minutes.`,
    securityNote: isRtl
      ? 'إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني بأمان.'
      : "If you didn't request this code, you can safely ignore this email.",
  };

  return (
    <EmailLayout previewText={content.title} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>
      <Text style={paragraph}>{content.message}</Text>
      <Section style={codeContainer}>
        <Text style={codeText}>{code}</Text>
      </Section>
      <Text style={mutedParagraph}>{content.securityNote}</Text>
    </EmailLayout>
  );
};

const h1 = {
  color: colors.primary,
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 24px 0',
};

const paragraph = {
  color: colors.textPrimary,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const mutedParagraph = {
  color: colors.textMuted,
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0 0',
};

const codeContainer = { textAlign: 'center' as const, margin: '32px 0' };

const codeText = {
  color: colors.textPrimary,
  fontSize: '36px',
  fontWeight: '700',
  letterSpacing: '8px',
  fontFamily: 'monospace',
  margin: '0',
};

export default GuestAccessCodeEmail;
