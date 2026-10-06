'use client';

import { clsx } from 'clsx';
import React, { forwardRef } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface CategoryGridItem {
  title: string;
  href?: string;
  image?: {
    src: string;
    alt?: string;
  };
}

export interface CategoryGridProps {
  className?: string;
  title?: string;
  subtitle?: string;
  columns?: '2' | '3' | '4';
  categories?: CategoryGridItem[];
}

const DEFAULT_SAMPLE_CATEGORIES: CategoryGridItem[] = [
  {
    title: 'Chairs & Sofas',
    href: '/shop-all',
    image: { src: '/images/categories/chairs.jpg', alt: 'Chairs & Sofas' },
  },
  {
    title: 'table',
    href: '/shop-all',
    image: { src: '/images/categories/table.jpg', alt: 'table' },
  },
  {
    title: 'Small furniture',
    href: '/shop-all',
  },
  {
    title: 'mirror',
    href: '/shop-all',
    image: { src: '/images/categories/mirror.jpg', alt: 'mirror' },
  },
  {
    title: 'rug',
    href: '/shop-all',
  },
  {
    title: 'Outdoor',
    href: '/shop-all',
  },
  {
    title: 'others',
    href: '/shop-all',
  },
];

function CategoryGridCard({ cat, className }: { cat: CategoryGridItem; className?: string }) {
  const cardInner = (
    <>
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-sm border border-neutral-200/40 bg-neutral-100">
        {cat.image?.src ? (
          <Image
            alt={cat.image.alt || cat.title}
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={cat.image.src}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100 px-2 text-xs font-medium text-neutral-400">
            {cat.title}
          </div>
        )}
      </div>

      <span className="text-xs font-normal tracking-wide text-neutral-800 transition-colors group-hover:text-neutral-500 sm:text-sm">
        {cat.title}
      </span>
    </>
  );

  if (cat.href) {
    return (
      <Link
        className={clsx(
          'group flex flex-col items-center text-center focus:outline-none',
          className,
        )}
        href={cat.href}
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <div className={clsx('group flex cursor-default flex-col items-center text-center', className)}>
      {cardInner}
    </div>
  );
}

export const CategoryGrid = forwardRef<HTMLElement, CategoryGridProps>(function CategoryGridSection(
  {
    className,
    title = 'The target categories are listed here.',
    subtitle = 'Furniture',
    columns = '4',
    categories = [],
  },
  ref,
) {
  const displayCategories = categories.length > 0 ? categories : DEFAULT_SAMPLE_CATEGORIES;

  const gridColsClass = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 sm:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  }[columns];

  const showTitle = title.length > 0;
  const showSubtitle = subtitle.length > 0;

  return (
    <section className={clsx('w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-8', className)} ref={ref}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 space-y-3 text-center sm:mb-14">
          {showTitle ? (
            <h2 className="text-2xl font-normal tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
              {title}
            </h2>
          ) : null}
          {showSubtitle ? (
            <p className="text-xs font-normal uppercase tracking-[0.25em] text-neutral-800 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className={clsx('grid gap-6 sm:gap-8 lg:gap-10', gridColsClass)}>
          {displayCategories.map((cat, idx) => (
            <CategoryGridCard cat={cat} key={`${cat.title}-${idx}`} />
          ))}
        </div>
      </div>
    </section>
  );
});

CategoryGrid.displayName = 'CategoryGrid';
