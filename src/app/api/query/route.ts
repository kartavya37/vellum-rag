import { NextRequest, NextResponse } from 'next/server';
import { generateSingleEmbedding } from '@/lib/embeddings';
import { similaritySearch } from '@/lib/vectorStore';
import { generateAnswer } from '@/lib/groq';
import { gradeDocuments, rewriteQuery, type CragTrace } from '@/lib/crag';

const TOP_K = 4;

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    const trace: CragTrace = {
      initialRetrieved: 0,
      initialRelevant: 0,
      rewrittenQuery: null,
      rewriteRetrieved: 0,
      rewriteRelevant: 0,
      action: 'no_relevant_context',
    };

    const queryEmbedding = await generateSingleEmbedding(question);
    const initialHits = await similaritySearch(queryEmbedding, TOP_K);
    trace.initialRetrieved = initialHits.length;

    const graded = await gradeDocuments(question, initialHits);
    const relevant = graded.filter((d) => d.grade === 'relevant');
    trace.initialRelevant = relevant.length;

    let finalContexts = relevant.map((d) => d.text);

    if (relevant.length === graded.length && graded.length > 0) {
      trace.action = 'use_retrieved';
    } else {
      trace.action = 'rewrite_and_retry';
      const rewritten = await rewriteQuery(question);
      trace.rewrittenQuery = rewritten;

      const rewrittenEmbedding = await generateSingleEmbedding(rewritten);
      const rewriteHits = await similaritySearch(rewrittenEmbedding, TOP_K);
      trace.rewriteRetrieved = rewriteHits.length;

      const seen = new Set(finalContexts);
      const newHits = rewriteHits.filter((h) => !seen.has(h.text));
      const gradedRewrite = await gradeDocuments(question, newHits);
      const newRelevant = gradedRewrite.filter((d) => d.grade === 'relevant');
      trace.rewriteRelevant = newRelevant.length;

      finalContexts = [...finalContexts, ...newRelevant.map((d) => d.text)];
    }

    if (finalContexts.length === 0) {
      trace.action = 'no_relevant_context';
      return NextResponse.json({
        answer:
          "I couldn't find anything relevant to your question in the uploaded document. Try rephrasing, or upload a document that covers this topic.",
        sources: 0,
        crag: trace,
      });
    }

    const answer = await generateAnswer(finalContexts, question);

    return NextResponse.json({
      answer,
      sources: finalContexts.length,
      crag: trace,
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}
