declare const entity: unique symbol;

/**
 * The identity of one domain entity. It is a number underneath, but each entity has its own
 * branded id type, so an `OrderId` can never stand in for a `CustomerId` or a bare number.
 * The layer that loads an entity brands its id once; the domain never sees storage types.
 */
export type Id<Entity extends string> = number & { readonly [entity]: Entity };
