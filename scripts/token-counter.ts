#!/usr/bin/env node
/**
 * Token Counter Script
 * Counts tokens in analysis output for optimization and context window management
 */

import * as fs from 'fs';
import * as path from 'path';

interface TokenCountResult {
  file: string;
  characters: number;
  estimatedTokens: number;
  breakdown: SectionBreakdown[];
}

interface SectionBreakdown {
  section: string;
  characters: number;
  estimatedTokens: number;
}

/**
 * Estimate token count from character count
 * Rough approximation: 1 token ≈ 4 characters for English text
 */
function estimateTokens(characters: number): number {
  return Math.ceil(characters / 4);
}

/**
 * Extract sections from markdown content
 */
function extractSections(content: string): Array<{ name: string; content: string }> {
  const lines = content.split('\n');
  const sections: Array<{ name: string; content: string }> = [];
  let currentSection = 'Header';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith('#')) {
      // Save previous section
      if (currentContent.length > 0) {
        sections.push({
          name: currentSection,
          content: currentContent.join('\n'),
        });
      }

      // Start new section
      currentSection = line.replace(/^#+\s/, '').trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections.push({
      name: currentSection,
      content: currentContent.join('\n'),
    });
  }

  return sections;
}

/**
 * Count tokens in a markdown file
 */
function countTokensInFile(filePath: string): TokenCountResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sections = extractSections(content);

  const breakdown: SectionBreakdown[] = sections.map((section) => ({
    section: section.name,
    characters: section.content.length,
    estimatedTokens: estimateTokens(section.content.length),
  }));

  const totalCharacters = content.length;
  const totalTokens = estimateTokens(totalCharacters);

  return {
    file: path.basename(filePath),
    characters: totalCharacters,
    estimatedTokens: totalTokens,
    breakdown,
  };
}

/**
 * Print token count results
 */
function printResults(results: TokenCountResult[]): void {
  console.log('\n=== Token Count Results ===\n');

  let totalTokens = 0;
  let totalCharacters = 0;

  for (const result of results) {
    console.log(`File: ${result.file}`);
    console.log(`  Characters: ${result.characters.toLocaleString()}`);
    console.log(`  Estimated Tokens: ${result.estimatedTokens.toLocaleString()}`);
    console.log('  Section Breakdown:');

    for (const section of result.breakdown) {
      const percentage = ((section.estimatedTokens / result.estimatedTokens) * 100).toFixed(1);
      console.log(
        `    ${section.section}: ${section.estimatedTokens.toLocaleString()} tokens (${percentage}%)`
      );
    }

    console.log('');
    totalTokens += result.estimatedTokens;
    totalCharacters += result.characters;
  }

  if (results.length > 1) {
    console.log('--- TOTAL ---');
    console.log(`  Total Characters: ${totalCharacters.toLocaleString()}`);
    console.log(`  Total Tokens: ${totalTokens.toLocaleString()}`);
    console.log(`  Average Tokens per File: ${(totalTokens / results.length).toLocaleString()}`);
  }

  // Context window assessment
  console.log('\n--- Context Window Assessment ---');
  const maxTokens = 200000; // Claude's max context
  const remaining = maxTokens - totalTokens;
  const percentageUsed = ((totalTokens / maxTokens) * 100).toFixed(2);

  console.log(`  Context Window: ${maxTokens.toLocaleString()} tokens`);
  console.log(`  Used: ${totalTokens.toLocaleString()} tokens (${percentageUsed}%)`);
  console.log(`  Remaining: ${remaining.toLocaleString()} tokens`);

  if (totalTokens > maxTokens) {
    console.log('  ⚠️  WARNING: Content exceeds context window!');
  } else if (parseFloat(percentageUsed) > 80) {
    console.log('  ⚠️  WARNING: Content uses more than 80% of context window');
  } else if (parseFloat(percentageUsed) > 50) {
    console.log('  ⚠️  Note: Content uses more than 50% of context window');
  } else {
    console.log('  ✅ Content fits comfortably in context window');
  }
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: token-counter.ts <file1.md> [file2.md] ...');
    process.exit(1);
  }

  const results: TokenCountResult[] = [];

  for (const filePath of args) {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      continue;
    }

    try {
      const result = countTokensInFile(filePath);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  if (results.length > 0) {
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

export { countTokensInFile, estimateTokens, extractSections };
