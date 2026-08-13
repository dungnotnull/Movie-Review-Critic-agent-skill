/**
 * Production-grade error handling with graceful fallbacks
 * Provides structured logging, recovery strategies, and graceful degradation
 */

import { LogEntry } from '../types';

// ============================================================================
// Error Classification
// ============================================================================

export enum ErrorCategory {
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  PARSE = 'parse',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  INTERNAL = 'internal',
  EXTERNAL_SERVICE = 'external_service',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ClassifiedError {
  originalError: Error;
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoverable: boolean;
  retryable: boolean;
  fallbackAvailable: boolean;
  userMessage: string;
  technicalDetails: string;
}

// ============================================================================
// Error Classification Logic
// ============================================================================

/**
 * Classify an error for appropriate handling
 */
export function classifyError(error: Error, context?: string): ClassifiedError {
  const message = error.message.toLowerCase();
  const stack = error.stack || '';

  // Network errors
  if (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  ) {
    return {
      originalError: error,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      retryable: true,
      fallbackAvailable: true,
      userMessage: 'Network connection issue. Please check your connection and try again.',
      technicalDetails: `Network error: ${error.message}`,
    };
  }

  // Rate limit errors
  if (message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
    return {
      originalError: error,
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      retryable: true,
      fallbackAvailable: true,
      userMessage: 'Request limit reached. Please wait a moment and try again.',
      technicalDetails: `Rate limit exceeded: ${error.message}`,
    };
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return {
      originalError: error,
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      retryable: true,
      fallbackAvailable: true,
      userMessage: 'Request timed out. Please try again.',
      technicalDetails: `Request timeout: ${error.message}`,
    };
  }

  // Parse errors
  if (message.includes('parse') || message.includes('json') || message.includes('syntax')) {
    return {
      originalError: error,
      category: ErrorCategory.PARSE,
      severity: ErrorSeverity.HIGH,
      recoverable: false,
      retryable: false,
      fallbackAvailable: true,
      userMessage: 'Unable to process the data. The format may be incorrect.',
      technicalDetails: `Parse error: ${error.message}`,
    };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      originalError: error,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      recoverable: false,
      retryable: false,
      fallbackAvailable: true,
      userMessage: 'Some information is missing or incorrect. Please check your input.',
      technicalDetails: `Validation error: ${error.message}`,
    };
  }

  // Not found errors
  if (message.includes('not found') || message.includes('404') || message.includes('enoent')) {
    return {
      originalError: error,
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.LOW,
      recoverable: false,
      retryable: false,
      fallbackAvailable: true,
      userMessage: 'The requested resource was not found.',
      technicalDetails: `Resource not found: ${error.message}`,
    };
  }

  // Permission errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('403') || message.includes('401')) {
    return {
      originalError: error,
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.HIGH,
      recoverable: false,
      retryable: false,
      fallbackAvailable: false,
      userMessage: 'You do not have permission to access this resource.',
      technicalDetails: `Permission denied: ${error.message}`,
    };
  }

  // External service errors
  if (stack.includes('node_modules') || message.includes('api') || message.includes('service')) {
    return {
      originalError: error,
      category: ErrorCategory.EXTERNAL_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      retryable: true,
      fallbackAvailable: true,
      userMessage: 'External service issue. Please try again later.',
      technicalDetails: `External service error: ${error.message}`,
    };
  }

  // Default: internal error
  return {
    originalError: error,
    category: ErrorCategory.INTERNAL,
    severity: ErrorSeverity.HIGH,
    recoverable: false,
    retryable: false,
    fallbackAvailable: true,
    userMessage: 'An internal error occurred. Please try again.',
    technicalDetails: `Internal error: ${error.message}`,
  };
}

// ============================================================================
// Retry Logic
// ============================================================================

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  context?: string
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const classified = classifyError(lastError, context);

      if (!classified.retryable || attempt === options.maxAttempts) {
        throw lastError;
      }

      const delay = calculateDelay(attempt, options);
      console.warn(
        `Retry attempt ${attempt}/${options.maxAttempts} after ${delay}ms for ${context || 'operation'}: ${classified.technicalDetails}`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Calculate retry delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const exponentialDelay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelay);

  if (options.jitter) {
    return cappedDelay * (0.5 + Math.random());
  }

  return cappedDelay;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Fallback Strategies
