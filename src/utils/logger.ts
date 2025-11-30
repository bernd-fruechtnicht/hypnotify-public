/**
 * Production-ready logging utility
 *
 * - In Development (__DEV__ = true): All logs are shown
 * - In Production (__DEV__ = false): Only warnings and errors are shown
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // @ts-ignore - __DEV__ is a global variable in React Native
    this.isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  }

  /**
   * Debug logs - only shown in development
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Info logs - only shown in development
   */
  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Warning logs - shown in both development and production
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Error logs - always shown (development and production)
   */
  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Log with custom level (for advanced use cases)
   */
  log(level: LogLevel, message: string, ...args: any[]): void {
    switch (level) {
      case 'debug':
        this.debug(message, ...args);
        break;
      case 'info':
        this.info(message, ...args);
        break;
      case 'warn':
        this.warn(message, ...args);
        break;
      case 'error':
        this.error(message, ...args);
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for testing
export { Logger };
