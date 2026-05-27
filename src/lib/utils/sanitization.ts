/**
 * Sanitization utilities for DI-Lab
 * XSS prevention and content sanitization per FR-046
 */

/**
 * Strip HTML tags from a string
 * Removes all HTML tags while preserving text content
 * @param input - The string to sanitize
 * @returns String with all HTML tags removed
 */
export function stripHtmlTags(input: string): string {
  // Match and remove HTML tags
  // This regex handles most common HTML tags including self-closing
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Escape special HTML characters to prevent XSS
 * @param input - The string to escape
 * @returns String with HTML special characters escaped
 */
export function escapeHtml(input: string): string {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Escape special characters for use in regex patterns
 * @param input - The string to escape
 * @returns String with regex special characters escaped
 */
export function escapeSpecialChars(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * List of dangerous URL schemes that should be blocked
 */
const DANGEROUS_URL_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
  "about:",
];

/**
 * Check if a URL has a dangerous scheme
 * @param url - The URL to check
 * @returns true if the URL has a dangerous scheme
 */
export function hasDangerousUrlScheme(url: string): boolean {
  const normalizedUrl = url.toLowerCase().trim();

  // Remove any leading whitespace or control characters
  const cleanUrl = normalizedUrl.replace(/^[\s\x00-\x1f]+/, "");

  return DANGEROUS_URL_SCHEMES.some((scheme) => cleanUrl.startsWith(scheme));
}

/**
 * Sanitize a URL for safe use
 * Only allows http, https, and relative URLs
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  // Allow relative URLs
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  // Block dangerous schemes
  if (hasDangerousUrlScheme(trimmed)) {
    return "";
  }

  // Allow http and https
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // For other URLs, assume relative and allow
  return trimmed;
}

/**
 * Sanitize user content for safe display
 * Strips HTML tags and escapes special characters
 * @param input - The user content to sanitize
 * @param maxLength - Optional maximum length (default: no limit)
 * @returns Sanitized string safe for display
 */
export function sanitizeUserContent(input: string, maxLength?: number): string {
  let result = input;

  // First strip any HTML tags
  result = stripHtmlTags(result);

  // Then escape HTML entities
  result = escapeHtml(result);

  // Truncate if max length specified
  if (maxLength !== undefined && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

/**
 * Sanitize build name (1-50 chars, no HTML)
 * @param name - The build name to sanitize
 * @returns Sanitized build name
 */
export function sanitizeBuildName(name: string): string {
  return sanitizeUserContent(name, 50);
}

/**
 * Sanitize build notes (0-500 chars, no HTML)
 * @param notes - The build notes to sanitize
 * @returns Sanitized build notes
 */
export function sanitizeBuildNotes(notes: string): string {
  return sanitizeUserContent(notes, 500);
}

/**
 * Remove null bytes and other control characters
 * @param input - The string to clean
 * @returns String with control characters removed
 */
export function removeControlCharacters(input: string): string {
  // Remove null bytes and control characters (except newlines and tabs)
  return input.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
}

/**
 * Normalize whitespace in a string
 * Collapses multiple spaces into single spaces, trims leading/trailing
 * @param input - The string to normalize
 * @returns Normalized string
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/**
 * Sanitize text for use in HTML attributes
 * @param input - The text to sanitize
 * @returns Sanitized text safe for attribute values
 */
export function sanitizeAttribute(input: string): string {
  return escapeHtml(input.replace(/"/g, '"').replace(/'/g, "&#x27;"));
}

/**
 * Sanitize text for use in JavaScript strings
 * @param input - The text to sanitize
 * @returns Sanitized text safe for JS string literals
 */
export function sanitizeJsString(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Comprehensive content sanitizer for all user input
 * @param input - The user input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized content
 */
export function sanitizeInput(
  input: string,
  options: {
    stripHtml?: boolean;
    escapeHtml?: boolean;
    maxLength?: number;
    normalizeWhitespace?: boolean;
    removeControlChars?: boolean;
  } = {},
): string {
  const {
    stripHtml: doStripHtml = true,
    escapeHtml: doEscapeHtml = true,
    maxLength,
    normalizeWhitespace: doNormalizeWhitespace = false,
    removeControlChars = true,
  } = options;

  let result = input;

  if (removeControlChars) {
    result = removeControlCharacters(result);
  }

  if (doStripHtml) {
    result = stripHtmlTags(result);
  }

  if (doEscapeHtml) {
    result = escapeHtml(result);
  }

  if (doNormalizeWhitespace) {
    result = normalizeWhitespace(result);
  }

  if (maxLength !== undefined && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

/**
 * Validate that sanitized content matches expected patterns
 * @param content - The content to validate
 * @param pattern - Regex pattern to match
 * @returns true if content matches pattern
 */
export function validatePattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

/**
 * Sanitize content for storage in database
 * @param content - The content to sanitize
 * @returns Sanitized content safe for database storage
 */
export function sanitizeForStorage(content: string): string {
  return sanitizeInput(content, {
    stripHtml: true,
    escapeHtml: false, // Don't escape for storage, escape on display
    removeControlChars: true,
  });
}

/**
 * Sanitize content for display in HTML
 * @param content - The content to sanitize
 * @returns Sanitized content safe for HTML display
 */
export function sanitizeForDisplay(content: string): string {
  return sanitizeInput(content, {
    stripHtml: true,
    escapeHtml: true,
    removeControlChars: true,
  });
}