// ============================================================================

export interface FallbackResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  source: 'primary' | 'fallback' | 'degraded';
}

/**
 * Execute with fallback strategy
 */
export async function withFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  context?: string
): Promise<FallbackResult<T>> {
  try {
    const data = await primaryFn();
    return {
      success: true,
      data,
      source: 'primary',
    };
  } catch (error) {
    const classified = classifyError(error as Error, context);

    if (!classified.fallbackAvailable) {
      throw error;
    }

    console.warn(`Primary function failed for ${context || 'operation'}, trying fallback: ${classified.technicalDetails}`);

    try {
      const data = await fallbackFn();
      return {
        success: true,
        data,
        source: 'fallback',
      };
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
}

/**
 * Execute with graceful degradation
 */
export async function withGracefulDegradation<T>(
  fn: () => Promise<T>,
  degradedFallback: Partial<T>,
  context?: string
): Promise<FallbackResult<T>> {
  try {
    const data = await fn();
    return {
      success: true,
      data,
      source: 'primary',
    };
  } catch (error) {
    const classified = classifyError(error as Error, context);

    console.warn(`Function failed for ${context || 'operation'}, using degraded mode: ${classified.technicalDetails}`);

    return {
      success: true,
      data: degradedFallback as T,
      source: 'degraded',
    };
  }
}

// ============================================================================
// Logging System
// ============================================================================

export class Logger {
  private logs: LogEntry[] = [];
  private session: string;

  constructor(sessionId?: string) {
    this.session = sessionId || this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(level: LogEntry['level'], operation: string, message: string, data?: unknown, error?: Error): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      agent: 'movie-review-critic',
      operation,
      message,
      data,
      error,
    };

    this.logs.push(entry);

    // Console output with colors
    const colors = {
      error: '\x1b[31m', // red
      warn: '\x1b[33m', // yellow
      info: '\x1b[36m', // cyan
      debug: '\x1b[90m', // gray
    };
    const reset = '\x1b[0m';

    const color = colors[level] || '';
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${reset}`;

    console.log(`${prefix} ${operation}: ${message}`);

    if (error) {
      console.error(`${color}Error: ${error.message}${reset}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  debug(operation: string, message: string, data?: unknown): void {
    this.log('debug', operation, message, data);
  }

  info(operation: string, message: string, data?: unknown): void {
    this.log('info', operation, message, data);
  }

  warn(operation: string, message: string, data?: unknown): void {
    this.log('warn', operation, message, data);
  }

  error(operation: string, message: string, error?: Error, data?: unknown): void {
    this.log('error', operation, message, data, error);
  }

  getSessionId(): string {
    return this.session;
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance
export const logger = new Logger();

// ============================================================================
// Error Boundary Wrapper
// ============================================================================

/**
 * Wrap an async function with error boundary handling
 */
export function withErrorBoundary<T>(
  fn: () => Promise<T>,
  context: string,
  options?: {
    retry?: RetryOptions;
    fallback?: () => Promise<T>;
    degradedFallback?: Partial<T>;
  }
): Promise<T> {
  const operation = async (): Promise<T> => {
    if (options?.retry) {
      return withRetry(fn, options.retry, context);
    }
    return fn();
  };

  if (options?.fallback) {
    return withFallback(operation, options.fallback, context).then((result) => {
      if (!result.success || !result.data) {
        throw new Error(`Operation failed: ${context}`);
      }
      return result.data;
    });
  }

  if (options?.degradedFallback) {
    return withGracefulDegradation(operation, options.degradedFallback, context).then((result) => {
      if (!result.success || !result.data) {
        throw new Error(`Operation failed: ${context}`);
      }
      return result.data;
    });
  }

  return operation();
}

// ============================================================================
// Circuit Breaker Pattern
// ============================================================================

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.recoveryTimeout) {
        this.state = 'half-open';
        console.info('CircuitBreaker', 'Entering half-open state');
      } else {
        throw new Error('Circuit breaker is OPEN - rejecting requests');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      console.info('CircuitBreaker', 'Circuit breaker closed - service recovered');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open';
      console.error('CircuitBreaker', `Circuit breaker OPEN after ${this.failures} failures`);
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    console.info('CircuitBreaker', 'Circuit breaker manually reset');
  }
}
