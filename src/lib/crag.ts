import { groqClient, GROQ_JUDGE_MODEL } from './groqClient';

export type Grade = 'relevant' | 'irrelevant';

export interface GradedDoc {
  text: string;
  score: number;
  grade: Grade;
}

export interface CragTrace {
  initialRetrieved: number;
  initialRelevant: number;
  rewrittenQuery: string | null;
  rewriteRetrieved: number;
  rewriteRelevant: number;
  action: 'use_retrieved' | 'rewrite_and_retry' | 'no_relevant_context';
}

export async function gradeDocuments(
  question: string,
  docs: { text: string; score: number }[],
): Promise<GradedDoc[]> {
  if (docs.length === 0) return [];

  const system = `You are a strict relevance grader. For each retrieved document, decide whether it contains information that helps answer the user's question.

Respond with ONLY a JSON object of the form:
{"grades": ["relevant" | "irrelevant", ...]}

The "grades" array MUST have exactly ${docs.length} entries, one per document, in the same order as the input. No prose, no explanations.`;

  const docsBlock = docs
    .map((d, i) => `--- Document ${i + 1} ---\n${d.text}`)
    .join('\n\n');

  const user = `Question:\n${question}\n\nDocuments:\n${docsBlock}`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_JUDGE_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as { grades?: unknown };
    const grades = Array.isArray(parsed.grades) ? parsed.grades : [];

    return docs.map((d, i) => {
      const g = typeof grades[i] === 'string' ? (grades[i] as string).toLowerCase() : '';
      const grade: Grade = g.startsWith('relevant') ? 'relevant' : 'irrelevant';
      return { ...d, grade };
    });
  } catch (err) {
    console.error('[crag.gradeDocuments] grading failed, defaulting to relevant:', err);
    return docs.map((d) => ({ ...d, grade: 'relevant' as Grade }));
  }
}

export async function rewriteQuery(question: string): Promise<string> {
  const system = `You rewrite user questions to improve retrieval from a vector store of document chunks. Produce a single rewritten query that:
- Preserves the original intent
- Expands key terms with likely synonyms or related phrasing the document might use
- Removes conversational filler
- Stays under 30 words

Respond with ONLY the rewritten query — no quotes, no preamble.`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_JUDGE_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: question },
      ],
    });
    const text = completion.choices[0]?.message?.content ?? question;
    return text.trim().replace(/^["']|["']$/g, '');
  } catch (err) {
    console.error('[crag.rewriteQuery] rewrite failed, returning original:', err);
    return question;
  }
}
