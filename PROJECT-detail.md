# PROJECT-detail.md — Film & Movie Review Assistant

## 1. Problem Statement

A skill for writing structured, defensible film reviews evaluating narrative structure, direction, cinematography, performance, sound/score, and thematic depth, using established film-criticism and screenwriting frameworks.

## 2. Target Users

Describe the primary user personas for this skill (fill in based on real usage once built): e.g., students, professionals, hobbyists, or practitioners in the relevant domain.

## 3. Functional Specification

### 3.1 Core Capabilities

- Analyze narrative structure (three-act, Hero's Journey, non-linear)
- Evaluate direction, cinematography, and mise-en-scène choices
- Assess performances against character-craft criteria
- Evaluate sound design/score contribution to tone
- Contextualize film within genre conventions and director's oeuvre
- Produce a spoiler-free summary plus a detailed spoiler-tagged analysis
- Apply a transparent, calibrated scoring rubric

### 3.2 Key Methodologies & Frameworks Applied

- **Three-Act Structure (Syd Field)**
- **The Hero's Journey (Joseph Campbell / Christopher Vogler)**
- **Mise-en-scène analysis framework (Bordwell & Thompson)**
- **Auteur theory for director-oeuvre contextualization**
- **Genre theory for convention-based evaluation**

Each framework above should be operationalized as a concrete step, checklist, or template inside the skill's SKILL.md and reference files once this scaffold is turned into a runnable skill (see `DEVELOPMENT-TASK-BY-PHASES.md`).

### 3.3 Expected Input

Typical user requests this skill should handle (fill in with real example prompts during development and testing).

### 3.4 Expected Output Format

Define the structured output format(s) this skill should produce (e.g., structured report, checklist, scored recommendation, memo). Align with the methodologies above so outputs are consistent and auditable.

## 4. Out of Scope / Guardrails

General guardrails apply — remain factual, avoid unsupported certainty, and encourage professional consultation where the topic genuinely warrants it.

## 5. Knowledge Base Dependency

This skill's reasoning quality depends on the research foundations catalogued in `SECOND-BRAIN-KNOWLEDGE-PAPER.md`. When building the actual skill (SKILL.md + references/), extract the operational principles from each paper into concrete reference files rather than leaving them as a flat reading list.

## 6. Success Criteria

- Output correctly applies the named methodologies rather than generic reasoning.
- Output is well-structured and consistent across repeated runs on similar inputs.
- Domain-appropriate guardrails/disclaimers are respected in every response.
- Test prompts (see `DEVELOPMENT-TASK-BY-PHASES.md`, Phase 5) produce outputs a subject-matter-competent reviewer would rate as sound.
