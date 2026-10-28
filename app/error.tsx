'use client';
import GlobalErrorUI from '@/components/commons/GlobalErrorUI';

export default function Error({ error, reset, }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  return <GlobalErrorUI error={error} reset={reset} />;
}
