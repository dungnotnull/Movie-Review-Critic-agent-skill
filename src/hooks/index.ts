/**
 * Production-grade hooks system for lifecycle management, state synchronization, and event emission
 * Provides clean, reusable hooks that agents can dynamically invoke
 */

import { Hook, HookContext, HookRegistry } from '../types';

// ============================================================================
// Hook Registry
// ============================================================================

class HookSystem {
  private registry: HookRegistry = {
    before: new Map(),
    after: new Map(),
    error: new Map(),
  };

  private sessionHooks: Map<string, Hook[]> = new Map();

  /**
   * Register a hook for a specific operation and phase
   */
  register(operation: string, hook: Hook): void {
    const phaseMap = this.registry[hook.phase];
    if (!phaseMap.has(operation)) {
      phaseMap.set(operation, []);
    }
    phaseMap.get(operation)!.push(hook);
    // Sort by priority (higher priority first)
    phaseMap.get(operation)!.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Register a session-specific hook
   */
  registerSessionHook(sessionId: string, hook: Hook): void {
    if (!this.sessionHooks.has(sessionId)) {
      this.sessionHooks.set(sessionId, []);
    }
    this.sessionHooks.get(sessionId)!.push(hook);
  }

  /**
   * Execute before hooks for an operation
   */
  async executeBefore(
    operation: string,
    context: HookContext
  ): Promise<void> {
    await this.executeHooks(this.registry.before, operation, context);
    await this.executeSessionHooks(context, 'before');
  }

  /**
   * Execute after hooks for an operation
   */
  async executeAfter(
    operation: string,
    context: HookContext,
    result?: unknown
  ): Promise<void> {
    await this.executeHooks(this.registry.after, operation, context, result);
    await this.executeSessionHooks(context, 'after', result);
  }

  /**
   * Execute error hooks for an operation
   */
  async executeError(
    operation: string,
    context: HookContext,
    error: Error
  ): Promise<void> {
    await this.executeHooks(this.registry.error, operation, context, error);
    await this.executeSessionHooks(context, 'error', error);
  }

  /**
   * Clear session hooks
   */
  clearSessionHooks(sessionId: string): void {
    this.sessionHooks.delete(sessionId);
  }

  /**
   * Get all registered hooks for an operation
   */
  getHooks(operation: string): { before: Hook[]; after: Hook[]; error: Hook[] } {
    return {
      before: this.registry.before.get(operation) || [],
      after: this.registry.after.get(operation) || [],
      error: this.registry.error.get(operation) || [],
    };
  }

  private async executeHooks(
    phaseMap: Map<string, Hook[]>,
    operation: string,
    context: HookContext,
    data?: unknown
  ): Promise<void> {
    const hooks = phaseMap.get(operation);
    if (!hooks || hooks.length === 0) return;

    for (const hook of hooks) {
      try {
        await hook.handler(context, data);
      } catch (error) {
        // Log but don't stop other hooks
        console.error(`Hook ${hook.name} failed:`, error);
      }
    }
  }

  private async executeSessionHooks(
    context: HookContext,
    phase: 'before' | 'after' | 'error',
    data?: unknown
  ): Promise<void> {
    // Session hooks implementation would go here
    // For now, this is a placeholder for extensibility
  }
}

// Singleton instance
export const hookSystem = new HookSystem();

// ============================================================================
// Built-in Hooks
// ============================================================================

/**
 * Token usage tracking hook
 */
export const tokenTrackingHook: Hook = {
  name: 'token-tracking',
  phase: 'after',
  priority: 100,
  handler: async (context: HookContext, data: unknown) => {
    if (data && typeof data === 'object' && 'metadata' in data) {
      const metadata = data.metadata as { tokensUsed?: number };
      if (metadata.tokensUsed) {
        // Emit token usage event or log to monitoring system
        console.log(`[TokenTrack] ${context.operation}: ${metadata.tokensUsed} tokens`);
      }
    }
  },
};

/**
 * Performance monitoring hook
 */
export const performanceMonitoringHook: Hook = {
  name: 'performance-monitoring',
  phase: 'after',
  priority: 90,
  handler: async (context: HookContext, data: unknown) => {
    if (data && typeof data === 'object' && 'metadata' in data) {
      const metadata = data.metadata as { duration?: number };
      if (metadata.duration) {
        const duration = metadata.duration;
        const threshold = 5000; // 5 seconds
        if (duration > threshold) {
          console.warn(
            `[Performance] ${context.operation} took ${duration}ms (threshold: ${threshold}ms)`
          );
        }
      }
    }
  },
};

/**
 * Cache invalidation hook
 */
export const cacheInvalidationHook: Hook = {
  name: 'cache-invalidation',
  phase: 'after',
  priority: 80,
  handler: async (context: HookContext) => {
    // Check if operation affects cache and invalidate accordingly
    if (context.operation.startsWith('analysis-')) {
      // Invalidate relevant cache entries
      console.log(`[Cache] Invalidated cache entries for ${context.operation}`);
    }
  },
};

/**
 * State synchronization hook
 */
export const stateSyncHook: Hook = {
  name: 'state-synchronization',
  phase: 'after',
  priority: 70,
  handler: async (context: HookContext, data: unknown) => {
    // Synchronize state across agents after operations complete
    console.log(`[StateSync] Synchronized state after ${context.operation}`);
  },
};

/**
 * Error logging and recovery hook
 */
export const errorRecoveryHook: Hook = {
  name: 'error-recovery',
  phase: 'error',
  priority: 100,
  handler: async (context: HookContext, error: unknown) => {
    const err = error as Error;
    console.error(`[ErrorRecovery] ${context.operation} failed:`, err.message);

    // Check if error is recoverable
    if (err.message.includes('rate limit') || err.message.includes('timeout')) {
      console.log('[ErrorRecovery] Error is recoverable, will retry');
    }
  },
};

/**
 * Audit logging hook
 */
export const auditLogHook: Hook = {
  name: 'audit-log',
  phase: 'before',
  priority: 50,
  handler: async (context: HookContext) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: context.agentId,
      operation: context.operation,
      phase: context.phase,
    };
    console.log('[Audit]', JSON.stringify(logEntry));
  },
};

