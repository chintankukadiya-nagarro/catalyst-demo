'use client';

import { clsx } from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';

import {
  TabCarouselProduct,
  TabCarouselProductCard,
  TabCarouselProductCardSkeleton,
} from './product-card';

export type { TabCarouselProduct };

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
  hideOverflow?: boolean;
  className?: string;
}

export const TabCarousel = forwardRef<HTMLElement, TabCarouselProps>(function TabCarouselComponent(
  {
    title = 'Ranking',
    subtitle,
    allTabLabel = 'ALL',
    categories = [],
    activeCategoryId = 'all',
    onCategoryChange,
    products = [],
    isLoading = false,
    showNumbers = true,
    aspectRatio = '1:1',
    hideOverflow = true,
    className,
  },
  ref,
) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    loop: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canGoToPrev());
    setCanScrollNext(emblaApi.canGoToNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollButtons();
    emblaApi.on('select', updateScrollButtons);
    emblaApi.on('reinit', updateScrollButtons);

    return () => {
      emblaApi.off('select', updateScrollButtons);
      emblaApi.off('reinit', updateScrollButtons);
    };
  }, [emblaApi, updateScrollButtons]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.goToPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.goToNext();
  }, [emblaApi]);

  return (
    <section
      className={clsx(
        'w-full bg-white py-12 sm:py-16 md:py-20',
        hideOverflow && 'overflow-hidden',
        className,
      )}
      ref={ref}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[max(2rem,calc((100vw-1280px)/2+2rem))]">
        <h2 className="font-[family-name:Didot,'Bodoni_MT','Bodoni_72','Playfair_Display',var(--font-family-dm-serif-text),Georgia,serif] text-4xl italic leading-tight tracking-[-0.03em] text-neutral-900 sm:text-5xl lg:text-[54px]">
          {title}
        </h2>
        {subtitle != null && subtitle !== '' && (
          <p className="mt-1 font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-xs font-normal uppercase tracking-wide text-neutral-500">
            {subtitle}
          </p>
        )}

        {/* Category Filter Pills: Oval outline for active ALL, light for inactive */}
        {(categories.length > 0 || allTabLabel !== '') && (
          <div className="no-scrollbar mb-7 mt-3 flex items-center gap-2 overflow-x-auto pb-1 sm:mb-9 sm:mt-4">
            {allTabLabel !== '' && (
              <button
                className={clsx(
                  'cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-normal tracking-wide transition-all duration-200',
                  activeCategoryId === 'all'
                    ? 'border border-neutral-900 bg-white text-neutral-900 shadow-none'
                    : 'border border-neutral-200/90 bg-white text-neutral-400 hover:border-neutral-400 hover:text-neutral-900',
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
                    'cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-normal tracking-wide transition-all duration-200',
                    isActive
                      ? 'border border-neutral-900 bg-white text-neutral-900 shadow-none'
                      : 'border border-neutral-200/90 bg-white text-neutral-400 hover:border-neutral-400 hover:text-neutral-900',
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
      </div>

      <div className="relative w-full pl-4 sm:pl-6 md:pl-8 lg:pl-10 xl:pl-[max(2rem,calc((100vw-1280px)/2+2rem))]">
        <button
          aria-label="Previous products"
          className={clsx(
            'absolute left-1 top-[82px] z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center text-neutral-800 transition-opacity duration-300 hover:text-black focus:outline-none sm:left-3 sm:top-[92px] md:top-[100px] lg:left-4 lg:top-[105px] xl:left-[max(0.5rem,calc((100vw-1280px)/2+0.5rem))] xl:top-[110px]',
            '[filter:drop-shadow(0_1px_3px_rgba(255,255,255,0.9))_drop-shadow(0_1px_2px_rgba(0,0,0,0.4))]',
            canScrollPrev ? 'opacity-80 hover:opacity-100' : 'pointer-events-none opacity-0',
          )}
          disabled={!canScrollPrev}
          onClick={scrollPrev}
          type="button"
        >
          <ChevronLeft className="h-8 w-8 stroke-[1.25] sm:h-9 sm:w-9" />
        </button>
        <button
          aria-label="Next products"
          className={clsx(
            'absolute right-2 top-[82px] z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center text-neutral-800 transition-opacity duration-300 hover:text-black focus:outline-none sm:right-4 sm:top-[92px] md:top-[100px] lg:right-6 lg:top-[105px] xl:top-[110px]',
            '[filter:drop-shadow(0_1px_3px_rgba(255,255,255,0.9))_drop-shadow(0_1px_2px_rgba(0,0,0,0.4))]',
            canScrollNext ? 'opacity-80 hover:opacity-100' : 'pointer-events-none opacity-0',
          )}
          disabled={!canScrollNext}
          onClick={scrollNext}
          type="button"
        >
          <ChevronRight className="h-8 w-8 stroke-[1.25] sm:h-9 sm:w-9" />
        </button>
        <div className="cursor-grab overflow-hidden active:cursor-grabbing" ref={emblaRef}>
          <div className="-ml-3 flex pr-4 sm:-ml-4 sm:pr-6 lg:-ml-5 lg:pr-10">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    className="w-[165px] min-w-0 shrink-0 grow-0 pl-3 sm:w-[185px] sm:pl-4 md:w-[200px] lg:w-[210px] lg:pl-5 xl:w-[220px]"
                    key={index}
                  >
                    <TabCarouselProductCardSkeleton
                      aspectRatio={aspectRatio}
                      showNumber={showNumbers}
                    />
                  </div>
                ))
              : products.map((product, index) => (
                  <div
                    className="w-[165px] min-w-0 shrink-0 grow-0 pl-3 sm:w-[185px] sm:pl-4 md:w-[200px] lg:w-[210px] lg:pl-5 xl:w-[220px]"
                    key={product.id}
                  >
                    <TabCarouselProductCard
                      aspectRatio={aspectRatio}
                      numberIndex={index + 1}
                      product={product}
                      showNumber={showNumbers}
                    />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
});

TabCarousel.displayName = 'TabCarousel';
