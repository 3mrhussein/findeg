/**
 * A broken business rule. Each subclass names its rule with a stable `code` that callers can
 * branch on. It carries no HTTP status or presentation: the application layer maps codes to
 * responses and messages.
 */
export abstract class DomainError<Code extends string = string> extends Error {
  readonly code: Code;

  protected constructor(code: Code, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
