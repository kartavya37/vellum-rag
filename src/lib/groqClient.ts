import OpenAI from 'openai';

if (!process.env.GROQ_API_KEY) {
  console.warn('[groqClient] GROQ_API_KEY is not set — CRAG grading/rewriting will fail at runtime.');
}

export const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export const GROQ_JUDGE_MODEL = 'llama-3.1-8b-instant';
