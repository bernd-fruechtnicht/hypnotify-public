/**
 * Legal Information Configuration
 *
 * This file contains placeholder values for legal information (Impressum).
 * For deployments (Vercel, EAS Build, etc.), use Environment Variables:
 * - EXPO_PUBLIC_LEGAL_OPERATOR
 * - EXPO_PUBLIC_LEGAL_ADDRESS
 * - EXPO_PUBLIC_LEGAL_EMAIL
 *
 * Priority:
 * 1. Environment Variables (for deployments)
 * 2. Values in this file (fallback - currently placeholders)
 *
 * For local development, you can override the values in this file,
 * but Environment Variables are recommended for consistency.
 */

export interface LegalInfo {
  operator: string;
  address: string;
  email: string;
}

// Try to load from environment variables first (for Vercel/EAS deployments)
// Fallback to local config file values (for local development)
// Final fallback to placeholder values (if neither is set)
export const legalInfo: LegalInfo = {
  operator: process.env.EXPO_PUBLIC_LEGAL_OPERATOR || 'YOUR_NAME_HERE', // Local dev fallback - replace with your info
  address: process.env.EXPO_PUBLIC_LEGAL_ADDRESS || 'YOUR_CITY / YOUR_COUNTRY', // Local dev fallback - replace with your info
  email: process.env.EXPO_PUBLIC_LEGAL_EMAIL || 'your-email@example.com', // Local dev fallback - replace with your info
};
