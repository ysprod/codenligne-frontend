'use client';
import { Suspense } from 'react';
import HeaderContent from '@/components/layout/HeaderContent/HeaderContent';

interface SecuredHeaderSuspenseProps {
  fallbackContent?: React.ReactNode;
}

export function SecuredHeaderSuspense({
  fallbackContent = (
    <div className="px-4 py-4 sm:px-4">
      <div className="h-11 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-zinc-900 mb-8" />
    </div>
  )
}: SecuredHeaderSuspenseProps) {

  return (
    <Suspense fallback={fallbackContent}>
      <HeaderContent />
    </Suspense>
  );
}