import type { ListSelection, ListSelectionView } from '@findeg/backend/modules/commerce/contracts';

export function ListSelectionEditor({
  locale,
  view,
  disabled,
  onChange,
}: {
  locale: 'en' | 'ar';
  view: ListSelectionView;
  disabled: boolean;
  onChange(selection: ListSelection): Promise<void>;
}) {
  const text = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  const { list, selection, pricing } = view;
  const frozen = list.status !== 'published' || !!list.replacedById;
  const change = (listItemId: number, variantId: number, quantity: number) =>
    onChange({
      ...selection,
      items: [
        ...selection.items.filter((item) => item.listItemId !== listItemId),
        ...(quantity > 0 ? [{ listItemId, variantId, quantity }] : []),
      ],
    });
  return (
    <section aria-label={text('List Selection', 'اختيارات القائمة')}>
      <h2>{list.title[locale]}</h2>
      <p>
        {list.schoolName} · {list.academicYear} · {list.grade}
      </p>
      <p>
        {text(
          'Your choices are saved separately from your Cart and other lists.',
          'اختياراتك محفوظة بشكل مستقل عن السلة والقوائم الأخرى.',
        )}
      </p>
      {frozen && (
        <p role="status">
          {text(
            'Archived list — view only. Start a fresh selection from the replacement link shared by your school.',
            'قائمة مؤرشفة — للعرض فقط. ابدأ اختيارات جديدة من رابط القائمة البديلة الذي تشاركه المدرسة.',
          )}
        </p>
      )}
      <fieldset disabled={disabled || frozen}>
        <legend>{text('Choose list items', 'اختر عناصر القائمة')}</legend>
        <label>
          {text('Set count', 'عدد المجموعات')}
          <input
            name="setCount"
            type="number"
            min="1"
            max="999"
            key={selection.setCount}
            defaultValue={selection.setCount}
            onBlur={(event) => {
              const setCount = Number(event.target.value);
              if (Number.isSafeInteger(setCount) && setCount > 0 && setCount <= 999)
                void onChange({
                  setCount,
                  items: selection.items.map((choice) => ({
                    ...choice,
                    quantity:
                      list.items.find((item) => item.id === choice.listItemId)!.quantity * setCount,
                  })),
                });
            }}
          />
        </label>
        <ul>
          {list.items.map((item) => {
            const choice = selection.items.find((choice) => choice.listItemId === item.id);
            const options =
              view.options.find((option) => option.listItemId === item.id)?.variants ?? [];
            const defaultVariant = options.find((variant) => variant.id === item.variantId);
            return (
              <li key={item.id} data-list-item={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!choice}
                    onChange={(event) =>
                      void change(
                        item.id,
                        item.variantId,
                        event.target.checked ? item.quantity * selection.setCount : 0,
                      )
                    }
                  />
                  {item.label[locale]} ·{' '}
                  {item.required === false
                    ? text('Optional', 'اختياري')
                    : text('Required', 'مطلوب')}
                </label>
                <p>
                  {text('Prescribed quantity', 'الكمية المطلوبة')}:{' '}
                  {item.quantity * selection.setCount}
                </p>
                {item.exactItem && (
                  <p>{text('Exact Item — no substitutions', 'عنصر محدد — لا يسمح بالاستبدال')}</p>
                )}
                {item.specification && (
                  <p>
                    {text('Required attributes', 'الخصائص المطلوبة')}:{' '}
                    {Object.entries(item.specification.attributes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' · ')}
                  </p>
                )}
                {choice && (
                  <>
                    <label>
                      {text('Product choice', 'اختيار المنتج')}
                      <select
                        aria-label={`${text('Product choice', 'اختيار المنتج')} ${item.label[locale]}`}
                        value={choice.variantId}
                        onChange={(event) =>
                          void change(item.id, Number(event.target.value), choice.quantity)
                        }
                      >
                        {!options.some((option) => option.id === choice.variantId) && (
                          <option value={choice.variantId}>
                            {text(
                              'Unavailable choice — choose again',
                              'اختيار غير متاح — اختر مجددًا',
                            )}
                          </option>
                        )}
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name[locale] ?? option.sku} · {option.label[locale]} ·{' '}
                            {option.brand[locale] ?? text('Brand unspecified', 'العلامة غير محددة')}{' '}
                            · {option.price} EGP
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {text('Quantity', 'الكمية')}
                      <input
                        aria-label={`${text('Quantity', 'الكمية')} ${item.label[locale]}`}
                        type="number"
                        min="1"
                        max="999"
                        key={choice.quantity}
                        defaultValue={choice.quantity}
                        onBlur={(event) => {
                          const quantity = Number(event.target.value);
                          if (Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 999)
                            void change(item.id, choice.variantId, quantity);
                        }}
                      />
                    </label>
                    <p>
                      {text(
                        'Compare prices, brands and unspecified attributes before choosing an alternative.',
                        'قارن الأسعار والعلامات التجارية والخصائص غير المحددة قبل اختيار البديل.',
                      )}
                    </p>
                    <ul>
                      {options.map((option) => (
                        <li key={option.id}>
                          <strong>
                            {option.id === item.variantId
                              ? text('Default', 'الافتراضي')
                              : text('Allowed Alternative', 'بديل مسموح')}
                            : {option.sku}
                          </strong>
                          {' · '}
                          {text('Price', 'السعر')}: {option.price} EGP
                          {' · '}
                          {text('Brand', 'العلامة التجارية')}:{' '}
                          {option.brand[locale] ?? text('Unspecified', 'غير محددة')}
                          {defaultVariant && option.id !== item.variantId && (
                            <span>
                              {' '}
                              ({text('Default price', 'السعر الافتراضي')}: {defaultVariant.price}{' '}
                              EGP; {text('Default brand', 'العلامة الافتراضية')}:{' '}
                              {defaultVariant.brand[locale] ?? text('Unspecified', 'غير محددة')})
                            </span>
                          )}
                          <p>
                            {text('Unspecified attributes', 'الخصائص غير المحددة')}:{' '}
                            {Object.entries(option.attributes)
                              .filter(([key]) => !(key in (item.specification?.attributes ?? {})))
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' · ') || text('None recorded', 'لا توجد بيانات')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>
      {!pricing && (
        <p role="status">
          {text(
            'Some choices are unavailable. Update your selection before checkout.',
            'بعض الاختيارات غير متاحة. حدّث اختياراتك قبل إتمام الطلب.',
          )}
        </p>
      )}
      {pricing && (
        <>
          <p role="status">
            {pricing.completeness.complete
              ? text('List complete', 'القائمة مكتملة')
              : text(
                  'List incomplete — you can still checkout',
                  'القائمة غير مكتملة — يمكنك إتمام الطلب',
                )}
          </p>
          <p>
            {text('List Offer', 'عرض القائمة')}: {view.offerBasisPoints / 100}%
          </p>
          <p>
            {text('Subtotal after List Offer', 'المجموع بعد عرض القائمة')}: {pricing.subtotal} EGP
          </p>
        </>
      )}
    </section>
  );
}
