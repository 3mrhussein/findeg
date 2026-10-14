import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import type { ProductFormValues } from '@/interfaces';
import messages from '../../../../../../../../messages/en.json';
import { VariantsTab } from './VariantsTab';

function ProductEditor({ price }: { price: number }) {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      variants: [
        {
          sku: 'NOTEBOOK',
          localizedLabel: { en: 'Notebook', ar: 'دفتر' },
          basePrice: price,
          isActive: true,
          isDefault: true,
          images: [],
          attributes: [],
        },
      ],
    },
  });
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...form}>
        <VariantsTab />
      </FormProvider>
    </NextIntlClientProvider>
  );
}

describe('Variant draft price rendering', () => {
  it.each([
    { price: 12.345, preview: 'EGP 12.35' },
    { price: NaN, preview: 'EGP 0.00' },
    { price: Infinity, preview: 'EGP 0.00' },
  ])('renders an unfinished price %s without throwing', ({ price, preview }) => {
    render(<ProductEditor price={price} />);
    expect(screen.getByText(preview)).toBeInTheDocument();
  });
});
