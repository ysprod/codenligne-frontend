import { FileQuestion } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface-alt flex flex-col items-center justify-center p-4 text-ink">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="CODENLIGNE" width={64} height={64} className="object-contain" />
        </div>
        
        <div className="bg-white rounded-xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-4 text-primary">
            <FileQuestion className="w-16 h-16" aria-hidden="true" />
          </div>
          
          <h1 className="text-2xl font-bold text-ink mb-2">Page introuvable</h1>
          <p className="text-base text-ink-soft mb-6">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          
          <Link href="/" className="btn-primary w-full">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}