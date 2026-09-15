/** Application outcomes are database- and transport-independent. */
export type TransactionOutcome<Value, Rejection> =
  { readonly ok: true; readonly value: Value } | { readonly ok: false; readonly error: Rejection };

/**
 * Participating adapters are bound to one transaction for this callback only.
 * Await every adapter operation. Do not retain adapters or perform network effects.
 * Success commits before resolving; business rejection and exceptions roll back.
 */
export interface TransactionRunner<Adapters> {
  run<Value, Rejection>(
    operation: (adapters: Adapters) => Promise<TransactionOutcome<Value, Rejection>>,
  ): Promise<TransactionOutcome<Value, Rejection>>;
}
