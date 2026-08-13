#!/usr/bin/env node
/**
 * Scoring Calculator Script
 * Calculates weighted scores from component ratings using MCDA methodology
 */

interface ScoreInput {
  narrative: number;
  visual_craft: number;
  performance: number;
  audiovisual: number;
  originality: number;
  coherence: number;
}

interface ScoreResult {
  dimensionScores: ScoreInput;
  weightedScores: WeightedScores;
  overallScore: number;
  breakdown: ScoreBreakdown;
}

interface WeightedScores {
  narrative: number;
  visual_craft: number;
  performance: number;
  audiovisual: number;
  originality: number;
  coherence: number;
}

interface ScoreBreakdown {
  narrative: DimensionBreakdown;
  visual_craft: DimensionBreakdown;
  performance: DimensionBreakdown;
  audiovisual: DimensionBreakdown;
  originality: DimensionBreakdown;
  coherence: DimensionBreakdown;
}

interface DimensionBreakdown {
  score: number;
  weight: number;
  contribution: number;
  percentage: string;
}

/**
 * Standard weight configuration
 */
const STANDARD_WEIGHTS: WeightedScores = {
  narrative: 0.25,
  visual_craft: 0.25,
  performance: 0.20,
  audiovisual: 0.15,
  originality: 0.10,
  coherence: 0.05,
};

/**
 * Alternative weight configurations
 */
const WEIGHT_PRESETS: Record<string, WeightedScores> = {
  standard: STANDARD_WEIGHTS,
  experimental: {
    narrative: 0.10,
    visual_craft: 0.35,
    performance: 0.15,
    audiovisual: 0.25,
    originality: 0.15,
    coherence: 0.00,
  },
  documentary: {
    narrative: 0.30,
    visual_craft: 0.20,
    performance: 0.10,
    audiovisual: 0.20,
    originality: 0.15,
    coherence: 0.05,
  },
  drama: {
    narrative: 0.30,
    visual_craft: 0.20,
    performance: 0.25,
    audiovisual: 0.10,
    originality: 0.10,
    coherence: 0.05,
  },
  comedy: {
    narrative: 0.20,
    visual_craft: 0.15,
    performance: 0.30,
    audiovisual: 0.10,
    originality: 0.20,
    coherence: 0.05,
  },
  horror: {
    narrative: 0.20,
    visual_craft: 0.25,
    performance: 0.15,
    audiovisual: 0.25,
    originality: 0.10,
    coherence: 0.05,
  },
  action: {
    narrative: 0.15,
    visual_craft: 0.30,
    performance: 0.20,
    audiovisual: 0.25,
    originality: 0.05,
    coherence: 0.05,
  },
};

/**
 * Calculate weighted score from component scores
 */
function calculateWeightedScore(
  scores: ScoreInput,
  weights: WeightedScores = STANDARD_WEIGHTS
): ScoreResult {
  const breakdown: ScoreBreakdown = {
    narrative: calculateDimensionBreakdown(scores.narrative, weights.narrative),
    visual_craft: calculateDimensionBreakdown(scores.visual_craft, weights.visual_craft),
    performance: calculateDimensionBreakdown(scores.performance, weights.performance),
    audiovisual: calculateDimensionBreakdown(scores.audiovisual, weights.audiovisual),
    originality: calculateDimensionBreakdown(scores.originality, weights.originality),
    coherence: calculateDimensionBreakdown(scores.coherence, weights.coherence),
  };

  const overallScore =
    breakdown.narrative.contribution +
    breakdown.visual_craft.contribution +
    breakdown.performance.contribution +
    breakdown.audiovisual.contribution +
    breakdown.originality.contribution +
    breakdown.coherence.contribution;

  return {
    dimensionScores: scores,
    weightedScores: weights,
    overallScore: Math.round(overallScore * 10) / 10,
    breakdown,
  };
}

/**
 * Calculate dimension breakdown
 */
function calculateDimensionBreakdown(score: number, weight: number): DimensionBreakdown {
  const contribution = score * weight;
  const percentage = (weight * 100).toFixed(0);

  return {
    score,
    weight,
    contribution: Math.round(contribution * 100) / 100,
    percentage: `${percentage}%`,
  };
}

/**
 * Print score results
 */
