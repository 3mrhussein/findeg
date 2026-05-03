import * as React from 'react';
import { Section, Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

const colors = {
  primary: '#4338CA',
  textPrimary: '#111827',
  border: '#E5E7EB',
};

interface SchoolListAccessRequestEmailProps {
  adminName: string;
  requesterName: string;
  requesterEmail: string;
  schoolName: string;
  requestId: string;
  locale?: string;
}

import env from '@findeg/env';

const BASE_URL = env.NEXT_PUBLIC_APP_URL;

/**
 *
 */
export const SchoolListAccessRequestEmail = ({
  adminName = 'Admin',
  requesterName = 'Parent',
  requesterEmail = 'parent@example.com',
  schoolName = 'International School',
  requestId = '123',
  locale = 'en',
}: SchoolListAccessRequestEmailProps) => {
  const isRtl = locale === 'ar';

  const content = {
    title: isRtl ? 'طلب وصول جديد 📬' : 'New Access Request 📬',
    greeting: isRtl ? `مرحباً ${adminName}،` : `Hello ${adminName},`,
    message: isRtl
      ? `لقد تفضل ${requesterName} (${requesterEmail}) بطلب الوصول إلى قوائم مستلزمات مدرسة ${schoolName}.`
      : `${requesterName} (${requesterEmail}) has requested access to the supply lists for ${schoolName}.`,
    actionStr: isRtl
      ? 'يرجى مراجعة الطلب والموافقة عليه أو رفضه من لوحة تحكم الإدارة.'
      : 'Please review the request and approve or deny it from the admin dashboard.',
    btnStr: isRtl ? 'مراجعة الطلب' : 'Review Request',
  };

  return (
    <EmailLayout previewText={content.title} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>

      <Text style={paragraph}>{content.greeting}</Text>
      <Text style={paragraph}>{content.message}</Text>
      <Text style={paragraph}>{content.actionStr}</Text>

      <Section style={btnContainer}>
        <Button style={button} href={`${BASE_URL}/admin/school-lists/requests/${requestId}`}>
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

export default SchoolListAccessRequestEmail;
