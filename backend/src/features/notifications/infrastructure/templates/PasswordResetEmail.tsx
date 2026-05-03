import * as React from 'react';
import { Section, Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

const colors = {
  primary: '#4338CA',
  textPrimary: '#111827',
  textMuted: '#6B7280',
};

interface PasswordResetEmailProps {
  customerName: string;
  resetLink: string;
  locale?: string;
}

/**
 *
 */
export const PasswordResetEmail = ({
  customerName = 'User',
  resetLink = 'https://findeg.com/reset-password',
  locale = 'en',
}: PasswordResetEmailProps) => {
  const isRtl = locale === 'ar';

  const content = {
    title: isRtl ? 'إعادة تعيين كلمة المرور 🔐' : 'Reset Your Password 🔐',
    greeting: isRtl ? `مرحباً ${customerName}،` : `Hello ${customerName},`,
    message1: isRtl
      ? 'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك على فايند إي جي.'
      : 'We received a request to reset your password for your FindEg account.',
    message2: isRtl
      ? 'اضغط على الزر أدناه لاختيار كلمة مرور جديدة. هذا الرابط صالح لمدة ساعة واحدة.'
      : 'Click the button below to choose a new password. This link is valid for 1 hour.',
    btnStr: isRtl ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
    securityNote: isRtl
      ? 'إذا لم تقم بطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان. حسابك لا يزال مؤمناً.'
      : "If you didn't request a password reset, you can safely ignore this email. Your account remains secure.",
  };

  return (
    <EmailLayout previewText={content.title} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>

      <Text style={paragraph}>{content.greeting}</Text>
      <Text style={paragraph}>{content.message1}</Text>
      <Text style={paragraph}>{content.message2}</Text>

      <Section style={btnContainer}>
        <Button style={button} href={resetLink}>
          {content.btnStr}
        </Button>
      </Section>

      <Text style={mutedParagraph}>{content.securityNote}</Text>
    </EmailLayout>
  );
};

// Styles
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

const btnContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: colors.primary,
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

export default PasswordResetEmail;
