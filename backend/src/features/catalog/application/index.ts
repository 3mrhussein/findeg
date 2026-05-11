export * from './interfaces';
export * from './services';
export * from './dtos';

// NOTE: Action functions (createProduct, createBrand, etc.) are NOT exported because they:
// 1. Use old ServiceContainer pattern with @ imports that break Turbopack bundling
// 2. Should be reimplemented in the app data layer using service factories
// Apps should create their own server actions using createCatalogServices()

// Legacy query logic has been consolidated into the service layer.
// Apps should use createCatalogServices() or @findeg/backend entry points.
