'use client';

import { clsx } from 'clsx';
import React, { forwardRef, useMemo } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import {
  Breadcrumb,
  BreadcrumbsSkeleton,
  Breadcrumbs as VibesBreadcrumbs,
} from '@/vibes/soul/sections/breadcrumbs';
import { usePathname } from '~/i18n/routing';
import {
  formatSegmentLabel,
  generateBreadcrumbsFromPathname,
  ROUTE_LABELS,
} from '~/lib/breadcrumbs';

export type { Breadcrumb };
export { BreadcrumbsSkeleton };
export { formatSegmentLabel, generateBreadcrumbsFromPathname, ROUTE_LABELS };

export interface BreadcrumbsProps {
  /**
   * Optional custom breadcrumbs to render.
   * If not provided, breadcrumbs are automatically derived from the current URL pathname.
   */
  breadcrumbs?: Streamable<Breadcrumb[]>;

  /**
   * Whether to wrap the breadcrumbs in a standard responsive layout container.
   * Defaults to true. Set to false to embed seamlessly inside existing section layouts.
   */
  container?: boolean;

  /**
   * Additional classes applied to the breadcrumb navigation.
   */
  className?: string;

  /**
   * Additional classes applied to the outer container when container={true}.
   */
  containerClassName?: string;
}

export const Breadcrumbs = forwardRef<HTMLDivElement, BreadcrumbsProps>(
  ({ breadcrumbs, container = true, className, containerClassName }, ref) => {
    const pathname = usePathname();

    const resolvedBreadcrumbs = useMemo(() => {
      if (breadcrumbs !== undefined) {
        return breadcrumbs;
      }

      return generateBreadcrumbsFromPathname(pathname);
    }, [breadcrumbs, pathname]);

    // If auto-generated and there are no breadcrumbs (e.g. on homepage), don't render anything
    if (Array.isArray(resolvedBreadcrumbs) && resolvedBreadcrumbs.length <= 1) {
      return null;
    }

    const content = <VibesBreadcrumbs breadcrumbs={resolvedBreadcrumbs} className={className} />;

    if (!container) {
      return (
        <div className={containerClassName} ref={ref}>
          {content}
        </div>
      );
    }

    return (
      <div
        className={clsx(
          'mx-auto w-full max-w-screen-2xl px-4 pt-6 @xl:px-6 @4xl:px-8',
          containerClassName,
        )}
        ref={ref}
      >
        {content}
      </div>
    );
  },
);

Breadcrumbs.displayName = 'Breadcrumbs';
