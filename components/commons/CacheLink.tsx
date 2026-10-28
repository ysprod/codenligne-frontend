'use client';
import { prefetchRouteData } from '@/lib/cache/route-prefetch';
import { useAuthStore } from '@/lib/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useCallback } from 'react';

type NextLinkProps = ComponentPropsWithoutRef<typeof Link>;

interface CacheLinkProps extends Omit<NextLinkProps, 'href' | 'children'> {
  href: string;
  children: ReactNode;
}

export default function CacheLink({ href, children, className, ...props }: CacheLinkProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isAuthenticated = Boolean(useAuthStore((state) => state.user));

  const handlePrefetch = useCallback(() => {
    if (props.prefetch === false) {
      return;
    }
    void router.prefetch(href);
    void prefetchRouteData(queryClient, href, isAuthenticated);
  }, [href, isAuthenticated, props.prefetch, queryClient, router]);

  const handleMouseEnter = useCallback<NonNullable<CacheLinkProps['onMouseEnter']>>((event) => {
    props.onMouseEnter?.(event);
    handlePrefetch();
  }, [handlePrefetch, props]);

  const handleFocus = useCallback<NonNullable<CacheLinkProps['onFocus']>>((event) => {
    props.onFocus?.(event);
    handlePrefetch();
  }, [handlePrefetch, props]);

  const handleTouchStart = useCallback<NonNullable<CacheLinkProps['onTouchStart']>>((event) => {
    props.onTouchStart?.(event);    
    handlePrefetch();
  }, [handlePrefetch, props]);

  return (
    <Link
      href={href}
      className={className}
      {...props}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onTouchStart={handleTouchStart}
    >
      {children}
    </Link>
  );
}
