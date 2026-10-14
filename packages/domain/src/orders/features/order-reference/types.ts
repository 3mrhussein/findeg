declare const reference: unique symbol;

/** Public, human-readable identifier: `FE-` plus six Crockford base32 characters (not a secret). */
export type OrderReference = string & { readonly [reference]: 'OrderReference' };
