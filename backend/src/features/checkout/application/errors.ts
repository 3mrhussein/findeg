export class UnavailableVariantError extends Error {
  constructor(message = 'One or more requested variants are inactive or unavailable') {
    super(message);
    this.name = 'UnavailableVariantError';
  }
}

export class ListUnavailableError extends Error {
  constructor() {
    super('School Supply List is unavailable for checkout');
    this.name = 'ListUnavailableError';
  }
}

export class SelectionInvalidError extends Error {
  constructor(readonly listItemIds: number[]) {
    super('One or more School Supply List selections are invalid');
    this.name = 'SelectionInvalidError';
  }
}
