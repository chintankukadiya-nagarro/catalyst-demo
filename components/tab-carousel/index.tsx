'use client';

import { clsx } from 'clsx';
import React, { forwardRef } from 'react';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
} from '@/vibes/soul/primitives/carousel';

import {
  TabCarouselProduct,
  TabCarouselProductCard,
  TabCarouselProductCardSkeleton,
} from './product-card';

export type { TabCarouselProduct } from './product-card';

export interface TabCarouselCategoryItem {
  id: string;
  label: string;
}

export interface TabCarouselProps {
  title?: string;
  subtitle?: string;
  allTabLabel?: string;
  categories?: TabCarouselCategoryItem[];
  activeCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  products?: TabCarouselProduct[];
  isLoading?: boolean;
  showNumbers?: boolean;
  aspectRatio?: '5:6' | '3:4' | '1:1';
  className?: string;
}

export const TabCarousel = forwardRef<HTMLElement, TabCarouselProps>(function TabCarouselComponent(
  {
    title = 'Popular Products',
    subtitle,
    allTabLabel = 'ALL',
    categories = [],
    activeCategoryId = 'all',
    onCategoryChange,
    products = [],
    isLoading = false,
    showNumbers = false,
    aspectRatio = '5:6',
    className,
  },
  ref,
) {
  const renderSlides = () => {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <CarouselItem
          className="basis-[46%] pl-4 @2xl:pl-5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
          key={index}
        >
          <TabCarouselProductCardSkeleton aspectRatio={aspectRatio} showNumber={showNumbers} />
        </CarouselItem>
      ));
    }

    if (products.length === 0) {
      return (
        <div className="w-full py-12 pl-4 text-center text-sm text-neutral-500">
          No products found in this category.
        </div>
      );
    }

    return products.map((product, index) => (
      <CarouselItem
        className="basis-[46%] pl-4 @2xl:pl-5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
        key={product.id}
      >
        <TabCarouselProductCard
          aspectRatio={aspectRatio}
          numberIndex={index + 1}
          product={product}
          showNumber={showNumbers}
        />
      </CarouselItem>
    ));
  };

  return (
    <section
      className={clsx('mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8', className)}
      ref={ref}
    >
      <Carousel hideOverflow={false} opts={{ align: 'start', dragFree: true }}>
        {/* Header Row: Title & Prev/Next Arrows */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-family-dm-serif-text,serif)] text-3xl font-normal italic tracking-tight text-neutral-900 md:text-4xl">
              {title}
            </h2>
            {subtitle != null && subtitle !== '' && (
              <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">{subtitle}</p>
            )}
          </div>

          {/* Navigation Arrows using CarouselButtons */}
          <CarouselButtons
            className="[&_button]:h-8 [&_button]:w-8 [&_button]:p-0"
            colorScheme="light"
          />
        </div>

        {/* Category Pills Filter Bar */}
        {(categories.length > 0 || allTabLabel !== '') && (
          <div className="no-scrollbar mb-6 flex items-center gap-2 overflow-x-auto pb-2 pt-1">
            {allTabLabel !== '' && (
              <button
                className={clsx(
                  'whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wider transition-all duration-200',
                  activeCategoryId === 'all'
                    ? 'border-neutral-900 bg-neutral-900 font-medium text-white shadow-sm'
                    : 'border-neutral-300 bg-white font-normal text-neutral-700 hover:border-neutral-900 hover:text-neutral-900',
                )}
                onClick={() => onCategoryChange?.('all')}
                type="button"
              >
                {allTabLabel}
              </button>
            )}

            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id;

              return (
                <button
                  className={clsx(
                    'whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wider transition-all duration-200',
                    isActive
                      ? 'border-neutral-900 bg-neutral-900 font-medium text-white shadow-sm'
                      : 'border-neutral-300 bg-white font-normal text-neutral-700 hover:border-neutral-900 hover:text-neutral-900',
                  )}
                  key={cat.id}
                  onClick={() => onCategoryChange?.(cat.id)}
                  type="button"
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Carousel Slider */}
        <CarouselContent className="-ml-4 flex touch-pan-y @2xl:-ml-5" key={activeCategoryId}>
          {renderSlides()}
        </CarouselContent>
      </Carousel>
    </section>
  );
});
TabCarousel.displayName = 'TabCarousel';
