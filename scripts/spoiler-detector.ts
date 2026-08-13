#!/usr/bin/env node
/**
 * Spoiler Detector Script
 * Automatically detects and tags spoiler content for appropriate warnings
 */

import * as fs from 'fs';

interface SpoilerDetectionResult {
  hasSpoilers: boolean;
  spoilerCategories: string[];
  warnings: string[];
  detections: SpoilerMatch[];
}

interface SpoilerMatch {
  category: string;
  match: string;
  context: string;
  line: number;
}

/**
 * Spoiler keyword patterns by category
 */
const SPOILER_PATTERNS: Record<string, RegExp[]> = {
  'ending-death': [
    /dies at the end/gi,
    /death at the end/gi,
    /character dies in the final/gi,
    /ends with.*death/gi,
    /final scene.*death/gi,
  ],
  'ending-reveal': [
    /reveals at the end/gi,
    /ending reveals/gi,
    /final reveal/gi,
    /conclusion.*reveal/gi,
    /twist ending/gi,
    /ending twist/gi,
  ],
  'plot-reveal': [
    /it turns out that/gi,
    /reveals that/gi,
    /we discover that/gi,
    /it is revealed/gi,
    /the truth is/gi,
    /actually.*the killer/gi,
    /was.*all along/gi,
  ],
  'character-death': [
    /dies when/gi,
    /character dies/gi,
    /death of.*character/gi,
    /kills.*character/gi,
    /murdered by/gi,
    /sacrifices.*life/gi,
  ],
  'identity-reveal': [
    /is actually/gi,
    /revealed to be/gi,
    /turns out to be/gi,
    /was.*the whole time/gi,
    /secret identity/gi,
    /true identity/gi,
  ],
  'plot-twist': [
    /twist is/gi,
    /major twist/gi,
    /plot twist/gi,
    /unexpected turn/gi,
    /shocking revelation/gi,
  ],
  'fate-reveal': [
    /fate of.*character/gi,
    /what happens to/gi,
    /ultimate fate/gi,
    /ends up.*by the end/gi,
  ],
};

/**
 * Detect spoilers in text
 */
function detectSpoilers(text: string, filename?: string): SpoilerDetectionResult {
  const detections: SpoilerMatch[] = [];
  const spoilerCategories = new Set<string>();

  const lines = text.split('\n');
  const maxContextLength = 50;

  lines.forEach((line, lineIndex) => {
    for (const [category, patterns] of Object.entries(SPOILER_PATTERNS)) {
      for (const pattern of patterns) {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            const matchIndex = line.indexOf(match);
            const start = Math.max(0, matchIndex - maxContextLength / 2);
            const end = Math.min(line.length, matchIndex + match.length + maxContextLength / 2);
            const context = line.substring(start, end);

            detections.push({
              category,
              match,
              context: context.trim(),
              line: lineIndex + 1,
            });

            spoilerCategories.add(category);
          }
        }
      }
    }
  });

  const hasSpoilers = detections.length > 0;
  const warnings = hasSpoilers
    ? [`⚠️  This ${filename ? 'file' : 'text'} contains ${detections.length} potential spoiler(s)`]
    : [];

  if (hasSpoilers) {
    const categoryWarnings = Array.from(spoilerCategories).map(
      (cat) => `  • ${cat.replace(/-/g, ' ')}`
    );
    warnings.push('Spoiler categories detected:', ...categoryWarnings);
  }

  return {
    hasSpoilers,
    spoilerCategories: Array.from(spoilerCategories),
    warnings,
    detections,
  };
}

/**
 * Generate spoiler-safe version of text
 */
function generateSpoilerSafeVersion(text: string, result: SpoilerDetectionResult): string {
  let spoilerSafe = text;

  // Add spoiler warning at the beginning
  if (result.hasSpoilers) {
    spoilerSafe =
      `> ⚠️ **SPOILER WARNING**\n> This content contains spoilers for the following categories: ${result.spoilerCategories.join(', ')}\n\n` +
      spoilerSafe;
  }

  // Could implement redaction here if needed
  // For now, just adds warnings

  return spoilerSafe;
}

/**
 * Print detection results
 */
function printResults(results: Map<string, SpoilerDetectionResult>): void {
  console.log('\n=== Spoiler Detection Results ===\n');

  let totalSpoilers = 0;
  let filesWithSpoilers = 0;

  for (const [filename, result] of results.entries()) {
    console.log(`File: ${filename}`);

    if (result.hasSpoilers) {
      filesWithSpoilers++;
      totalSpoilers += result.detections.length;

      console.log(`  ⚠️  SPOILERS DETECTED: ${result.detections.length} occurrence(s)`);
      console.log(`  Categories: ${result.spoilerCategories.join(', ')}`);
      console.log('  Detections:');

      for (const detection of result.detections) {
        console.log(`    Line ${detection.line} [${detection.category}]:`);
        console.log(`      Match: "${detection.match}"`);
        console.log(`      Context: "...${detection.context}..."`);
      }
    } else {
      console.log('  ✅ No spoilers detected');
    }

    console.log('');
  }

  // Summary
  console.log('--- Summary ---');
  console.log(`  Files analyzed: ${results.size}`);
  console.log(`  Files with spoilers: ${filesWithSpoilers}`);
  console.log(`  Total spoiler detections: ${totalSpoilers}`);

  if (totalSpoilers > 0) {
    console.log('\n⚠️  RECOMMENDATION: Review spoiler content and add appropriate warnings');
  }
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath: string): SpoilerDetectionResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  return detectSpoilers(content, filePath);
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: spoiler-detector.ts <file1.md> [file2.md] ...');
    console.error('Options:');
    console.error('  --safe    Generate spoiler-safe versions with warnings');
    process.exit(1);
  }

  const generateSafe = args.includes('--safe');
  const filesToProcess = args.filter((arg) => arg !== '--safe');

  const results = new Map<string, SpoilerDetectionResult>();

  for (const filePath of filesToProcess) {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      continue;
    }

    try {
      const result = analyzeFile(filePath);
      results.set(filePath, result);

      if (generateSafe && result.hasSpoilers) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const safeContent = generateSpoilerSafeVersion(content, result);

        const safePath = filePath.replace(/\.md$/, '.safe.md');
        fs.writeFileSync(safePath, safeContent);
        console.log(`Generated spoiler-safe version: ${safePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  if (results.size > 0) {
    printResults(results);
  } else {
    console.error('No files were successfully processed.');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { detectSpoilers, generateSpoilerSafeVersion, analyzeFile };
