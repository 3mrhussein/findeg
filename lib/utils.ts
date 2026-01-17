// A simple utility function to merge class names, inspired by clsx and tailwind-merge.
// This is a core utility for building components with variants, as seen in shadcn/ui.

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
