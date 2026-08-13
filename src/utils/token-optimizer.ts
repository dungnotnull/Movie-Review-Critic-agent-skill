/**
 * Token Optimization Utilities
 * Provides efficient context window management and token optimization strategies
 */

import { logger } from './error-handler';

// ============================================================================
// Token Estimation
// ============================================================================

/**
 * Estimate token count from text
 * Approximation: ~4 characters per token for English text
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // Count characters (accounting for Unicode)
  const charCount = Array.from(text).length;

  // Approximate token count (varies by language and content)
  return Math.ceil(charCount / 4);
}

/**
 * Estimate token count for JSON data
 */
export function estimateJsonTokens(data: unknown): number {
  const jsonString = JSON.stringify(data, null, 2);
  return estimateTokens(jsonString);
}

// ============================================================================
// Content Compression
// ============================================================================

/**
 * Compress content by removing redundant whitespace
 */
export function compressWhitespace(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n\n') // Keep single blank lines
    .trim();
}

/**
 * Remove markdown comments from content
 */
export function removeComments(text: string): string {
  return text.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Truncate content to target token count
 */
export function truncateToTokens(text: string, maxTokens: number, preserveStructure = true): string {
  const currentTokens = estimateTokens(text);

  if (currentTokens <= maxTokens) {
    return text;
  }

  if (preserveStructure) {
    // Truncate by section for markdown
    return truncateMarkdownBySection(text, maxTokens);
  }

  // Simple truncation by character count
  const targetChars = maxTokens * 4;
  const truncated = text.substring(0, targetChars);

  if (truncated.length < text.length) {
    return truncated + '\n\n[... content truncated to manage context window ...]';
  }

  return truncated;
}

/**
 * Truncate markdown by removing less important sections
 */
export function truncateMarkdownBySection(text: string, maxTokens: number): string {
  const lines = text.split('\n');
  const sections: Array<{ header: string; priority: number; content: string[] }> = [];
  let currentSection: { header: string; priority: number; content: string[] } = {
    header: 'Header',
    priority: 0,
    content: [],
  };

  // Section priorities (lower = more important)
  const priorityMap: Record<string, number> = {
    'executive summary': 1,
    'verdict': 2,
    'scoring rubric': 3,
    'spoiler-free summary': 4,
    'narrative': 5,
    'visual craft': 6,
    'performance': 7,
    'audiovisual': 8,
    'contextual': 9,
    'detailed analysis': 10,
    'spoiler-tagged': 11,
    'spoiler': 11,
  };

  for (const line of lines) {
    if (line.startsWith('#')) {
      // Save previous section
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }

      // Start new section
      const header = line.replace(/^#+\s*/, '').trim().toLowerCase();
      const priority =
        Object.entries(priorityMap).find(([key]) => header.includes(key))?.[1] ?? 5;

      currentSection = {
        header: line,
        priority,
        content: [],
      };
    } else {
      currentSection.content.push(line);
    }
  }

  // Add last section
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  // Sort by priority and include sections until we hit the token limit
  sections.sort((a, b) => a.priority - b.priority);

  const includedSections: string[] = [];
  let currentTokens = 0;

  for (const section of sections) {
    const sectionContent = [section.header, ...section.content].join('\n');
    const sectionTokens = estimateTokens(sectionContent);

    if (currentTokens + sectionTokens <= maxTokens) {
      includedSections.push(sectionContent);
      currentTokens += sectionTokens;
    } else {
      // Try to include a truncated version
      const remainingTokens = maxTokens - currentTokens;
      if (remainingTokens > 100) {
        // At least 100 tokens worth
        const truncated = truncateToTokens(sectionContent, remainingTokens, false);
        includedSections.push(truncated);
        currentTokens += estimateTokens(truncated);
      }
      break;
    }
  }

  // Sort included sections back by original priority (rough approximation)
  includedSections.sort((a, b) => {
    const aPriority = sections.find((s) => s.header === a.split('\n')[0])?.priority ?? 999;
    const bPriority = sections.find((s) => s.header === b.split('\n')[0])?.priority ?? 999;
    return aPriority - bPriority;
  });

  return includedSections.join('\n\n');
}

// ============================================================================
// Smart Content Selection
// ============================================================================

/**
 * Select most relevant content based on keywords
 */
export function selectRelevantContent(text: string, keywords: string[], maxTokens: number): string {
  const lines = text.split('\n');
  const relevantLines: string[] = [];
  let currentTokens = 0;

  for (const line of lines) {
    const lineLower = line.toLowerCase();
    const isRelevant = keywords.some((keyword) => lineLower.includes(keyword.toLowerCase()));

    if (isRelevant) {
      const lineTokens = estimateTokens(line);

      if (currentTokens + lineTokens <= maxTokens) {
        relevantLines.push(line);
        currentTokens += lineTokens;
      }
    }
  }

  if (relevantLines.length === 0) {
    // No relevant content found, return beginning of text
    return truncateToTokens(text, maxTokens, false);
  }

  return relevantLines.join('\n');
}

// ============================================================================
// Token Budget Management
// ============================================================================

export interface TokenBudget {
  total: number;
  used: number;
  remaining: number;
  allocation: {
    system: number;
    input: number;
    output: number;
  };
}

/**
 * Create a token budget allocation
 */
export function createTokenBudget(totalTokens: number): TokenBudget {
  // Default allocation: 10% system, 70% input, 20% output
  const allocation = {
    system: Math.floor(totalTokens * 0.1),
    input: Math.floor(totalTokens * 0.7),
    output: Math.floor(totalTokens * 0.2),
  };

  return {
    total: totalTokens,
    used: 0,
    remaining: totalTokens,
    allocation,
  };
}

/**
 * Check if content fits within budget
 */
export function fitsInBudget(content: string, budget: TokenBudget, category: keyof TokenBudget['allocation']): boolean {
  const tokens = estimateTokens(content);
  return budget.allocation[category] >= tokens;
}

/**
 * Get remaining budget for a category
 */
export function getRemainingBudget(budget: TokenBudget, category: keyof TokenBudget['allocation']): number {
  return budget.allocation[category];
}

// ============================================================================
// Progressive Disclosure Strategy
// ============================================================================

/**
 * Progressive disclosure plan for loading content
 */
export interface DisclosurePlan {
  priority: number;
  content: string;
  estimatedTokens: number;
  loaded: boolean;
}

/**
 * Create a progressive disclosure plan
 */
export function createDisclosurePlan(contents: Array<{ priority: number; content: string }>): DisclosurePlan[] {
  return contents.map((item) => ({
    priority: item.priority,
    content: item.content,
    estimatedTokens: estimateTokens(item.content),
    loaded: false,
  }));
}

/**
 * Get next content to load based on remaining budget
 */
export function getNextToLoad(plan: DisclosurePlan[], remainingBudget: number): DisclosurePlan | null {
  const unloaded = plan.filter((p) => !p.loaded).sort((a, b) => a.priority - b.priority);

  for (const item of unloaded) {
    if (item.estimatedTokens <= remainingBudget) {
      return item;
    }
  }

  return null;
}

/**
 * Mark content as loaded
 */
export function markAsLoaded(plan: DisclosurePlan[], item: DisclosurePlan): DisclosurePlan[] {
  return plan.map((p) => (p === item ? { ...p, loaded: true } : p));
}

// ============================================================================
// Token Usage Tracking
// ============================================================================

export class TokenTracker {
  private usage: Map<string, number> = new Map();
  private sessionTotal = 0;

  record(operation: string, tokens: number): void {
    const current = this.usage.get(operation) || 0;
    this.usage.set(operation, current + tokens);
    this.sessionTotal += tokens;

    logger.debug('TokenTracker', `Recorded ${tokens} tokens for ${operation} (session total: ${this.sessionTotal})`);
  }

  getOperationUsage(operation: string): number {
    return this.usage.get(operation) || 0;
  }

  getSessionTotal(): number {
    return this.sessionTotal;
  }

  getBreakdown(): Record<string, number> {
    return Object.fromEntries(this.usage);
  }

  reset(): void {
    this.usage.clear();
    this.sessionTotal = 0;
    logger.debug('TokenTracker', 'Token usage tracker reset');
  }

  getReport(): string {
    const lines: string[] = [];
    lines.push('=== Token Usage Report ===');
    lines.push(`Session Total: ${this.sessionTotal.toLocaleString()} tokens`);
    lines.push('');
    lines.push('Breakdown by operation:');

    const sorted = Array.from(this.usage.entries()).sort((a, b) => b[1] - a[1]);

    for (const [operation, tokens] of sorted) {
      const percentage = ((tokens / this.sessionTotal) * 100).toFixed(1);
      lines.push(`  ${operation}: ${tokens.toLocaleString()} tokens (${percentage}%)`);
    }

    return lines.join('\n');
  }
}

// Global token tracker instance
export const tokenTracker = new TokenTracker();

// ============================================================================
// Optimization Strategies
// ============================================================================

/**
 * Apply aggressive optimization (reduces quality but saves tokens)
 */
export function aggressiveOptimize(text: string, maxTokens: number): string {
  let optimized = text;

  // Remove all comments
  optimized = removeComments(optimized);

  // Compress whitespace aggressively
  optimized = compressWhitespace(optimized);

  // Truncate if still too long
  optimized = truncateToTokens(optimized, maxTokens, false);

  logger.debug('TokenOptimizer', `Applied aggressive optimization, reduced from ${estimateTokens(text)} to ${estimateTokens(optimized)} tokens`);

  return optimized;
}

/**
 * Apply balanced optimization (maintains quality while reducing tokens)
 */
export function balancedOptimize(text: string, maxTokens: number): string {
  let optimized = text;

  // Compress whitespace moderately
  optimized = optimized.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');

  // Remove only obvious comments
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

  // Truncate by section if needed
  optimized = truncateToTokens(optimized, maxTokens, true);

  logger.debug('TokenOptimizer', `Applied balanced optimization, reduced from ${estimateTokens(text)} to ${estimateTokens(optimized)} tokens`);

  return optimized;
}

/**
 * Apply conservative optimization (prioritizes quality over token savings)
 */
export function conservativeOptimize(text: string, maxTokens: number): string {
  const currentTokens = estimateTokens(text);

  if (currentTokens <= maxTokens) {
    return text;
  }

  // Only truncate by section to maintain structure
  return truncateMarkdownBySection(text, maxTokens);
}

// ============================================================================
// Content Analysis
// ============================================================================

/**
 * Analyze content for token efficiency
 */
export interface ContentAnalysis {
  totalTokens: number;
  efficiency: number; // 0-1, higher is more efficient
  issues: string[];
  recommendations: string[];
}

export function analyzeContentEfficiency(content: string): ContentAnalysis {
  const totalTokens = estimateTokens(content);
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for redundant whitespace
  const whitespaceCount = (content.match(/\s{3,}/g) || []).length;
  if (whitespaceCount > 10) {
    issues.push(`Excessive whitespace detected (${whitespaceCount} instances)`);
    recommendations.push('Compress whitespace to reduce token count');
  }

  // Check for long repetitive structures
  const lines = content.split('\n');
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

  if (avgLineLength < 20 && lines.length > 50) {
    issues.push('Many very short lines detected');
    recommendations.push('Consider consolidating related content');
  }

  // Check for comment blocks
  const commentBlocks = (content.match(/<!--[\s\S]*?-->/g) || []).length;
  if (commentBlocks > 0) {
    issues.push(`Comment blocks detected (${commentBlocks} blocks)`);
    recommendations.push('Remove comments before production use');
  }

  // Calculate efficiency score
  const efficiency = 1 - (issues.length * 0.1); // Simple heuristic

  return {
    totalTokens,
    efficiency: Math.max(0, Math.min(1, efficiency)),
    issues,
    recommendations,
  };
}

// ============================================================================
// Smart Content Loading
// ============================================================================

/**
 * Smart content loader that respects token budget
 */
export class SmartContentLoader {
  private budget: TokenBudget;
  private disclosurePlan: DisclosurePlan[];

  constructor(totalTokens: number, contents: Array<{ priority: number; content: string }>) {
    this.budget = createTokenBudget(totalTokens);
    this.disclosurePlan = createDisclosurePlan(contents);
  }

  loadAll(): string {
    const loaded: string[] = [];
    let remainingBudget = this.budget.allocation.input;

    let next = getNextToLoad(this.disclosurePlan, remainingBudget);
    while (next) {
      loaded.push(next.content);
      remainingBudget -= next.estimatedTokens;
      this.disclosurePlan = markAsLoaded(this.disclosurePlan, next);
      next = getNextToLoad(this.disclosurePlan, remainingBudget);
    }

    return loaded.join('\n\n');
  }

  loadByPriority(maxPriority: number): string {
    const toLoad = this.disclosurePlan.filter((p) => p.priority <= maxPriority && !p.loaded);
    let remainingBudget = this.budget.allocation.input;
    const loaded: string[] = [];

    for (const item of toLoad) {
      if (item.estimatedTokens <= remainingBudget) {
        loaded.push(item.content);
        remainingBudget -= item.estimatedTokens;
        this.disclosurePlan = markAsLoaded(this.disclosurePlan, item);
      }
    }

    return loaded.join('\n\n');
  }

  getBudget(): TokenBudget {
    return { ...this.budget };
  }

  getLoadingStatus(): { loaded: number; total: number; percentage: number } {
    const loaded = this.disclosurePlan.filter((p) => p.loaded).length;
    const total = this.disclosurePlan.length;
    const percentage = (loaded / total) * 100;

    return { loaded, total, percentage };
  }
}
