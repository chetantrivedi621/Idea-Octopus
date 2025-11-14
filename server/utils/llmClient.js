// utils/llmClient.js
// Perplexity-first client, with OpenAI + mock fallback.
// Node 18+ (global fetch). If Node <18, install node-fetch and import it.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const PPLX_URL   = 'https://api.perplexity.ai/chat/completions';

export async function summarizeWithLLM(prompt, opts = {}) {
  const provider    = (process.env.LLM_PROVIDER || 'perplexity').toLowerCase();
  const model       = opts.model || process.env.MODEL || 'pplx-70b-chat';
  const temperature = opts.temperature ?? 0.2;
  const timeoutMs   = opts.timeoutMs ?? 90_000;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    if (provider === 'perplexity') {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) return mockSummary();

      const res = await fetch(PPLX_URL, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature,
          messages: [
            { role: 'system', content: 'You are a patient technical explainer. Use short sentences and everyday words. Explain terms in brackets the first time.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`LLM ${res.status}: ${text}`);
      }
      const data = await res.json().catch(() => null);
      const content = data?.choices?.[0]?.message?.content;

      try {
        return JSON.parse(content);
      } catch {
        throw new Error('LLM returned non-JSON content');
      }
    }

    if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return mockSummary();

      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: opts.model || process.env.MODEL || 'gpt-4o-mini',
          temperature,
          messages: [
            { role: 'system', content: 'You are a patient technical explainer. Use short sentences and everyday words. Explain terms in brackets the first time.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`LLM ${res.status}: ${text}`);
      }
      const data = await res.json().catch(() => null);
      const content = data?.choices?.[0]?.message?.content;
      try {
        return JSON.parse(content);
      } catch {
        throw new Error('LLM returned non-JSON content');
      }
    }

    // Fallback
    return mockSummary();
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('LLM request failed: timeout');
    throw new Error(`LLM request failed: ${String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

function mockSummary() {
  return {
    meta: { slides: 0, language: 'en', readabilityGrade: 8.5 },
    tldr: [
      'What: Converts hackathon decks to simple briefs.',
      'Why: Helps non-tech judges decide faster.',
      'How: Extract text + summarize with rules.',
      'Impact: Clear, comparable submissions.',
      'Ask: API credits & mentors.'
    ],
    nonTechnicalBrief: 'This is a mock brief. Wire your LLM API key to replace it.',
    glossary: [{ term: 'OCR', simple: 'Reading text from images.' }],
    highlights: {
      problem: 'Judges struggle to parse jargon-heavy decks quickly.',
      solution: 'Automatic, plain-English summaries with slide citations.',
      howSimple: 'Like a translator for tech slides.',
      evidenceMetrics: [],
      differentiation: ['Non-tech first', 'Claim radar', 'Rubric scoring'],
      risks: ['OCR quality', 'API costs']
    },
    evaluatorQuestions: [
      'How do you handle image-only slides?',
      'What’s the per-deck cost?',
      'How do you prevent hallucinations?',
      'Can judges click references?',
      'How do you handle multilingual decks?'
    ],
    flags: { boldClaimsWithoutSource: [], missingPieces: [], inconsistencies: [] },
    rubricScores: { problemClarity: 9, solutionFeasibility: 8, impactPotential: 8, evidenceQuality: 6, communicationClarity: 9 }
  };
}

async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
}
