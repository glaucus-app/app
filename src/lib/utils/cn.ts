/**
 * Utility function for conditionally joining CSS class names
 * A simple implementation of clsx/cn pattern
 */

type ClassValue = string | undefined | null | false;

/**
 * Combine class names, filtering out falsy values
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Conditionally include a class based on a condition
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string,
): string {
  return condition ? trueClass : (falseClass ?? "");
}
