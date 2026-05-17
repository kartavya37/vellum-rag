export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    pageNumber?: number;
  };
}

export interface Chunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    chunkIndex: number;
    pageNumber?: number;
  };
}

export interface SearchResult {
  content: string;
  score: number;
  metadata: {
    source: string;
    pageNumber?: number;
  };
}

export interface CragTrace {
  initialRetrieved: number;
  initialRelevant: number;
  rewrittenQuery: string | null;
  rewriteRetrieved: number;
  rewriteRelevant: number;
  action: 'use_retrieved' | 'rewrite_and_retry' | 'no_relevant_context';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  crag?: CragTrace;
}
