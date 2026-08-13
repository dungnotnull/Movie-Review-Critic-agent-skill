#!/usr/bin/env node
/**
 * Review Validator Script
 * Validates review completeness against template requirements
 */

import * as fs from 'fs';

interface ValidationResult {
  valid: boolean;
  missingSections: string[];
  issues: ValidationIssue[];
  score: number;
  totalSections: number;
  completedSections: number;
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  section: string;
  message: string;
}

/**
 * Required sections for a complete review
 */
const REQUIRED_SECTIONS = [
  { name: 'Executive Summary', pattern: /#+\s*Executive\s+Summary/i, required: true },
  { name: 'Spoiler-Free Summary', pattern: /#+\s*Spoiler[-\s]*Free\s+Summary/i, required: true },
  { name: 'Detailed Analysis', pattern: /#+\s*Detailed\s+Analysis/i, required: true },
  { name: 'Narrative Structure', pattern: /#+\s*Narrative\s+(Structure|Analysis)/i, required: true },
  { name: 'Visual Craft', pattern: /#+\s*Visual\s+Craft/i, required: true },
  { name: 'Performance', pattern: /#+\s*Performance/i, required: true },
  { name: 'Audiovisual Integration', pattern: /#+\s*Audiovisual/i, required: true },
  { name: 'Contextual Positioning', pattern: /#+\s*Contextual/i, required: true },
  { name: 'Scoring Rubric', pattern: /#+\s*Scoring\s+Rubric/i, required: true },
  { name: 'Verdict', pattern: /#+\s*Verdict/i, required: true },
  { name: 'Spoiler-Tagged Content', pattern: /#+\s*Spoiler[-\s]*Tagged/i, required: false },
];

/**
 * Framework naming patterns to validate
 */
const FRAMEWORK_PATTERNS = [
  { name: 'Three-Act Structure', pattern: /three[-\s]*act\s+structure/i },
  { name: "Hero's Journey", pattern: /hero['\s]*journey/i },
  { name: 'Mise-en-scène', pattern: /mise[-\s]en[-\s]scène/i },
  { name: 'Bordwell & Thompson', pattern: /bordwell.*thompson/i },
  { name: 'McDonald', pattern: /mcdonald/i },
  { name: 'Chion', pattern: /chion/i },
  { name: 'Eisenstein', pattern: /eisenstein/i },
  { name: 'Altman', pattern: /altman/i },
  { name: 'Sarris', pattern: /sarris/i },
  { name: 'Campbell', pattern: /campbell/i },
  { name: 'Vogler', pattern: /vogler/i },
  { name: 'Genre Theory', pattern: /genre\s+theory/i },
  { name: 'Auteur Theory', pattern: /auteur\s+theory/i },
  { name: 'MCDA', pattern: /mcda|multi[-\s]*criteria/i },
];

/**
 * Score rubric patterns to validate
 */
const SCORE_PATTERNS = [
  { name: 'Narrative Score', pattern: /narrative.*?\d{1,2}/i },
  { name: 'Visual Craft Score', pattern: /visual.*?\d{1,2}/i },
  { name: 'Performance Score', pattern: /performance.*?\d{1,2}/i },
  { name: 'Audiovisual Score', pattern: /audiovisual.*?\d{1,2}/i },
  { name: 'Originality Score', pattern: /originality.*?\d{1,2}/i },
  { name: 'Coherence Score', pattern: /coherence.*?\d{1,2}/i },
  { name: 'Overall Score', pattern: /overall.*?\d{1,2}/i },
];

/**
 * Validate a review markdown file
 */
function validateReview(content: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const missingSections: string[] = [];
  let completedSections = 0;

  // Check required sections
  for (const section of REQUIRED_SECTIONS) {
    const found = section.pattern.test(content);
    if (section.required && !found) {
      missingSections.push(section.name);
      issues.push({
        severity: 'error',
        section: section.name,
        message: `Required section missing`,
      });
    } else if (found) {
      completedSections++;
    }
  }

  // Check framework naming
  const frameworksFound = new Set<string>();
  for (const framework of FRAMEWORK_PATTERNS) {
    if (framework.pattern.test(content)) {
      frameworksFound.add(framework.name);
    }
  }

  if (frameworksFound.size === 0) {
    issues.push({
      severity: 'warning',
      section: 'General',
      message: 'No frameworks explicitly named. Reviews should cite specific frameworks.',
    });
  } else {
    issues.push({
      severity: 'info',
      section: 'General',
      message: `Frameworks cited: ${Array.from(frameworksFound).join(', ')}`,
    });
  }

  // Check scoring rubric presence
  const scoresFound = new Set<string>();
  for (const score of SCORE_PATTERNS) {
    if (score.pattern.test(content)) {
      scoresFound.add(score.name);
    }
  }

  if (scoresFound.size < SCORE_PATTERNS.length) {
    const missingScores = SCORE_PATTERNS.filter((s) => !scoresFound.has(s.name)).map((s) => s.name);
    issues.push({
      severity: 'error',
      section: 'Scoring Rubric',
      message: `Missing score dimensions: ${missingScores.join(', ')}`,
    });
  }

  // Check for specific evidence
  const evidencePatterns = [
    { name: 'Specific examples', pattern: /\bexample\b|\bfor instance\b|\bspecifically\b/i },
    { name: 'Film scenes', pattern: /\bscene\b|\bsequence\b|\bmoment\b/i },
    { name: 'Character names', pattern: /[A-Z][a-z]+ (?:plays|portrays|character)/i },
  ];

  for (const evidence of evidencePatterns) {
    if (!evidence.pattern.test(content)) {
      issues.push({
        severity: 'warning',
        section: 'General',
        message: `May lack ${evidence.name.toLowerCase()}`,
      });
    }
  }

  // Check for confidence statement
  if (!/\bconfidence\b/i.test(content)) {
    issues.push({
      severity: 'warning',
      section: 'Scoring Rubric',
      message: 'Confidence level not stated',
    });
  }

  // Check for spoiler warnings
  if (!/\bspoiler?\b/i.test(content)) {
    issues.push({
      severity: 'info',
      section: 'Spoiler Warnings',
      message: 'No spoiler warnings found (may be intentional for spoiler-free review)',
    });
  }

  // Calculate validation score
  const totalSections = REQUIRED_SECTIONS.filter((s) => s.required).length;
  const baseScore = (completedSections / totalSections) * 100;
  const frameworkBonus = frameworksFound.size > 0 ? 5 : 0;
  const scorePenalty = issues.filter((i) => i.severity === 'error').length * 10;
  const finalScore = Math.max(0, Math.min(100, baseScore + frameworkBonus - scorePenalty));

  return {
    valid: missingSections.length === 0 && issues.filter((i) => i.severity === 'error').length === 0,
    missingSections,
    issues,
    score: Math.round(finalScore),
    totalSections,
    completedSections,
  };
}

/**
 * Print validation results
 */
function printValidationResults(filename: string, result: ValidationResult): void {
  console.log(`\n=== Validation Results: ${filename} ===\n`);

  // Score indicator
  const scoreIndicator = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
  console.log(`${scoreIndicator} Validation Score: ${result.score}/100`);

  // Completion status
  console.log(`\nCompletion: ${result.completedSections}/${result.totalSections} required sections`);

  // Overall validity
  if (result.valid) {
    console.log('\n✅ Review meets all requirements');
  } else {
    console.log('\n❌ Review has issues that need attention');
  }

  // Missing sections
  if (result.missingSections.length > 0) {
    console.log('\n📋 Missing Required Sections:');
    for (const section of result.missingSections) {
      console.log(`  • ${section}`);
    }
  }

  // Issues
  if (result.issues.length > 0) {
    console.log('\n📝 Issues:');

    const grouped = result.issues.reduce(
      (acc, issue) => {
        if (!acc[issue.severity]) acc[issue.severity] = [];
        acc[issue.severity].push(issue);
        return acc;
      },
      {} as Record<string, ValidationIssue[]>
    );

    for (const severity of ['error', 'warning', 'info']) {
      if (grouped[severity]) {
        const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`\n  ${icon} ${severity.toUpperCase()} (${grouped[severity].length}):`);
        for (const issue of grouped[severity]) {
          console.log(`    [${issue.section}] ${issue.message}`);
        }
      }
    }
  }

  // Recommendations
  if (result.score < 100) {
    console.log('\n💡 Recommendations:');
    if (result.missingSections.length > 0) {
      console.log('  • Add missing required sections');
    }
    if (result.issues.some((i) => i.severity === 'error')) {
      console.log('  • Address all error-level issues');
    }
    if (result.issues.some((i) => i.severity === 'warning')) {
      console.log('  • Review and address warnings');
    }
    if (!result.issues.some((i) => i.message.includes('framework'))) {
      console.log('  • Ensure frameworks are explicitly named in analysis');
    }
    if (!result.issues.some((i) => i.message.includes('confidence'))) {
      console.log('  • Add confidence statement to scoring section');
    }
  }

  console.log('');
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: review-validator.ts <file1.md> [file2.md] ...');
    console.error('Options:');
    console.error('  --strict    Fail on any issues (not just errors)');
    console.error('  --json      Output results as JSON');
    process.exit(1);
  }

  const strict = args.includes('--strict');
  const outputJson = args.includes('--json');
  const filesToProcess = args.filter((arg) => arg !== '--strict' && arg !== '--json');

  const results: Record<string, ValidationResult> = {};
  let hasErrors = false;

  for (const filePath of filesToProcess) {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      hasErrors = true;
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const result = validateReview(content);
      results[filePath] = result;

      if (!result.valid || (strict && result.issues.length > 0)) {
        hasErrors = true;
      }

      if (!outputJson) {
        printValidationResults(filePath, result);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      hasErrors = true;
    }
  }

  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
  }

  if (hasErrors) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { validateReview, ValidationResult, ValidationIssue };
