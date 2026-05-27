/**
 * WCAG 2.1 AA Color Contrast Tests
 *
 * Tests verify that color combinations meet WCAG 2.1 AA requirements:
 * - Normal text (< 18px or < 14px bold): 4.5:1 minimum
 * - Large text (>= 18px or >= 14px bold): 3:1 minimum
 * - UI components: 3:1 minimum
 *
 * Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */

import { describe, it, expect } from "vitest";

/**
 * Calculate relative luminance of a color
 * Per WCAG 2.1: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const sRGB = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Returns the ratio (e.g., 4.5 for 4.5:1)
 */
function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
): number {
  const L1 = getRelativeLuminance(color1.r, color1.g, color1.b);
  const L2 = getRelativeLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

describe("WCAG 2.1 AA Color Contrast", () => {
  // Background colors
  const gray900 = hexToRgb("#111827"); // bg-gray-900 (main background)
  const gray800 = hexToRgb("#1f2937"); // bg-gray-800 (card background)
  const gray700 = hexToRgb("#374151"); // bg-gray-700

  // Text colors
  const gray100 = hexToRgb("#f3f4f6"); // text-gray-100
  const gray300 = hexToRgb("#d1d5db"); // text-gray-300
  const white = hexToRgb("#ffffff");
  const black = hexToRgb("#000000");

  // Brand/UI colors from globals.css
  const errorRed = hexToRgb("#DC2626"); // red-600 (error color per FR-045)
  const successGreen = hexToRgb("#15803D"); // green-700 (WCAG AA compliant)
  const warningYellow = hexToRgb("#CA8A04"); // yellow-600
  const blue500 = hexToRgb("#3b82f6"); // focus ring
  const blue600 = hexToRgb("#2563eb"); // primary button

  // Tier badge colors
  const tierS = hexToRgb("#FFD700"); // gold
  const tierA = hexToRgb("#C0C0C0"); // silver
  const tierB = hexToRgb("#CD7F32"); // bronze
  const tierC = hexToRgb("#808080"); // gray

  describe("Text on backgrounds (4.5:1 minimum for normal text)", () => {
    it("gray-100 on gray-900 should have >= 4.5:1 contrast", () => {
      const ratio = getContrastRatio(gray100, gray900);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("gray-300 on gray-900 should have >= 4.5:1 contrast", () => {
      const ratio = getContrastRatio(gray300, gray900);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("white on gray-900 should have >= 4.5:1 contrast", () => {
      const ratio = getContrastRatio(white, gray900);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("white on gray-800 should have >= 4.5:1 contrast", () => {
      const ratio = getContrastRatio(white, gray800);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Error/Status colors (4.5:1 minimum per FR-045)", () => {
    it("white on error red (#DC2626) should have >= 4.5:1 contrast", () => {
      const ratio = getContrastRatio(white, errorRed);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("white on success green should have >= 4.5:1 contrast", () => {
      const ratio = getContrastRatio(white, successGreen);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("black on warning yellow should have >= 4.5:1 contrast", () => {
      const ratio = getContrastRatio(black, warningYellow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Tier badge colors (3:1 minimum for UI components)", () => {
    it("black on tier S (gold) should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(black, tierS);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("black on tier A (silver) should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(black, tierA);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("white on tier B (bronze) should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(white, tierB);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("white on tier C/D (gray) should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(white, tierC);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Button colors (3:1 minimum for UI components)", () => {
    it("white on primary button (blue-600) should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(white, blue600);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("white on blue-500 focus ring should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(white, blue500);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Focus ring visibility (3:1 minimum against background)", () => {
    it("blue-500 focus ring on gray-900 should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(blue500, gray900);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("blue-500 focus ring on gray-800 should have >= 3:1 contrast", () => {
      const ratio = getContrastRatio(blue500, gray800);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });
});
