import "@testing-library/jest-dom/vitest";

// Ensure jsdom environment is set up
if (typeof window === "undefined") {
  // @ts-ignore - jsdom polyfill for server components
  globalThis.window = globalThis;
}
