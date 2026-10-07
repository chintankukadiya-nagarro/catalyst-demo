'use client';

import { clsx } from 'clsx';
import React from 'react';

import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface TabCarouselProduct {
  id: string;
  title: string;
  href: string;
  image?: {
    src: string;
    alt: string;
  };
  price?: Price;
  subtitle?: string; // Brand name
  badge?: string; // e.g. "New Arrivals", "Back in stock", "reservation"
  secondaryBadge?: string;
  inventoryMessage?: string;
  isInStock?: boolean;
}

export interface TabCarouselProductCardProps {
  product: TabCarouselProduct;
  numberIndex?: number;
  showNumber?: boolean;
  aspectRatio?: '5:6' | '3:4' | '1:1';
  className?: string;
}

function formatNumberBadge(num: number): string {
  return `No. ${num.toString().padStart(2, '0')}`;
}

export function TabCarouselProductCard({
  product,
  numberIndex,
  showNumber = false,
  aspectRatio = '5:6',
  className,
}: TabCarouselProductCardProps) {
  const {
    title,
    href,
    image,
    price,
    subtitle,
    badge,
    secondaryBadge,
    inventoryMessage,
    isInStock = true,
  } = product;

  return (
    <article className={clsx('group flex w-full flex-col font-sans', className)}>
      {/* Product Image Container */}
      <Link className="relative block w-full overflow-hidden focus:outline-none" href={href}>
        <div
          className={clsx(
            'relative w-full overflow-hidden bg-neutral-100 transition-colors',
            {
              '1:1': 'aspect-square',
              '5:6': 'aspect-[5/6]',
              '3:4': 'aspect-[3/4]',
            }[aspectRatio],
          )}
        >
          {image?.src != null && image.src !== '' ? (
            <Image
              alt={image.alt || title}
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              src={image.src}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-neutral-400">
              {title}
            </div>
          )}

          {/* Badges on top of image */}
          <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
            {badge != null && badge !== '' && (
              <span className="bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white">
                {badge}
              </span>
            )}
            {secondaryBadge != null && secondaryBadge !== '' && (
              <span className="bg-neutral-500 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white">
                {secondaryBadge}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="mt-2.5 flex flex-col space-y-1 text-left">
        {/* Number Badge: No. 01, No. 02... */}
        {showNumber && numberIndex != null && (
          <span className="text-[11px] font-medium tracking-wider text-neutral-700">
            {formatNumberBadge(numberIndex)}
          </span>
        )}

        {/* Brand Name (subtitle) */}
        {subtitle != null && subtitle !== '' && (
          <span className="truncate text-[11px] font-normal uppercase tracking-wider text-neutral-500">
            {subtitle}
          </span>
        )}

        {/* Product Title */}
        <Link
          className="line-clamp-2 text-xs font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-neutral-600 sm:text-sm"
          href={href}
          title={title}
        >
          {title}
        </Link>

        {/* Price */}
        {price != null && (
          <div className="pt-0.5 text-xs font-medium text-neutral-900 sm:text-sm">
            <PriceLabel price={price} />
          </div>
        )}

        {/* Stock / Availability */}
        {(!isInStock || (inventoryMessage != null && inventoryMessage !== '')) && (
          <span className="text-[11px] text-neutral-500">
            {inventoryMessage ?? (!isInStock ? 'Out of stock' : '')}
          </span>
        )}
      </div>
    </article>
  );
}

export function TabCarouselProductCardSkeleton({
  aspectRatio = '5:6',
  showNumber = false,
}: {
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showNumber?: boolean;
}) {
  return (
    <div className="flex w-full animate-pulse flex-col space-y-2.5">
      <div
        className={clsx(
          'w-full bg-neutral-200',
          {
            '1:1': 'aspect-square',
            '5:6': 'aspect-[5/6]',
            '3:4': 'aspect-[3/4]',
          }[aspectRatio],
        )}
      />
      {showNumber && <div className="h-3 w-12 rounded bg-neutral-200" />}
      <div className="h-3 w-20 rounded bg-neutral-200" />
      <div className="h-4 w-full rounded bg-neutral-200" />
      <div className="h-3 w-16 rounded bg-neutral-200" />
    </div>
  );
}
