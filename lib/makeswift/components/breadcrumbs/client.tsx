'use client';

import React, { forwardRef } from 'react';

import { Breadcrumb, Breadcrumbs } from '~/components/breadcrumbs';

export interface MSBreadcrumbsProps {
  className?: string;
  useAutoPath?: boolean;
  breadcrumbs?: Array<{
    label: string;
    href?: { href?: string; target?: string } | string;
  }>;
}

function resolveBreadcrumbHref(
  href: { href?: string; target?: string } | string | undefined,
): string {
  if (typeof href === 'string') {
    return href;
  }

  if (href && typeof href.href === 'string') {
    return href.href;
  }

  return '#';
}

export const MSBreadcrumbs = forwardRef<HTMLDivElement, MSBreadcrumbsProps>(
  ({ className, useAutoPath = true, breadcrumbs = [] }, ref) => {
    const customItems: Breadcrumb[] | undefined =
      !useAutoPath && breadcrumbs.length > 0
        ? breadcrumbs.map((b) => ({
            label: b.label,
            href: resolveBreadcrumbHref(b.href),
          }))
        : undefined;

    return (
      <div className={className} ref={ref}>
        <Breadcrumbs breadcrumbs={customItems} container={false} />
      </div>
    );
  },
);

MSBreadcrumbs.displayName = 'MSBreadcrumbs';
