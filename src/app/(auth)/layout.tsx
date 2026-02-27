'use client';

import Link from 'next/link';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <span className="text-2xl">🌱</span>
          <span>{APP_NAME}</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>{APP_TAGLINE}</p>
      </footer>
    </div>
  );
}
