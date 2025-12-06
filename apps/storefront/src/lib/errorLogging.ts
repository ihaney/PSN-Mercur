'use client'

/**
 * Error logging utilities
 * TODO: Implement actual error logging service integration
 */

export interface ErrorLog {
  message: string
  stack?: string
  context?: Record<string, any>
  timestamp: string
  userAgent?: string
  url?: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []

  logError(error: Error | string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }

    this.logs.push(errorLog)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog)
    }

    // TODO: Send to error logging service (e.g., Sentry, LogRocket, etc.)
    // Example:
    // if (typeof window !== 'undefined' && (window as any).Sentry) {
    //   (window as any).Sentry.captureException(error, { extra: context })
    // }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const errorLogger = new ErrorLogger()

export function logError(error: Error | string, context?: Record<string, any>) {
  errorLogger.logError(error, context)
}

