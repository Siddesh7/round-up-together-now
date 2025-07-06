import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format ETH amounts to avoid scientific notation
export function formatEth(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (num === 0) return "0";

  // For very small amounts, use fixed decimal places
  if (num < 0.001) {
    return num.toFixed(9).replace(/\.?0+$/, "");
  }

  // For larger amounts, use appropriate decimal places
  if (num < 1) {
    return num.toFixed(6).replace(/\.?0+$/, "");
  }

  return num.toFixed(4).replace(/\.?0+$/, "");
}
