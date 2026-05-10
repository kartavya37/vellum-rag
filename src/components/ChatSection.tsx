'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';

const SUGGESTED_PROMPTS = [
  'Summarise this document in 5 bullet points',
  'What are the key takeaways?',
  'Pull out any numbers, dates, or names',
  'Explain the most complex section in plain English',
];

export default function ChatSection({ hasDocument = false }: { hasDocument?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer ?? 'No answer returned.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to get an answer. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-7 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center pt-8 pb-4 animate-fade-in-up">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--foreground)] to-[var(--accent)] flex items-center justify-center text-[var(--background)] font-bold text-base mb-4">
                D
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                {hasDocument ? 'Ready when you are.' : 'Welcome to Vellum.'}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)] mt-1.5 max-w-md">
                {hasDocument
                  ? 'Ask anything about your uploaded document — answers are pulled directly from the source.'
                  : 'Upload a PDF or text file in the side panel to start an evidence-grounded conversation.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-7 w-full max-w-xl">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    disabled={!hasDocument || loading}
                    className="text-left text-xs leading-relaxed px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <Message key={idx} msg={msg} />
          ))}

          {loading && (
            <div className="flex gap-3 animate-fade-in-up">
              <Avatar role="assistant" />
              <div className="flex items-center gap-1.5 h-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-subtle)] animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-subtle)] animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-subtle)] animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 md:px-8 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/60 focus-within:border-[var(--border-strong)] focus-within:bg-[var(--surface)] focus-within:shadow-[0_0_0_4px_var(--ring)] transition-all px-3 py-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasDocument ? 'Ask about your document…' : 'Upload a document, then ask anything…'}
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed py-2 px-1 placeholder:text-[var(--foreground-subtle)] disabled:opacity-50 max-h-[180px]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              aria-label="Send"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l14-7-7 14-2-7-5-0z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between text-[0.7rem] text-[var(--foreground-subtle)] mt-2 px-1">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-sans">Enter</kbd>{' '}
              to send ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-sans">Shift + Enter</kbd>{' '}
              for newline
            </span>
            <span>Answers may be imperfect — verify before relying on them.</span>
          </div>
        </form>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  if (role === 'user') {
    return (
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--bubble-user)] text-[var(--bubble-user-text)] flex items-center justify-center text-[0.7rem] font-semibold">
        You
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[var(--foreground)] to-[var(--accent)] text-[var(--background)] flex items-center justify-center font-bold text-[0.7rem]">
      V
    </div>
  );
}

function Message({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex gap-3 animate-fade-in-up">
      <Avatar role={msg.role} />
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[0.72rem] font-semibold text-[var(--foreground-muted)] mb-1">
          {msg.role === 'user' ? 'You' : 'Vellum'}
        </p>
        <div className="text-[0.92rem] leading-relaxed whitespace-pre-wrap text-[var(--foreground)]">
          {msg.content}
        </div>
      </div>
    </div>
  );
}
