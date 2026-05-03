import * as React from 'react';
import { Section, Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

const colors = {
  primary: '#4338CA',
  textPrimary: '#111827',
  border: '#E5E7EB',
};

interface SchoolListAccessApprovedEmailProps {
  customerName: string;
  listName: string;
  schoolName: string;
  listId: string;
  locale?: string;
}

import env from '@findeg/env';

const BASE_URL = env.NEXT_PUBLIC_APP_URL;

/**
 *
 */
export const SchoolListAccessApprovedEmail = ({
  customerName = 'Parent',
  listName = 'Grade 4 Supplies',
  schoolName = 'International School',
  listId = '123',
  locale = 'en',
}: SchoolListAccessApprovedEmailProps) => {
  const isRtl = locale === 'ar';

  const content = {
    title: isRtl ? 'تمت الموافقة على طلب الوصول ✅' : 'Access Request Approved ✅',
    greeting: isRtl ? `مرحباً ${customerName}،` : `Hello ${customerName},`,
    message: isRtl
      ? `لقد تمت الموافقة على طلبك للوصول إلى قائمة مستلزمات المدارس الخاصة.`
      : `Your request to access the private school supply list has been approved.`,
    detailsObj: isRtl ? 'التفاصيل' : 'Details',
    schoolStr: isRtl ? 'المدرسة:' : 'School:',
    listStr: isRtl ? 'القائمة:' : 'List:',
    btnStr: isRtl ? 'عرض القائمة' : 'View List',
  };

  return (
    <EmailLayout previewText={content.title} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>

      <Text style={paragraph}>{content.greeting}</Text>
      <Text style={paragraph}>{content.message}</Text>

      <Section style={detailsBox}>
        <Heading as="h3" style={h3}>
          {content.detailsObj}
        </Heading>
        <Text style={detailText}>
          <strong>{content.schoolStr}</strong> {schoolName}
        </Text>
        <Text style={detailText}>
          <strong>{content.listStr}</strong> {listName}
        </Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={`${BASE_URL}/${locale}/lists/${listId}`}>
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

const h3 = {
  color: colors.textPrimary,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const paragraph = {
  color: colors.textPrimary,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const detailsBox = {
  backgroundColor: '#F9FAFB',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const detailText = {
  fontSize: '16px',
  color: colors.textPrimary,
  margin: '0 0 8px 0',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
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

export default SchoolListAccessApprovedEmail;
