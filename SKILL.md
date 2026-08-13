---
name: movie-review-critic
description: A production-grade skill for writing structured, defensible film reviews using established film-criticism frameworks (three-act structure, Hero's Journey, mise-en-scène analysis, auteur theory, genre theory). Analyzes narrative structure, direction, cinematography, performance, sound/score, and thematic depth. Produces spoiler-free summaries with detailed spoiler-tagged analysis and transparent scoring rubrics. Use this skill whenever the user asks for film analysis, movie reviews, cinematic critique, screenwriting evaluation, or wants to understand films through academic film theory frameworks—even if they don't use these exact terms. This includes requests like "analyze this movie's storytelling," "evaluate the cinematography," "review the film's structure," "assess the performances," or any request involving film criticism, movie analysis, or cinematic evaluation.
version: 1.0.0
compatibility:
  tools:
    - anthropic/claude-sonnet-4-6
    - anthropic/claude-opus-4-7
  required:
    - Node.js 18+ (for script execution)
    - Modern shell with mkdir, find, grep
  optional:
    - Image viewing capability (for film frame analysis)
---

# Movie Review Critic — Production-Grade Film Analysis Skill

## Overview

This skill provides **structured, defensible film reviews** grounded in established film-criticism and screenwriting frameworks. It evaluates cinematic works across multiple dimensions using academically-recognized methodologies, producing consistent, auditable analyses suitable for professional and academic contexts.

**Key differentiator:** Every evaluation claim references a specific framework (e.g., "Using Bordwell & Thompson's mise-en-scène analysis...") rather than unsupported opinion. Outputs follow consistent templates for cross-review comparison and cumulative learning.

## When This Skill Triggers

This skill activates when the user's request involves:

- Film analysis, movie reviews, or cinematic critique
- Story structure evaluation (narrative, pacing, plot)
- Visual craft assessment (cinematography, lighting, composition)
- Performance evaluation (acting, character development)
- Technical craft review (editing, sound design, score)
- Thematic or contextual analysis (genre conventions, director's oeuvre)
- Spoiler-free summaries with optional detailed breakdowns
- Scoring or rating systems for films

**Infer intent from context:** Even casual phrasing like "what did you think of this movie" or "break down this film" should trigger this skill.

## Core Methodologies (Explicitly Named in Output)

This skill applies these frameworks by name in its analysis:

1. **Three-Act Structure (Syd Field, 1979)** — Narrative pacing analysis
2. **The Hero's Journey (Campbell/Vogler)** — Monomyth pattern recognition
3. **Mise-en-scène Analysis (Bordwell & Thompson)** — Visual composition evaluation
4. **Auteur Theory (Sarris, 1962)** — Director's signature elements and oeuvre positioning
5. **Genre Theory (Altman, Stam)** — Convention adherence and innovation analysis
6. **Performance Craft Framework (McDonald)** — Character development and technique assessment

All frameworks are operationalized as concrete checklists and templates in `/references` files.

## Output Structure

ALWAYS use this exact output format for consistency:

```markdown
# Film Review: [TITLE] ([YEAR])

## Executive Summary
[2-3 sentence verdict with recommendation and audience]

## Spoiler-Free Summary
**Genre Position:** [how film relates to its genre(s)]
**Key Themes:** [bulleted list]
**Target Audience:** [who will appreciate this]
**Spoiler Note:** [if analysis contains spoilers, warn here]

---

## Detailed Analysis

### Narrative Structure
**Framework Applied:** [name the framework used]

**Structure Analysis:**
[Detailed structural evaluation with named framework]

**Pacing:** [evaluation with specific examples]

**Thematic Depth:** [primary themes and coherence assessment]

### Visual Craft
**Framework Applied:** Bordwell & Thompson Mise-en-scène Analysis

**Cinematography:** [lighting, camera work, visual style]
**Composition & Design:** [production design, costume, setting]
**Visual Storytelling:** [how visuals convey narrative]

### Performance & Character
**Framework Applied:** McDonald Performance Craft Framework

[Individual performance evaluations]
**Ensemble Dynamics:** [chemistry and interaction]
**Direction of Actors:** [performance quality and casting]

### Audiovisual Integration
**Score:** [composer, style, effectiveness]
**Sound Design:** [approach and notable elements]
**Editing:** [rhythm, transitions, techniques]

### Contextual Positioning
**Genre Analysis:** [conventions, innovations, adherence/subversion]
**Auteur Context:** [director's oeuvre position and signature elements]
**Historical Significance:** [release context and cultural impact]

---

## Scoring Rubric

| Dimension | Score (0-10) | Weight | Contribution |
|-----------|-------------|--------|--------------|
| Narrative Structure | [X] | 25% | [X.XX] |
| Visual Craft | [X] | 25% | [X.XX] |
| Performance | [X] | 20% | [X.XX] |
| Audiovisual Integration | [X] | 15% | [X.XX] |
| Originality | [X] | 10% | [X.XX] |
| Thematic Coherence | [X] | 5% | [X.XX] |
| **OVERALL SCORE** | **[X]/10** | 100% | **[X.XX]** |

**Methodology:** Weighted Multi-Criteria Decision Analysis (MCDA)
**Confidence:** [High/Medium/Low] based on [specific rationale]

---

## Verdict

**Recommendation:** [Essential/Recommended/Conditional/Skip]
**For:** [target audience description]
**Strengths:** [bulleted list]
**Weaknesses:** [bulleted list]
**Final Word:** [one-sentence summary]

---

## Spoiler-Tagged Content
[WARNING: Contains spoilers]

**Plot Reveals:** [detailed plot discussion]
**Character Arcs:** [character development details]
**Ending:** [conclusion discussion]
```

## Analysis Workflow

Follow this sequence for every film review:

1. **Information Collection**
   - Gather basic film info (title, year, director, genre)
   - Note runtime, language, country of origin if available
   - Confirm spoiler level preference with user

2. **Narrative Structure Analysis**
   - Apply Three-Act Structure OR Hero's Journey (choose based on fit)
   - Evaluate pacing across acts
   - Identify and assess thematic development
   - Reference `/references/narrative-frameworks.md` for detailed methodology

3. **Visual Craft Analysis**
   - Apply Bordwell & Thompson mise-en-scène framework
   - Evaluate cinematography (lighting, camera work, visual style)
   - Assess composition and production design
   - Note visual storytelling effectiveness
   - Reference `/references/visual-craft-frameworks.md`

4. **Performance Analysis**
   - Apply McDonald Performance Craft Framework
   - Evaluate individual performances (development, technique, impact)
   - Assess ensemble dynamics
   - Note direction of actors
   - Reference `/references/performance-frameworks.md`

5. **Audiovisual Analysis**
   - Evaluate score (composer, style, effectiveness)
   - Assess sound design approach and elements
   - Analyze editing rhythm and techniques
   - Note integration of audiovisual elements
   - Reference `/references/audiovisual-frameworks.md`

6. **Contextual Analysis**
   - Apply Genre Theory (Altman/Stam)
   - Analyze genre convention adherence and innovation
   - Apply Auteur Theory (Sarris) for director context
   - Note historical/cultural significance
   - Reference `/references/contextual-frameworks.md`

7. **Scoring**
   - Apply weighted MCDA rubric (weights specified in template)
   - Calculate overall score from weighted components
   - State confidence level based on information quality
   - Reference `/references/scoring-methodology.md`

8. **Verdict Formation**
   - Synthesize recommendation from scores and analysis
   - Identify target audience
   - Summarize key strengths and weaknesses
   - Provide final one-sentence verdict

## Using Bundled Resources

### `/references` Directory

Detailed methodology files for each analysis dimension:

- `narrative-frameworks.md` — Three-act, Hero's Journey operationalization
- `visual-craft-frameworks.md` — Mise-en-scène, cinematography analysis
- `performance-frameworks.md` — Character craft, acting evaluation
- `audiovisual-frameworks.md` — Sound, score, editing frameworks
- `contextual-frameworks.md` — Genre theory, auteur theory application
- `scoring-methodology.md` — Weighted MCDA rubric explanation

**When to read:** Read the specific reference file when beginning that analysis dimension. The file provides detailed criteria, checklists, and evaluation standards.

**How to use:** Apply the framework explicitly—name it in the output, use its terminology, follow its checklist structure. Don't just read and internalize; make the framework visible in your analysis.

### `/scripts` Directory

Automation scripts for common operations:

- `token-counter.ts` — Count tokens in analysis output for optimization
- `spoiler-detector.ts` — Automatically detect and tag spoiler content
- `scoring-calculator.ts` — Calculate weighted scores from component ratings
- `review-validator.ts` — Validate review completeness against template

**When to use:** Before delivering final output, run `review-validator.ts` to ensure all sections are complete. Use `token-counter.ts` to manage context window efficiently.

### `/config` Directory

Configuration files for skill behavior:

- `scoring-weights.json` — Customizable weightings for MCDA rubric
- `genre-conventions.json` — Genre-specific convention references
- `auteur-signatures.json` — Director signature element database

**When to read:** When beginning analysis of a specific film, consult `genre-conventions.json` for that film's genre(s) and `auteur-signatures.json` for the director's known elements.

## Token Optimization Strategy

This skill is designed for efficient token usage:

1. **Progressive Disclosure** — Load reference files only when needed for that analysis dimension
2. **Template-Based Output** — Use consistent structure; don't reinvent format each time
3. **Selective Detail** — Prioritize analysis depth over exhaustive listing
4. **Caching** — Tool results are cached where appropriate (see `src/tools/index.ts`)

**Target output length:** 2000-3000 tokens for standard review, 4000-5000 for comprehensive analysis.

## Error Handling and Fallbacks

When analysis cannot proceed normally:

1. **Insufficient Information**
   - State clearly what information is missing
   - Offer to proceed with caveats or wait for more details
   - Mark affected sections with "[Limited analysis due to insufficient information]"

2. **Framework Mismatch**
   - If chosen framework doesn't fit (e.g., non-linear film with three-act), acknowledge and adapt
   - Explain why framework was changed and what was used instead
   - Apply appropriate alternative framework from `/references`

3. **Uncertainty in Evaluation**
   - Use hedging language ("appears to," "seems to," "suggests")
   - State confidence level explicitly in scoring section
   - Flag areas requiring expert verification

## Guardrails and Disclaimers

- **Subjectivity Acknowledgment:** Film criticism inherently involves subjective judgment. This skill provides structured analysis based on established frameworks, not objective truth.
- **Expert Consultation:** For academic or professional publication, verify claims against original sources and consider consultation with domain experts.
- **Cultural Context:** Be aware of cultural biases in frameworks and criticism standards. Acknowledge limitations in cross-cultural analysis.
- **Spoiler Respect:** Always warn before spoiler content. Allow spoiler-free analysis on request.
- **Source Verification:** Claims about specific films, directors, or techniques should be verified against authoritative sources beyond this skill's knowledge base.

## Scope (Out of Scope)

This skill does NOT:

- Provide film recommendations without analysis framework application
- Discuss celebrity gossip or off-screen controversies
- Evaluate films based on box office or commercial success
- Make claims about technical specifications without verification
- Analyze films beyond established film theory frameworks
- Provide legal or financial advice related to film industry

## Quality Standards

Every review produced by this skill must:

1. **Name the framework** being applied in each section
2. **Use consistent terminology** from that framework
3. **Provide specific examples** from the film to support claims
4. **Include confidence level** in scoring
5. **Complete all template sections** unless explicitly excused by insufficient information
6. **Maintain professional tone** — casual, colloquial language undermines credibility

## Testing and Validation

After producing a review, self-validate:

1. **Template Completeness:** All required sections present
2. **Framework Naming:** Each analysis names its framework
3. **Example Support:** Each claim includes film-specific example
4. **Consistency:** Terminology used matches framework
5. **Confidence Stated:** Scoring includes confidence rationale
6. **Spoiler Warnings:** Present where applicable

Use `/scripts/review-validator.ts` for automated validation.

---

## For Skill Maintainers

### Modifying Scoring Weights

Edit `/config/scoring-weights.json` to adjust dimension weights. The file uses JSON format for easy modification without code changes.

### Adding New Frameworks

1. Create new reference file in `/references/`
2. Add framework operationalization (checklists, criteria)
3. Update this SKILL.md to reference new file in appropriate workflow step
4. Add framework to `/config/framework-registry.json` if tracking is needed

### Extending Genre/Auteur Databases

Add entries to `/config/genre-conventions.json` or `/config/author-signatures.json` following existing JSON structure.

---

**Version History:**
- 1.0.0 — Initial production-grade implementation with comprehensive framework coverage

**Knowledge Base Foundation:** See `SECOND-BRAIN-KNOWLEDGE-PAPER.md` for complete source citations supporting these methodologies.
