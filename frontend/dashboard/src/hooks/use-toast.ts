'use client';

// One toast store for the app: the <Toaster /> in the layout renders the store from @findeg/ui,
// so a separate copy here would dispatch toasts that are never displayed.
export { useToast, toast } from '@findeg/ui';
