'use client';
import GlobalErrorUI from '@/components/commons/GlobalErrorUI';

export default function GlobalError({ error, reset, }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  return (
    <html lang="fr">
      <body>
        <GlobalErrorUI error={error} reset={reset} isGlobalError={true} />
      </body>
    </html>
  );
}
