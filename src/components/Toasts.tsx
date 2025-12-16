"use client";

import { useEffect, useState } from 'react';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  duration: number;
};

export default function Toasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const t = ce.detail as Toast;
      setToasts((prev) => [...prev, t]);
      // auto-remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, t.duration + 50);
    };
    window.addEventListener('glee-toast', handler as EventListener);
    return () => window.removeEventListener('glee-toast', handler as EventListener);
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto max-w-sm w-full rounded-lg px-4 py-3 shadow-lg border transition transform ease-out duration-150 flex items-start gap-3 ${
            t.type === 'success' ? 'bg-white border-green-200' : t.type === 'error' ? 'bg-white border-red-200' : 'bg-white border-gray-200'
          }`}
        >
          <div className="mt-0.5">
            {t.type === 'success' ? (
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd"/></svg>
            ) : t.type === 'error' ? (
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V6a1 1 0 112 0v3a1 1 0 11-2 0zm0 4a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd"/></svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm9-4a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z"/></svg>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-800">{t.message}</div>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600 ml-2"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
