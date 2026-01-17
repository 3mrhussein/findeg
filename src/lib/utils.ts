// A simple utility function to merge class names, inspired by clsx and tailwind-merge.
// This is a core utility for building components with variants, as seen in shadcn/ui.

/**
 * Merges class names into a single string.
 * 
 * This utility function filters out falsy values (undefined, null, false) and joins the remaining
 * class names with a space. It is a lightweight alternative to libraries like `clsx` or `classnames`.
 * 
 * @param {...(string | undefined | null | false)[]} inputs - The class names to merge.
 * @returns {string} The merged class name string.
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