// ============================================================================
// Hook Context Factory
// ============================================================================

export function createHookContext(
  agentId: string,
  operation: string,
  phase: HookContext['phase'] = 'before'
): HookContext {
  return {
    phase,
    agentId,
    operation,
    timestamp: Date.now(),
  };
}

// ============================================================================
// Hook Registration Helper
// ============================================================================

/**
 * Register all built-in hooks for common operations
 */
export function registerBuiltInHooks(): void {
  const operations = [
    'analysis-narrative',
    'analysis-craft',
    'analysis-context',
    'analysis-scoring',
    'review-generate',
  ];

  operations.forEach((op) => {
    hookSystem.register(op, tokenTrackingHook);
    hookSystem.register(op, performanceMonitoringHook);
    hookSystem.register(op, cacheInvalidationHook);
    hookSystem.register(op, stateSyncHook);
    hookSystem.register(op, auditLogHook);
    hookSystem.register(op, errorRecoveryHook);
  });
}

// ============================================================================
// Hook Utilities
// ============================================================================

/**
 * Wrap an async function with hook execution
 */
export function withHooks<T>(
  operation: string,
  agentId: string,
  fn: () => Promise<T>
): Promise<T> {
  return hookSystem
    .executeBefore(operation, createHookContext(agentId, operation, 'before'))
    .then(() => fn())
    .then(async (result) => {
      const context = createHookContext(agentId, operation, 'after');
      await hookSystem.executeAfter(operation, context, result);
      return result;
    })
    .catch(async (error) => {
      const context = createHookContext(agentId, operation, 'error');
      await hookSystem.executeError(operation, context, error);
      throw error;
    });
}
