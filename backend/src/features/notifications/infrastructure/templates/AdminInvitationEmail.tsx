import * as React from 'react';
import { Section, Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

const colors = {
  primary: '#4338CA',
  textPrimary: '#111827',
};

interface AdminInvitationEmailProps {
  adminName: string;
  inviterName?: string;
  inviteLink: string;
  locale?: string;
}

/**
 *
 */
export const AdminInvitationEmail = ({
  adminName = 'Admin',
  inviterName = 'An administrator',
  inviteLink = 'https://findeg.com/admin/accept-invite',
  locale = 'en',
}: AdminInvitationEmailProps) => {
  const isRtl = locale === 'ar';

  const content = {
    title: isRtl ? 'دعوة للوحة تحكم فايند إي جي 👑' : 'Invitation to FindEg Dashboard 👑',
    greeting: isRtl ? `مرحباً ${adminName}،` : `Hello ${adminName},`,
    message1: isRtl
      ? `لقد قام ${inviterName} بدعوتك للانضمام إلى فريق إدارة فايند إي جي.`
      : `${inviterName} has invited you to join the FindEg administration team.`,
    message2: isRtl
      ? 'للبدء، يرجى النقر على الزر أدناه لإعداد حسابك واختيار كلمة مرور.'
      : 'To get started, please click the button below to set up your account and choose a password.',
    btnStr: isRtl ? 'إعداد حسابي' : 'Set Up My Account',
  };

  return (
    <EmailLayout previewText={content.title} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>

      <Text style={paragraph}>{content.greeting}</Text>
      <Text style={paragraph}>{content.message1}</Text>
      <Text style={paragraph}>{content.message2}</Text>

      <Section style={btnContainer}>
        <Button style={button} href={inviteLink}>
          {content.btnStr}
        </Button>
      </Section>
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

export default AdminInvitationEmail;
