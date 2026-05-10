'use client';

import { useState, useRef } from 'react';

interface Props {
  onUploadStart?: (file: File) => void;
  onUploadComplete: (message: string, success: boolean) => void;
}

export default function UploadSection({ onUploadStart, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    onUploadStart?.(file);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        onUploadComplete(data.message ?? 'Document indexed successfully.', true);
      } else {
        onUploadComplete(`${data.error ?? 'Upload failed.'}`, false);
      }
    } catch {
      onUploadComplete('Upload failed. Please try again.', false);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!uploading) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={`relative overflow-hidden rounded-xl border border-dashed px-5 py-7 flex flex-col items-center justify-center text-center transition-all duration-200 group ${
        dragOver
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : 'border-[var(--border-strong)] hover:border-[var(--foreground-muted)] bg-[var(--surface-muted)]/50'
      } ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
        disabled={uploading}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-9 h-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          <p className="text-xs font-medium">Indexing your document…</p>
          <p className="text-[0.7rem] text-[var(--foreground-subtle)]">Chunking, embedding, storing</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center group-hover:scale-[1.04] transition-transform">
            <svg
              className="w-5 h-5 text-[var(--foreground-muted)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--foreground)]">
              Drop a file or <span className="text-[var(--accent)]">browse</span>
            </p>
            <p className="text-[0.7rem] text-[var(--foreground-subtle)] mt-1">
              PDF or TXT · up to ~10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
