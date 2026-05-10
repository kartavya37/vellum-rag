'use client';

import { useState } from 'react';
import UploadSection from '@/components/UploadSection';
import ChatSection from '@/components/ChatSection';

export default function Home() {
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeDoc, setActiveDoc] = useState<{ name: string; size: number } | null>(null);
  const [resetChat, setResetChat] = useState(0);

  const isError = status?.type === 'error';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--foreground)] to-[var(--accent)] flex items-center justify-center text-[var(--background)] font-bold text-sm">
              V
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[0.95rem] font-semibold tracking-tight">Vellum</span>
              <span className="text-[0.7rem] text-[var(--foreground-subtle)]">Retrieval-augmented chat</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="chip">
              <span className="dot bg-emerald-500 animate-pulse-soft" />
              Online
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost hidden sm:inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Source
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-5 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7">
        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
          <section className="panel p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Knowledge base</h2>
                <span className="text-[0.7rem] text-[var(--foreground-subtle)] uppercase tracking-wider">
                  Step 1
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">
                Drop a PDF or text file. We&apos;ll chunk, embed, and index it so the chat can cite it.
              </p>
            </div>

            <UploadSection
              onUploadStart={(file) => {
                setActiveDoc({ name: file.name, size: file.size });
                setStatus(null);
              }}
              onUploadComplete={(message, ok) => {
                setStatus({ message, type: ok ? 'success' : 'error' });
                setResetChat((p) => p + 1);
                if (!ok) setActiveDoc(null);
              }}
            />

            {activeDoc && (
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] animate-fade-in-up">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{activeDoc.name}</p>
                    <p className="text-[0.7rem] text-[var(--foreground-subtle)]">
                      {(activeDoc.size / 1024).toFixed(1)} KB · indexed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveDoc(null);
                    setStatus(null);
                    setResetChat((p) => p + 1);
                  }}
                  className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)] p-1 rounded-md hover:bg-[var(--surface)] transition-colors"
                  aria-label="Clear document"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {status && (
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed border animate-fade-in-up ${
                  isError
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40'
                }`}
              >
                {status.message}
              </div>
            )}
          </section>

          <section className="panel p-5">
            <h3 className="text-sm font-semibold tracking-tight mb-3">How it works</h3>
            <ol className="space-y-3">
              {[
                { t: 'Upload', d: 'PDF or .txt up to a few MB.' },
                { t: 'Embed', d: 'Text is split and vectorised.' },
                { t: 'Ask', d: 'Questions are answered from your file.' },
              ].map((step, i) => (
                <li key={step.t} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-[0.7rem] font-semibold flex items-center justify-center text-[var(--foreground-muted)]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-medium">{step.t}</p>
                    <p className="text-[0.7rem] text-[var(--foreground-subtle)] leading-relaxed">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>

        {/* Chat */}
        <section className="lg:col-span-8 xl:col-span-9 panel flex flex-col overflow-hidden h-[calc(100vh-7.5rem)] min-h-[560px]">
          <div className="border-b border-[var(--border)] px-5 md:px-7 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Chat</h2>
              <p className="text-[0.7rem] text-[var(--foreground-subtle)]">
                {activeDoc ? `Grounded in “${activeDoc.name}”` : 'Upload a document to start grounding answers'}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <ChatSection key={resetChat} hasDocument={!!activeDoc} />
          </div>
        </section>
      </main>
    </div>
  );
}
