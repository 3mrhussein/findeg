import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import messages from '../../../../../../messages/en.json';
import arabic from '../../../../../../messages/ar.json';

const { addItemAction } = vi.hoisted(() => ({ addItemAction: vi.fn() }));
vi.mock('../_actions/lists', () => ({
  addItemAction,
  updateItemAction: vi.fn(),
  getCategoryOptionsAction: vi.fn(),
}));
import { ItemDialog } from './ItemDialog';

function show(locale: 'en' | 'ar' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? messages : arabic}>
      <ItemDialog open onOpenChange={vi.fn()} listId={7} categories={[]} item={null} />
    </NextIntlClientProvider>,
  );
}

describe('School list quantity and localized failures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());
  it('lets Staff clear the quantity and replace it with 5 instead of saving 15', async () => {
    addItemAction.mockResolvedValue({ status: 'success' });
    show();
    const quantity = screen.getByTestId('item-quantity');
    fireEvent.change(quantity, { target: { value: '' } });
    expect(quantity).toHaveValue(null);
    fireEvent.change(quantity, { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('item-label-en'), { target: { value: 'Notebook' } });
    fireEvent.click(screen.getByTestId('dialog-save-btn'));
    await waitFor(() => expect(addItemAction).toHaveBeenCalled());
    expect(addItemAction.mock.calls[0][2].get('quantity')).toBe('5');
  });
  it('renders the server refusal in Arabic', async () => {
    addItemAction.mockResolvedValue({ status: 'error', message: 'invalid-input' });
    show('ar');
    fireEvent.click(screen.getByTestId('dialog-save-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('item-error-alert')).toHaveTextContent(
        arabic.SchoolLists.Errors['invalid-input'],
      ),
    );
  });
});
