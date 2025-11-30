/**
 * Legal Information Configuration Template
 *
 * IMPORTANT: This is a template file. For your own deployment:
 *
 * Option 1: Local Development
 * 1. Copy this file to `legal.config.ts` (without .template)
 * 2. Replace the placeholder values with your own information
 * 3. The `legal.config.ts` file is in .gitignore and won't be committed
 *
 * Option 2: Deployments (Vercel, EAS Build, etc.)
 * Use Environment Variables instead:
 * - EXPO_PUBLIC_LEGAL_OPERATOR
 * - EXPO_PUBLIC_LEGAL_ADDRESS
 * - EXPO_PUBLIC_LEGAL_EMAIL
 *
 * For public repositories, never commit your personal information!
 * Environment variables are the recommended approach for deployments.
 */

export interface LegalInfo {
  operator: string;
  address: string;
  email: string;
}

export const legalInfo: LegalInfo = {
  operator: 'YOUR_NAME_HERE',
  address: 'YOUR_CITY / YOUR_COUNTRY',
  email: 'your-email@example.com',
};
