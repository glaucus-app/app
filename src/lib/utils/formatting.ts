/**
 * Formatting utilities for DI-Lab
 * Provides consistent number and date formatting across the application
 */

/**
 * Format a number with K suffix for thousands (>=10,000) and M suffix for millions (>=1,000,000)
 * @param value - The number to format
 * @param decimals - Number of decimal places for suffix notation (default: 1)
 * @returns Formatted string (e.g., "15.2K", "2.4M", "9,999")
 */
export function formatNumber(value: number, decimals: number = 1): string {
  if (value < 0) {
    return `-${formatNumber(-value, decimals)}`;
  }

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(decimals)}M`;
  }

  if (value >= 10_000) {
    const thousands = value / 1_000;
    return `${thousands.toFixed(decimals)}K`;
  }

  // For numbers under 10,000, format with commas
  return value.toLocaleString("en-US");
}

/**
 * Format gem power with appropriate suffix and tooltip-friendly precision
 * @param gemPower - The gem power value to format
 * @returns Formatted string (e.g., "15.2K GP", "2.4M GP", "999 GP")
 */
export function formatGemPower(gemPower: number): string {
  return `${formatNumber(gemPower)} GP`;
}

/**
 * Format platinum currency with appropriate suffix
 * @param platinum - The platinum amount
 * @returns Formatted string (e.g., "15.2K Platinum", "999 Platinum")
 */
export function formatPlatinum(platinum: number): string {
  return `${formatNumber(platinum)} Platinum`;
}

/**
 * Format telluric pearls with appropriate suffix
 * @param pearls - The pearl count
 * @returns Formatted string (e.g., "15 Pearls", "1.2K Pearls")
 */
export function formatPearls(pearls: number): string {
  return `${formatNumber(pearls)} ${pearls === 1 ? "Pearl" : "Pearls"}`;
}

/**
 * Format telluric fragments with appropriate suffix
 * @param fragments - The fragment count
 * @returns Formatted string (e.g., "1.5K Fragments", "99 Fragments")
 */
export function formatFragments(fragments: number): string {
  return `${formatNumber(fragments)} ${fragments === 1 ? "Fragment" : "Fragments"}`;
}

/**
 * Format fading embers with appropriate suffix
 * @param embers - The ember count
 * @returns Formatted string (e.g., "24.5K Embers", "500 Embers")
 */
export function formatEmbers(embers: number): string {
  return `${formatNumber(embers)} ${embers === 1 ? "Ember" : "Embers"}`;
}

/**
 * Format dawning echoes (rare currency, usually small numbers)
 * @param echoes - The echo count
 * @returns Formatted string (e.g., "5 Echoes", "1 Echo")
 */
export function formatEchoes(echoes: number): string {
  return `${formatNumber(echoes)} ${echoes === 1 ? "Echo" : "Echoes"}`;
}

/**
 * Format resonance value
 * @param resonance - The resonance value
 * @returns Formatted string (e.g., "8,500 Resonance")
 */
export function formatResonance(resonance: number): string {
  return `${formatNumber(resonance)} Resonance`;
}

/**
 * Format combat rating
 * @param cr - The combat rating value
 * @returns Formatted string (e.g., "+245 CR")
 */
export function formatCombatRating(cr: number): string {
  return `${cr >= 0 ? "+" : ""}${formatNumber(cr)} CR`;
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
  if (months > 0) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  if (weeks > 0) {
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (seconds > 0) {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
  }
  return "just now";
}

/**
 * Format a date as a localized string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  return new Date(date).toLocaleDateString("en-US", options);
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "2m 30s", "45s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format star rating as text (e.g., "1-star", "2-star", "5-star")
 * @param starRating - The star rating (1, 2, or 5)
 * @returns Formatted string
 */
export function formatStarRating(starRating: 1 | 2 | 5): string {
  return `${starRating}-star`;
}

/**
 * Format quality as text (e.g., "Quality 1", "Quality 5")
 * @param quality - The quality level (1-5)
 * @returns Formatted string
 */
export function formatQuality(quality: number): string {
  return `Quality ${quality}`;
}

/**
 * Format rank as text (e.g., "Rank 1", "Rank 10")
 * @param rank - The rank level (1-10)
 * @returns Formatted string
 */
export function formatRank(rank: number): string {
  return `Rank ${rank}`;
}

/**
 * Format tier ranking with icon (S/A/B/C/D)
 * @param tier - The tier ranking
 * @returns Formatted string with tier letter
 */
export function formatTierRanking(tier: "S" | "A" | "B" | "C" | "D"): string {
  const tierColors: Record<string, string> = {
    S: "Gold",
    A: "Silver",
    B: "Bronze",
    C: "Gray",
    D: "Gray",
  };
  return `${tier}-Tier (${tierColors[tier]})`;
}

/**
 * Format a percentage value
 * @param value - The value (0-1 or 0-100 based on isDecimal)
 * @param decimals - Number of decimal places
 * @param isDecimal - Whether the value is a decimal (0-1) or percentage (0-100)
 * @returns Formatted percentage string (e.g., "45.5%")
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  isDecimal: boolean = true,
): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}
