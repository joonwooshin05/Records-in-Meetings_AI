'use client';

import { useState, useEffect } from 'react';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'splash' | 'fadeout' | 'done'>('splash');

  useEffect(() => {
    const fadeoutTimer = setTimeout(() => setPhase('fadeout'), 2400);
    const doneTimer = setTimeout(() => setPhase('done'), 3000);
    return () => {
      clearTimeout(fadeoutTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return <>{children}</>;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        style={{
          opacity: phase === 'fadeout' ? 0 : 1,
          transition: 'opacity 600ms ease-out',
        }}
      >
        <div className="flex flex-col items-center gap-6 splash-fadein">
          {/* Logo */}
          <div className="relative">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* Speech bubble */}
              <rect x="8" y="8" width="64" height="48" rx="12" className="fill-primary" />
              <polygon points="24,56 36,56 20,72" className="fill-primary" />
              {/* Sound waves */}
              <path
                d="M32 28 C32 28, 32 44, 32 44"
                className="stroke-primary-foreground"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M40 22 C40 22, 40 50, 40 50"
                className="stroke-primary-foreground"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M48 26 C48 26, 48 46, 48 46"
                className="stroke-primary-foreground"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M56 30 C56 30, 56 42, 56 42"
                className="stroke-primary-foreground"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M24 32 C24 32, 24 40, 24 40"
                className="stroke-primary-foreground"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Title */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Meeting AI</h1>
            <p className="text-sm text-muted-foreground">Real-time Transcription & Translation</p>
          </div>
        </div>
      </div>
      <div className="invisible">{children}</div>
    </>
  );
}
