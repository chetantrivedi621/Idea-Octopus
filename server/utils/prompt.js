// utils/prompt.js
// builds the instruction prompt that tells the LLM how to summarize slides clearly for non-technical readers

export function buildPrompt(slides) {
  const blocks = (slides || []).map((s) => {
    const title = s.title ? ` ${s.title}` : ''
    const body = [
      ...(s.bullets || []),
      ...(s.notes ? [s.notes] : []),
      ...((s.images_text || []))
    ].join('\n')
    return `[Slide ${s.slide}]${title}\n${body}`.trim()
  }).join('\n\n')

  return `Context: You will receive slide-wise content from a hackathon deck.
Audience: Non-technical evaluator.

Tasks:
1) TL;DR: 3–5 bullets, max 80 words total.
2) One-page brief with: Problem, Why Now, Solution, How It Works (simple analogy), Evidence/Results, What's New, Risks & Mitigations, Next Steps/Asks.
3) Glossary: 3–8 items (term + simple definition).
4) Five evaluator questions and three biggest risks.

Rules:
- Grade 7–9 reading level; avoid buzzwords.
- Cite slide numbers like [S7] when referencing evidence.
- Return strict JSON with keys: meta, tldr[], nonTechnicalBrief, glossary[{term,simple}],
  highlights{problem,solution,howSimple,evidenceMetrics[],differentiation[],risks[]},
  evaluatorQuestions[], flags{boldClaimsWithoutSource[],missingPieces[],inconsistencies[]},
  rubricScores{problemClarity,solutionFeasibility,impactPotential,evidenceQuality,communicationClarity}.

Deck content:
${blocks}`
}
