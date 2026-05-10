import * as React from 'react';
import { Section, Text, Button, Heading, Row, Column, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

// Redefining colors locally for the template to avoid complex imports in emails
const colors = {
  primary: '#4338CA',
  textPrimary: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
};

interface OrderConfirmationEmailProps {
  orderId: string | number;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  total: string;
  deliveryAddress: string;
  locale?: string;
}

import env from '@findeg/env';

const BASE_URL = env.NEXT_PUBLIC_APP_URL;

/**
 *
 */
export const OrderConfirmationEmail = ({
  orderId = '10001',
  customerName = 'Customer',
  items = [{ name: 'Sample Item', quantity: 1, price: 'EGP 100.00' }],
  total = 'EGP 100.00',
  deliveryAddress = '123 Main St, Cairo, Egypt',
  locale = 'en',
}: OrderConfirmationEmailProps) => {
  const isRtl = locale === 'ar';

  const content = {
    title: isRtl ? 'تأكيد الطلب 🧾' : 'Order Confirmation 🧾',
    greeting: isRtl ? `مرحباً ${customerName}،` : `Hello ${customerName},`,
    message: isRtl
      ? `شكراً لتسوقك من فايند إي جي. لقد استلمنا طلبك (#${orderId}) ونقوم حالياً بتجهيزه. سنرسل لك بريداً إلكترونياً آخر عندما يتم شحن طلبك.`
      : `Thank you for shopping at FindEg. We've received your order (#${orderId}) and are currently processing it. We'll send you another email when your order has been shipped.`,
    orderSummaryStr: isRtl ? 'ملخص الطلب' : 'Order Summary',
    itemStr: isRtl ? 'العنصر' : 'Item',
    qtyStr: isRtl ? 'الكمية' : 'Qty',
    priceStr: isRtl ? 'السعر' : 'Price',
    totalStr: isRtl ? 'المجموع الكلي' : 'Total',
    shippingAddressStr: isRtl ? 'عنوان التوصيل' : 'Shipping Address',
    trackOrderStr: isRtl ? 'تتبع الطلب' : 'Track Order',
  };

  return (
    <EmailLayout previewText={content.message} locale={locale}>
      <Heading style={h1}>{content.title}</Heading>

      <Text style={paragraph}>{content.greeting}</Text>
      <Text style={paragraph}>{content.message}</Text>

      <Section style={orderSummaryBox}>
        <Heading as="h2" style={h2}>
          {content.orderSummaryStr} #{orderId}
        </Heading>

        {/* Table Header */}
        <Row style={tableHeader}>
          <Column style={isRtl ? colItemRtl : colItem}>{content.itemStr}</Column>
          <Column style={isRtl ? colQtyRtl : colQty}>{content.qtyStr}</Column>
          <Column style={isRtl ? colPriceRtl : colPrice}>{content.priceStr}</Column>
        </Row>

        {/* Table Body */}
        {items.map((item, i) => (
          <Row key={i} style={tableRow}>
            <Column style={isRtl ? colItemRtl : colItem}>
              <Text style={itemName}>{item.name}</Text>
            </Column>
            <Column style={isRtl ? colQtyRtl : colQty}>
              <Text style={itemText}>{item.quantity}</Text>
            </Column>
            <Column style={isRtl ? colPriceRtl : colPrice}>
              <Text style={itemBold}>{item.price}</Text>
            </Column>
          </Row>
        ))}

        <Hr style={divider} />

        <Row>
          <Column style={{ width: '60%' }}></Column>
          <Column style={isRtl ? colQtyRtl : colQty}>
            <Text style={itemBold}>{content.totalStr}</Text>
          </Column>
          <Column style={isRtl ? colPriceRtl : colPrice}>
            <Text style={totalText}>{total}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={addressBox}>
        <Heading as="h3" style={h3}>
          {content.shippingAddressStr}
        </Heading>
        <Text style={addressText}>{deliveryAddress}</Text>
      </Section>

      <Section style={btnContainer}>
        <Button style={button} href={`${BASE_URL}/${locale}/my-account/orders/${orderId}`}>
          {content.trackOrderStr}
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

const h2 = {
  color: colors.textPrimary,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const h3 = {
  color: colors.textPrimary,
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const paragraph = {
  color: colors.textPrimary,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const orderSummaryBox = {
  backgroundColor: '#F9FAFB',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const tableHeader = {
  borderBottom: `2px solid ${colors.border}`,
  paddingBottom: '8px',
  marginBottom: '12px',
};

const tableRow = {
  borderBottom: `1px solid ${colors.border}`,
  paddingVertical: '12px',
};

const divider = {
  borderColor: colors.border,
  margin: '16px 0',
};

const colItem = { width: '60%' };
const colQty = { width: '15%', textAlign: 'center' as const };
const colPrice = { width: '25%', textAlign: 'right' as const };

const colItemRtl = { width: '60%', textAlign: 'right' as const };
const colQtyRtl = { width: '15%', textAlign: 'center' as const };
const colPriceRtl = { width: '25%', textAlign: 'left' as const };

const itemName = {
  fontSize: '14px',
  color: colors.textPrimary,
  margin: '0',
  lineHeight: '20px',
};

const itemText = {
  fontSize: '14px',
  color: colors.textPrimary,
  margin: '0',
};

const itemBold = {
  fontSize: '14px',
  fontWeight: '600',
  color: colors.textPrimary,
  margin: '0',
};

const totalText = {
  fontSize: '16px',
  fontWeight: '700',
  color: colors.primary,
  margin: '0',
};

const addressBox = {
  margin: '0 0 32px 0',
};

const addressText = {
  color: colors.textMuted,
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center' as const,
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

export default OrderConfirmationEmail;
