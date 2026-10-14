import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import messages from '../../../../../../messages/en.json';
import arabic from '../../../../../../messages/ar.json';

const { createDraftAction, push } = vi.hoisted(() => ({
  createDraftAction: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@i18n/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

vi.mock('../_actions/lists', () => ({
  createDraftAction,
}));

import { NewDraftForm } from './NewDraftForm';

const mockPartners = [
  { id: 1, nameEn: 'Cairo English School', nameAr: 'مدرسة القاهرة الإنجليزية', status: 'active' },
];

function show(locale: 'en' | 'ar' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? messages : arabic}>
      <NewDraftForm partners={mockPartners} locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('NewDraftForm title validation and submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders titleEn and titleAr without the HTML required attribute', () => {
    show();
    const titleEn = screen.getByTestId('title-en-input');
    const titleAr = screen.getByTestId('title-ar-input');

    expect(titleEn).not.toHaveAttribute('required');
    expect(titleAr).not.toHaveAttribute('required');
  });

  it('blocks submit and shows localized error when both titles are empty', async () => {
    show('en');

    fireEvent.change(screen.getByTestId('partner-select'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('academic-year-input'), { target: { value: '2026-2027' } });
    fireEvent.change(screen.getByTestId('grade-input'), { target: { value: 'Grade 1' } });

    fireEvent.click(screen.getByTestId('create-draft-submit-btn'));

    expect(createDraftAction).not.toHaveBeenCalled();
    expect(screen.getByTestId('draft-error-alert')).toHaveTextContent(
      messages.SchoolLists.Errors['invalid-input'],
    );
  });

  it('submits successfully when only titleEn is provided', async () => {
    createDraftAction.mockResolvedValue({ status: 'success', data: { id: 42 } });
    show('en');

    fireEvent.change(screen.getByTestId('partner-select'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('academic-year-input'), { target: { value: '2026-2027' } });
    fireEvent.change(screen.getByTestId('grade-input'), { target: { value: 'Grade 1' } });
    fireEvent.change(screen.getByTestId('title-en-input'), {
      target: { value: 'Grade 1 Supplies' },
    });

    fireEvent.click(screen.getByTestId('create-draft-submit-btn'));

    await waitFor(() => expect(createDraftAction).toHaveBeenCalled());
    const formData = createDraftAction.mock.calls[0][1] as FormData;
    expect(formData.get('titleEn')).toBe('Grade 1 Supplies');
    expect(formData.get('titleAr')).toBe('');
  });

  it('submits successfully when only titleAr is provided', async () => {
    createDraftAction.mockResolvedValue({ status: 'success', data: { id: 42 } });
    show('ar');

    fireEvent.change(screen.getByTestId('partner-select'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('academic-year-input'), { target: { value: '2026-2027' } });
    fireEvent.change(screen.getByTestId('grade-input'), { target: { value: 'Grade 1' } });
    fireEvent.change(screen.getByTestId('title-ar-input'), {
      target: { value: 'أدوات الصف الأول' },
    });

    fireEvent.click(screen.getByTestId('create-draft-submit-btn'));

    await waitFor(() => expect(createDraftAction).toHaveBeenCalled());
    const formData = createDraftAction.mock.calls[0][1] as FormData;
    expect(formData.get('titleEn')).toBe('');
    expect(formData.get('titleAr')).toBe('أدوات الصف الأول');
  });
});
