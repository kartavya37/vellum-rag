# Vellum

A retrieval-augmented chat app for your own documents. Upload a PDF or text file, and Vellum chunks it, embeds it, stores the vectors, and answers questions grounded in the source — no hallucinated facts.

## Features

- Drag-and-drop upload for PDF and TXT
- Sentence-aware chunking with overlap for context preservation
- Semantic retrieval over a hosted vector store
- Grounded answers with a refined chat interface
- Light and dark mode

## Architecture

```text
Upload → Text Extraction → Chunking → Embedding → Vector Store → Retrieval → Generation
```

1. **Ingest** — user drops a PDF or TXT file
2. **Extract** — `unpdf` pulls plain text out of PDFs
3. **Chunk** — sentence-boundary splitter with character-window overlap
4. **Embed** — `openai/text-embedding-3-small` via the Vercel AI Gateway
5. **Store** — vectors written to Upstash Vector (hosted)
6. **Retrieve** — top-k similarity search per question
7. **Generate** — `openai/gpt-5.3-chat` answers using only retrieved context

## Tech stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, TypeScript)                     |
| UI           | React 19, Tailwind CSS 4                                |
| PDF parsing  | unpdf                                                   |
| Embeddings   | `openai/text-embedding-3-small` via Vercel AI Gateway   |
| Vector store | Upstash Vector                                          |
| LLM          | `openai/gpt-5.3-chat` via Vercel AI SDK                 |

## Chunking strategy

Sentence-based chunking with character overlap:

- **Chunk size**: ~500 characters
- **Overlap**: ~50 characters
- **Splitter**: `(?<=[.!?])\s+`

Sentences are accumulated until the size budget is hit, the trailing slice of the previous chunk is carried into the next chunk to preserve context across boundaries, and the remainder is flushed as the final chunk. Sentence-aligned cuts keep meaning intact, while overlap keeps cross-chunk references retrievable.

## Setup

### Prerequisites

- Node.js 18+
- A Vercel AI Gateway key (proxies OpenAI)
- An Upstash Vector database

### Install and run

```bash
git clone <repository-url>
cd SimpleRag
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm start
```

### Environment variables

Create a `.env` file in the project root:

```env
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token
```

- Get an AI Gateway key at [vercel.com/dashboard](https://vercel.com/dashboard) → AI → Gateway.
- Provision a vector database at [console.upstash.com](https://console.upstash.com/).

## Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. Drop a PDF or TXT into the **Knowledge base** panel
3. Wait for indexing (extract → chunk → embed → store)
4. Ask anything about the document in the chat panel — answers are pulled from the file

## API

### `POST /api/upload`

Upload and index a document.

**Request**: `multipart/form-data` with a `file` field.

**Response**:

```json
{
  "success": true,
  "chunkCount": 79,
  "message": "Successfully processed document.pdf into 79 chunks"
}
```

### `POST /api/query`

Ask a question against the indexed document.

**Request**:

```json
{ "question": "What is the main topic of this document?" }
```

**Response**:

```json
{
  "answer": "Based on the document, the main topic is...",
  "sources": 4
}
```

## Project structure

```text
SimpleRag/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts    # Document upload endpoint
│   │   │   └── query/route.ts     # Q&A endpoint
│   │   ├── globals.css            # Design tokens & utilities
│   │   ├── layout.tsx
│   │   └── page.tsx               # Sidebar + chat layout
│   ├── components/
│   │   ├── UploadSection.tsx      # Drag-and-drop uploader
│   │   └── ChatSection.tsx        # Chat interface
│   ├── lib/
│   │   ├── chunking.ts            # Sentence-aware chunker
│   │   ├── embeddings.ts          # Vercel AI Gateway embeddings
│   │   ├── vectorStore.ts         # Upstash Vector client
│   │   └── groq.ts                # LLM generation (Vercel AI SDK)
│   └── types/
│       └── index.ts
├── .env                           # Environment variables (not committed)
├── next.config.ts
├── package.json
└── README.md
```
