import 'server-only';
import { createWebRuntime } from '@findeg/runtime';

let runtime: ReturnType<typeof createWebRuntime> | undefined;
export function getWebRuntime() {
  return (runtime ??= createWebRuntime(process.env));
}
