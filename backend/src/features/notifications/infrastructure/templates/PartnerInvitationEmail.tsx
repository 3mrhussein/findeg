import * as React from 'react';
import { Section, Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

const colors = {
  primary: '#4338CA',
  textPrimary: '#111827',
  textMuted: '#6B7280',
};

interface PartnerInvitationEmailProps {
  partnerName: string;
  inviteLink: string;
  expiresAt: string;
  locale?: string;
}

export const PartnerInvitationEmail = ({
  partnerName = 'Example School',
  inviteLink = 'https://findeg.com/en/partner/invitations/token',
  expiresAt = '1 January 2030',
  locale = 'en',
}: PartnerInvitationEmailProps) => {
  const isRtl = locale === 'ar';

  const content = {
    title: isRtl ? `دعوة للانضمام إلى ${partnerName}` : `You're invited to join ${partnerName}`,
    message: isRtl
      ? `تمت دعوتك للانضمام إلى ${partnerName} على فايند إي جي. اضغط على الزر أدناه لقبول الدعوة. الدعوة صالحة حتى ${expiresAt}.`
      : `You have been invited to join ${partnerName} on FindEg. Click the button below to accept. The invitation is valid until ${expiresAt}.`,
    btnStr: isRtl ? 'قبول الدعوة' : 'Accept invitation',
    securityNote: isRtl
      ? 'إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني بأمان.'
      : "If you weren't expecting this invitation, you can safely ignore this email.",
  };

  return (
    <EmailLayout previewText={content.title} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>
      <Text style={paragraph}>{content.message}</Text>
      <Section style={btnContainer}>
        <Button style={button} href={inviteLink}>
          {content.btnStr}
        </Button>
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

const btnContainer = { textAlign: 'center' as const, margin: '32px 0' };

const button = {
  backgroundColor: colors.primary,
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
};

export default PartnerInvitationEmail;
