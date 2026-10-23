'use client';

import { PropsWithChildren } from 'react';

import { usePathname } from '~/i18n/routing';

export function HomeOnly({ children }: PropsWithChildren) {
  const pathname = usePathname();

  if (pathname !== '/') {
    return null;
  }

  return children;
}
