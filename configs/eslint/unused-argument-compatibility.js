// Existing ignored inputs retained during R02's stricter unused-argument rollout.
// These exact file/name pairs preserve API/prop shapes, not evidence that the inputs work.
// New APIs and dummy parameters receive no underscore-name exemption.
export const unusedArgumentCompatibility = {
  'packages/catalog': [
    {
      files: ['src/features/administration-admin-brand-service/index.ts'],
      names: ['_activeOnly'],
      reason: 'Published getAll(activeOnly, language) position; legacy query ignores activeOnly.',
    },
    {
      files: [
        'src/features/administration-admin-category-service/index.ts',
        'src/features/administration-admin-product-read-service/index.ts',
      ],
      names: ['_language'],
      reason: 'Published legacy read signatures accept locale but return raw untranslated rows.',
    },
    {
      files: ['src/features/administration-product-import-service/index.ts'],
      names: ['_auditUserId'],
      reason:
        'Published import signature; the existing validation-only placeholder does not audit.',
    },
  ],
  'frontend/storefront': [
    {
      files: ['src/app/\\[locale\\]/(storefront)/(user)/my-account/settings/SettingsPage.test.tsx'],
      names: ['_opts'],
      reason: 'Existing router test-double options signature.',
    },
    {
      files: ['src/app/\\[locale\\]/error.tsx'],
      names: ['_error'],
      reason: 'Framework error-boundary props; only reset is rendered.',
    },
    {
      files: ['src/data/catalog/queries.ts'],
      names: ['_query'],
      reason: 'Collection page query signature; current implementation ignores search filters.',
    },
    {
      files: ['src/data/helpers/mappers.ts'],
      names: ['_locale'],
      reason: 'Legacy mapper accepts locale but projects locale-independent category data.',
    },
  ],
  'frontend/dashboard': [
    {
      files: [
        'src/app/\\[locale\\]/(dashboard)/_components/DashboardWidgets.tsx',
        'src/app/\\[locale\\]/(dashboard)/orders/_components/OrdersContent.tsx',
        'src/app/\\[locale\\]/(dashboard)/products/_components/ProductForm/index.tsx',
        'src/app/\\[locale\\]/_components/shell/AdminSidebar.tsx',
        'src/data/resources/queries.ts',
        'src/queries/dashboard-queries.ts',
      ],
      names: ['_locale'],
      reason: 'Existing component/query signatures; these implementations do not consume locale.',
    },
    {
      files: ['src/app/\\[locale\\]/(dashboard)/products/_components/ProductRow.tsx'],
      names: ['_onDelete'],
      reason: 'Existing row props; deletion is not wired by this component.',
    },
    {
      files: ['src/app/\\[locale\\]/(dashboard)/school-lists/_actions/offer.ts'],
      names: ['_previous'],
      reason: 'React action-state callback must accept the bound previous-state argument.',
    },
    {
      files: ['src/app/\\[locale\\]/_components/shell/AdminHeader.tsx'],
      names: ['_locale', '_notificationSlot'],
      reason: 'Existing shell props retain the currently unused notification slot.',
    },
    {
      files: ['src/data/products/actions.ts'],
      names: ['_csvFile'],
      reason: 'Existing import action signature; CSV import remains an unrelated placeholder.',
    },
    {
      files: ['src/data/products/queries.ts'],
      names: ['_filters'],
      reason: 'Existing search signature; additional filters remain unimplemented.',
    },
  ],
};
