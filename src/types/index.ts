/**
 * Core type definitions for the Movie Review Critic skill system
 * Production-grade type safety with comprehensive coverage
 */

// ============================================================================
// Core Agent Types
// ============================================================================

export interface AgentConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: AgentCapability[];
  maxTokens: number;
  temperature: number;
}

export type AgentCapability =
  | 'narrative-analysis'
  | 'craft-analysis'
  | 'contextual-analysis'
  | 'scoring'
  | 'report-generation'
  | 'spoiler-detection';

export interface AgentResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  metadata: ResponseMetadata;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
  recoverable: boolean;
  fallbackAvailable: boolean;
}

export interface ResponseMetadata {
  agentId: string;
  timestamp: string;
  duration: number;
  tokensUsed: number;
  cached: boolean;
}

// ============================================================================
// Domain Types
// ============================================================================

export interface FilmReviewRequest {
  film: FilmInfo;
  analysisDepth: 'basic' | 'standard' | 'comprehensive';
  spoilerLevel: 'none' | 'minimal' | 'full';
  outputFormat: OutputFormat;
  customFocus?: string[];
}

export interface FilmInfo {
  title: string;
  year: number;
  director: string;
  genre: string[];
  runtime?: number;
  primaryLanguage?: string;
  countryOfOrigin?: string;
}

export type OutputFormat = 'structured-report' | 'checklist' | 'scored-recommendation' | 'memo';

export interface FilmReview {
  summary: SpoilerFreeSummary;
  analysis: DetailedAnalysis;
  scores: ScoringRubric;
  verdict: ReviewVerdict;
  metadata: ReviewMetadata;
}

export interface SpoilerFreeSummary {
  overview: string;
  genrePosition: string;
  keyThemes: string[];
  targetAudience: string;
  spoilerWarning?: string;
}

export interface DetailedAnalysis {
  narrative: NarrativeAnalysis;
  craft: CraftAnalysis;
  context: ContextualAnalysis;
  spoilers: SpoilerTaggedContent;
}

export interface NarrativeAnalysis {
  structure: NarrativeStructure;
  journey: HeroJourneyAnalysis;
  pacing: PacingAnalysis;
  themes: ThematicDepthAnalysis;
}

export interface NarrativeStructure {
  framework: 'three-act' | 'hero-journey' | 'non-linear' | 'other';
  acts?: ThreeActStructure;
  heroJourney?: HeroJourneyStages;
  effectiveness: number; // 0-10
  notes: string;
}

export interface ThreeActStructure {
  setup: ActAnalysis;
  confrontation: ActAnalysis;
  resolution: ActAnalysis;
}

export interface ActAnalysis {
  percentage: number; // Approximately what % of runtime
  keyEvents: string[];
  effectiveness: number; // 0-10
}

export interface HeroJourneyStages {
  ordinaryWorld?: string;
  callToAdventure?: string;
  refusal?: string;
  mentor?: string;
  crossingThreshold?: string;
  tests?: string[];
  ordeal?: string;
  reward?: string;
  return?: string;
  resurrection?: string;
  elixir?: string;
}

export interface HeroJourneyAnalysis {
  followsMonomyth: boolean;
  stagePresent: (keyof HeroJourneyStages)[];
  deviations: string[];
  effectiveness: number; // 0-10
}

export interface PacingAnalysis {
  overall: 'deliberate' | 'balanced' | 'brisk' | 'uneven';
  acts: { actName: string; pace: string; effectiveness: number }[];
  issues: string[];
}

export interface ThematicDepthAnalysis {
  primaryThemes: { name: string; development: number; evidence: string[] }[];
  thesisStatement?: string;
  coherence: number; // 0-10
  notes: string;
}

export interface CraftAnalysis {
  cinematography: CinematographyAnalysis;
  miseEnScene: MiseEnSceneAnalysis;
  performance: PerformanceAnalysis;
  soundAndScore: SoundScoreAnalysis;
  editing: EditingAnalysis;
}

export interface CinematographyAnalysis {
  visualStyle: string;
  lightingApproach: string;
  cameraWork: string;
  notableShots: { description: string; purpose: string }[];
  effectiveness: number; // 0-10
  technicalNotes?: string;
}

export interface MiseEnSceneAnalysis {
  composition: string;
  productionDesign: string;
  costumeAndMakeup: string;
  settingSignificance: string;
  effectiveness: number; // 0-10
  visualStorytelling: string;
}

export interface PerformanceAnalysis {
  cast: {
    actor: string;
    role: string;
    characterDevelopment: number; // 0-10
    technique: number; // 0-10
    impact: number; // 0-10
    notes: string;
  }[];
  ensemble: {
    chemistry: number; // 0-10
    notes: string;
  };
  direction: {
    performanceQuality: number; // 0-10
    castingChoices: string;
  };
}

export interface SoundScoreAnalysis {
  score: {
    composer?: string;
    style: string;
    effectiveness: number; // 0-10
    keyMoments: { moment: string; musicalChoice: string; effect: string }[];
  };
  soundDesign: {
    approach: string;
    effectiveness: number; // 0-10
    notableElements: string[];
  };
  audioIntegration: number; // 0-10
}

