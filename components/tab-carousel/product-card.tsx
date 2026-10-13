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
  price?: Price | string;
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
  aspectRatio = '1:1',
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
    <article className={clsx('group flex w-full flex-col font-sans select-none', className)}>
      {/* Product Image Container */}
      <Link className="relative block w-full overflow-hidden focus:outline-none" href={href}>
        <div
          className={clsx(
            'relative w-full overflow-hidden bg-white transition-colors',
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              src={image.src}
              unoptimized={image.src.startsWith('http')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-neutral-400">
              {title}
            </div>
          )}

          {/* Badges on top-left of image matching reference design */}
          <div className="absolute left-0 top-0 z-10 flex flex-wrap gap-1">
            {badge != null && badge !== '' && (
              <span className="rounded-none bg-black px-1.5 py-0.5 text-[9px] font-normal tracking-wide text-white uppercase">
                {badge}
              </span>
            )}
            {secondaryBadge != null && secondaryBadge !== '' && (
              <span className="rounded-none bg-[#8e8e8e] px-1.5 py-0.5 text-[9px] font-normal tracking-wide text-white uppercase">
                {secondaryBadge}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Product Details matching reference typography */}
      <div className="mt-2.5 flex flex-col text-left">
        {/* Number Badge: No. 01, No. 02... */}
        {showNumber && numberIndex != null && (
          <span className="font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[10px] font-normal tracking-[0.04em] text-neutral-800 sm:text-[11px]">
            {formatNumberBadge(numberIndex)}
          </span>
        )}

        {/* Brand Name */}
        {subtitle != null && subtitle !== '' && (
          <span className="mt-0.5 truncate font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[9px] font-normal tracking-wider text-[#9e9e9e] uppercase sm:text-[10px]">
            {subtitle}
          </span>
        )}

        {/* Product Title: Refined regular weight */}
        <Link
          className="mt-1 line-clamp-2 font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[11px] font-normal leading-[1.35] text-neutral-900 transition-colors group-hover:text-neutral-600 sm:text-xs"
          href={href}
          title={title}
        >
          {title}
        </Link>

        {/* Price */}
        {price != null && (
          <div className="mt-1 font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[11px] font-normal text-neutral-900 sm:text-xs">
            {typeof price === 'string' ? price : <PriceLabel price={price} />}
          </div>
        )}

        {/* Stock / Availability */}
        {(!isInStock || (inventoryMessage != null && inventoryMessage !== '')) && (
          <span className="mt-0.5 font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[10px] font-normal text-[#9e9e9e]">
            {inventoryMessage ?? (!isInStock ? 'Out of stock' : '')}
          </span>
        )}
      </div>
    </article>
  );
}

export function TabCarouselProductCardSkeleton({
  aspectRatio = '1:1',
  showNumber = false,
}: {
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showNumber?: boolean;
}) {
  return (
    <div className="flex w-full animate-pulse flex-col space-y-2">
      <div
        className={clsx(
          'w-full bg-neutral-100',
          {
            '1:1': 'aspect-square',
            '5:6': 'aspect-[5/6]',
            '3:4': 'aspect-[3/4]',
          }[aspectRatio],
        )}
      />
      {showNumber && <div className="h-3 w-12 rounded bg-neutral-100" />}
      <div className="h-3 w-16 rounded bg-neutral-100" />
      <div className="h-3.5 w-full rounded bg-neutral-100" />
      <div className="h-3 w-14 rounded bg-neutral-100" />
    </div>
  );
}