function printScoreResults(result: ScoreResult, presetName?: string): void {
  if (presetName) {
    console.log(`\n=== Scoring Results (${presetName} preset) ===\n`);
  } else {
    console.log('\n=== Scoring Results ===\n');
  }

  // Print dimension scores
  console.log('Dimension Scores (0-10):');
  console.log(`  Narrative Structure: ${result.dimensionScores.narrative}`);
  console.log(`  Visual Craft: ${result.dimensionScores.visual_craft}`);
  console.log(`  Performance: ${result.dimensionScores.performance}`);
  console.log(`  Audiovisual Integration: ${result.dimensionScores.audiovisual}`);
  console.log(`  Originality: ${result.dimensionScores.originality}`);
  console.log(`  Thematic Coherence: ${result.dimensionScores.coherence}`);

  console.log('\nWeighted Breakdown:');

  const dimensions = [
    { name: 'Narrative Structure', key: 'narrative' as const },
    { name: 'Visual Craft', key: 'visual_craft' as const },
    { name: 'Performance', key: 'performance' as const },
    { name: 'Audiovisual Integration', key: 'audiovisual' as const },
    { name: 'Originality', key: 'originality' as const },
    { name: 'Thematic Coherence', key: 'coherence' as const },
  ];

  for (const dim of dimensions) {
    const bd = result.breakdown[dim.key];
    console.log(`  ${dim.name}:`);
    console.log(`    Score: ${bd.score}`);
    console.log(`    Weight: ${bd.percentage}`);
    console.log(`    Contribution: ${bd.contribution.toFixed(2)}`);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`OVERALL SCORE: ${result.overallScore}/10`);
  console.log('='.repeat(50));

  // Score interpretation
  console.log('\nScore Interpretation:');
  if (result.overallScore >= 9) {
    console.log('  Excellent - Masterpiece level achievement');
  } else if (result.overallScore >= 8) {
    console.log('  Very Good - Strong achievement across dimensions');
  } else if (result.overallScore >= 7) {
    console.log('  Good - Solid achievement with minor weaknesses');
  } else if (result.overallScore >= 6) {
    console.log('  Above Average - Competent but uneven');
  } else if (result.overallScore >= 5) {
    console.log('  Average - Mixed achievement');
  } else if (result.overallScore >= 4) {
    console.log('  Below Average - Significant weaknesses');
  } else if (result.overallScore >= 3) {
    console.log('  Poor - Major problems across dimensions');
  } else if (result.overallScore >= 2) {
    console.log('  Very Poor - Fundamental failures');
  } else {
    console.log('  Terrible - Complete failure');
  }

  console.log('');
}

/**
 * Parse scores from command line or JSON file
 */
function parseScoresInput(input: string): ScoreInput {
  // Try parsing as JSON file
  try {
    if (input.endsWith('.json')) {
      const fs = require('fs');
      const content = fs.readFileSync(input, 'utf-8');
      const data = JSON.parse(content);
      return data as ScoreInput;
    }
  } catch (e) {
    // Not a JSON file, continue
  }

  // Parse as comma-separated values: narrative,visual,performance,audiovisual,originality,coherence
  const values = input.split(',').map((v) => parseFloat(v.trim()));
  if (values.length !== 6 || values.some(isNaN)) {
    throw new Error(
      'Invalid input format. Use: narrative,visual,performance,audiovisual,originality,coherence'
    );
  }

  return {
    narrative: values[0],
    visual_craft: values[1],
    performance: values[2],
    audiovisual: values[3],
    originality: values[4],
    coherence: values[5],
  };
}

/**
 * Validate score input
 */
function validateScores(scores: ScoreInput): void {
  const dimensions = Object.keys(scores) as Array<keyof ScoreInput>;

  for (const dim of dimensions) {
    if (scores[dim] < 0 || scores[dim] > 10) {
      throw new Error(`Invalid score for ${dim}: ${scores[dim]}. Must be between 0 and 10.`);
    }
  }
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: scoring-calculator.ts <scores>');
    console.error('');
    console.error('Scores can be provided as:');
    console.error('  Comma-separated: 8,8,8,7,7,8');
    console.error('  JSON file: scores.json');
    console.error('');
    console.error('Optional:');
    console.error('  --preset=<name>  Use weight preset (standard, experimental, documentary, drama, comedy, horror, action)');
    console.error('');
    console.error('Example: scoring-calculator.ts 8,8,8,7,7,8 --preset=drama');
    process.exit(1);
  }

  try {
    // Parse scores
    const scoresArg = args[0];
    const scores = parseScoresInput(scoresArg);
    validateScores(scores);

    // Determine preset
    let preset = 'standard';
    const presetArg = args.find((arg) => arg.startsWith('--preset='));
    if (presetArg) {
      preset = presetArg.replace('--preset=', '');
      if (!WEIGHT_PRESETS[preset]) {
        console.error(`Invalid preset: ${preset}`);
        console.error(`Available presets: ${Object.keys(WEIGHT_PRESETS).join(', ')}`);
        process.exit(1);
      }
    }

    const weights = WEIGHT_PRESETS[preset];

    // Calculate scores
    const result = calculateWeightedScore(scores, weights);

    // Print results
    printScoreResults(result, preset);

    // Output JSON if requested
    if (args.includes('--json')) {
      console.log('\n=== JSON Output ===');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { calculateWeightedScore, ScoreInput, ScoreResult, WEIGHT_PRESETS };