export interface EditingAnalysis {
  rhythm: string;
  transitions: string;
  montageEffectiveness: number; // 0-10
  pacingContribution: number; // 0-10
  notableTechniques: string[];
}

export interface ContextualAnalysis {
  genre: GenreAnalysis;
  auteur: AuteurAnalysis;
  historical: HistoricalContext;
  comparative: ComparativeAnalysis;
}

export interface GenreAnalysis {
  genre: string[];
  conventions: { convention: string; present: boolean; effectiveness: number }[];
  innovations: string[];
  adherenceVsSubversion: string;
}

export interface AuteurAnalysis {
  director: string;
  signatureElements: string[];
  oeuvrePosition: string;
  evolution: string;
  auteurStatus: 'strong' | 'moderate' | 'weak';
}

export interface HistoricalContext {
  releaseContext: string;
  culturalSignificance: string;
  technicalContext?: string;
}

export interface ComparativeAnalysis {
  comparableWorks: { title: string; similarities: string; differences: string }[];
  influences: string[];
  influenced: string[];
}

export interface SpoilerTaggedContent {
  plotReveals: string[];
  characterArcs: string[];
  endings: string[];
  warnings: string[];
}

export interface ScoringRubric {
  narrative: number; // 0-10
  craft: number; // 0-10
  performance: number; // 0-10
  audiovisual: number; // 0-10
  originality: number; // 0-10
  coherence: number; // 0-10
  overall: number; // 0-10
  weighted: number; // 0-10, calculated from above
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  narrative: { weight: number; score: number; contribution: number };
  craft: { weight: number; score: number; contribution: number };
  performance: { weight: number; score: number; contribution: number };
  audiovisual: { weight: number; score: number; contribution: number };
  originality: { weight: number; score: number; contribution: number };
  coherence: { weight: number; score: number; contribution: number };
}

export interface ReviewVerdict {
  recommendation: 'essential' | 'recommended' | 'conditional' | 'skip';
  audience: string[];
  strengths: string[];
  weaknesses: string[];
  finalWord: string;
}

export interface ReviewMetadata {
  reviewer: string;
  dateReviewed: string;
  reviewVersion: string;
  methodologies: string[];
  disclaimer: string;
  confidence: number; // 0-1
}

// ============================================================================
// Hook Types
// ============================================================================

export interface HookContext {
  phase: 'before' | 'after' | 'error';
  agentId: string;
  operation: string;
  timestamp: number;
}

export interface Hook<T = unknown> {
  name: string;
  phase: 'before' | 'after' | 'error';
  handler: (context: HookContext, data?: T) => Promise<void | T>;
  priority: number;
}

export interface HookRegistry {
  before: Map<string, Hook[]>;
  after: Map<string, Hook[]>;
  error: Map<string, Hook[]>;
}

// ============================================================================
// Tool Types
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  handler: ToolHandler;
  requiresAgent: boolean;
  cacheable: boolean;
}

export type ToolHandler = (input: unknown, context: ToolContext) => Promise<ToolResult>;

export interface ToolContext {
  agentId: string;
  sessionId: string;
  metadata: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  cached: boolean;
  executionTime: number;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: (string | number)[];
  description?: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface SkillConfig {
  version: string;
  agents: AgentConfig[];
  tools: ToolDefinition[];
  hooks: HookRegistry;
  settings: SkillSettings;
}

export interface SkillSettings {
  maxTokens: number;
  temperature: number;
  cacheEnabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  tokenOptimization: TokenOptimizationConfig;
  errorHandling: ErrorHandlingConfig;
}

export interface TokenOptimizationConfig {
  enabled: boolean;
  aggressive: boolean;
  preserveThreshold: number;
  compressionEnabled: boolean;
}

export interface ErrorHandlingConfig {
  fallbackEnabled: boolean;
  retryAttempts: number;
  retryDelay: number;
  gracefulDegradation: boolean;
}

// ============================================================================
// Logging Types
// ============================================================================

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  timestamp: string;
  agent: string;
  operation: string;
  message: string;
  data?: unknown;
  error?: Error;
}

export interface LogMetadata {
  sessionId: string;
  userId?: string;
  reviewId?: string;
}

// ============================================================================
// Analysis Result Types (for tool outputs)
// ============================================================================

export interface NarrativeAnalysisResult {
  structure: NarrativeStructure;
  analysis: NarrativeAnalysis;
  confidence: number;
  methodology: string;
}

export interface CraftAnalysisResult {
  cinematography: CinematographyAnalysis;
  miseEnScene: MiseEnSceneAnalysis;
  performance: PerformanceAnalysis;
  soundAndScore: SoundScoreAnalysis;
  editing: EditingAnalysis;
  confidence: number;
  methodology: string;
}

export interface ContextAnalysisResult {
  genre: GenreAnalysis;
  auteur: AuteurAnalysis;
  historical: HistoricalContext;
  comparative: ComparativeAnalysis;
  confidence: number;
  methodology: string;
}

export interface ScoringResult {
  scores: ScoringRubric;
  methodology: string;
  confidence: number;
}
