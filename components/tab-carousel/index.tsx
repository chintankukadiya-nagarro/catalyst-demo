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
  hideOverflow?: boolean;
  className?: string;
}

const DEFAULT_SAMPLE_CATEGORIES: TabCarouselCategoryItem[] = [
  { id: 'wear', label: 'Wear' },
  { id: 'bags', label: 'Bags and Wallets' },
  { id: 'shoes', label: 'shoes' },
  { id: 'fashion-acc', label: 'Fashion accessories' },
  { id: 'accessories', label: 'accessories' },
  { id: 'lingerie', label: 'lingerie' },
  { id: 'sports', label: 'Sports' },
];

const DEFAULT_SAMPLE_PRODUCTS: TabCarouselProduct[] = [
  {
    id: '1',
    title: 'ASIEL-XA Suede Lace-Up Sneakers',
    href: '/shop-all',
    subtitle: 'STEVE MADDEN',
    badge: 'Back in stock',
    price: '¥19,800',
    image: {
      src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
      alt: 'STEVE MADDEN ASIEL-XA Suede Lace-Up Sneakers burgundy',
    },
  },
  {
    id: '2',
    title: 'ASIEL-XA Suede Lace-Up Sneakers',
    href: '/shop-all',
    subtitle: 'STEVE MADDEN',
    badge: 'Back in stock',
    price: '¥19,800',
    image: {
      src: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
      alt: 'STEVE MADDEN ASIEL-XA Suede Lace-Up Sneakers tan',
    },
  },
  {
    id: '3',
    title: '[Pre-order] Popcorn Tissue Case',
    href: '/shop-all',
    subtitle: 'LUDLOW',
    badge: 'New Arrivals',
    secondaryBadge: 'reservation',
    price: '¥14,300',
    image: {
      src: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
      alt: 'LUDLOW Popcorn Tissue Case',
    },
  },
  {
    id: '4',
    title: '[Pre-order] [ELLE SHOP Exclusive] Quilted Bag',
    href: '/shop-all',
    subtitle: 'Uhr',
    badge: 'reservation',
    price: '¥8,800',
    image: {
      src: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
      alt: 'Uhr Quilted Bag',
    },
  },
  {
    id: '5',
    title: 'balle brooch',
    href: '/shop-all',
    subtitle: 'mina perhonen',
    badge: 'New Arrivals',
    price: '¥4,400',
    image: {
      src: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
      alt: 'mina perhonen balle brooch',
    },
  },
  {
    id: '6',
    title: '[Pre-order] College Logo Sweatshirt',
    href: '/shop-all',
    subtitle: 'THIRD MAGAZINE',
    badge: 'Back in stock',
    secondaryBadge: 'reservation',
    price: '¥29,700',
    isInStock: false,
    inventoryMessage: 'Out of stock',
    image: {
      src: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      alt: 'THIRD MAGAZINE College Logo Sweatshirt',
    },
  },
];

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
  const displayCategories = categories.length > 0 ? categories : DEFAULT_SAMPLE_CATEGORIES;
  const displayProducts = products.length > 0 ? products : DEFAULT_SAMPLE_PRODUCTS;

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
      {/* Header Container: Title, Subtitle, and Top-Right Chevron Navigation */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[max(2rem,calc((100vw-1280px)/2+2rem))]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:Didot,'Bodoni_MT','Bodoni_72','Playfair_Display',var(--font-family-dm-serif-text),Georgia,serif] text-4xl leading-tight tracking-[-0.03em] text-neutral-900 italic sm:text-5xl lg:text-[54px]">
              {title}
            </h2>
            {subtitle != null && subtitle !== '' && (
              <p className="mt-1 font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-xs font-normal tracking-wide text-neutral-500 uppercase">
                {subtitle}
              </p>
            )}
          </div>

          {/* Minimalist Top-Right Chevron Navigation matching screenshot */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              aria-label="Previous products"
              className={clsx(
                'flex items-center justify-center text-neutral-700 transition-colors hover:text-black focus:outline-none cursor-pointer',
                !canScrollPrev && 'cursor-not-allowed opacity-25',
              )}
              disabled={!canScrollPrev}
              onClick={scrollPrev}
              type="button"
            >
              <ChevronLeft className="h-4 w-4 stroke-[1.25] sm:h-5 sm:w-5" />
            </button>
            <button
              aria-label="Next products"
              className={clsx(
                'flex items-center justify-center text-neutral-700 transition-colors hover:text-black focus:outline-none cursor-pointer',
                !canScrollNext && 'cursor-not-allowed opacity-25',
              )}
              disabled={!canScrollNext}
              onClick={scrollNext}
              type="button"
            >
              <ChevronRight className="h-4 w-4 stroke-[1.25] sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills: Oval outline for active ALL, light for inactive */}
        {(displayCategories.length > 0 || (allTabLabel != null && allTabLabel !== '')) && (
          <div className="no-scrollbar mt-3 mb-7 flex items-center gap-2 overflow-x-auto pb-1 sm:mt-4 sm:mb-9">
            {allTabLabel != null && allTabLabel !== '' && (
              <button
                className={clsx(
                  'whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-normal tracking-wide transition-all duration-200 cursor-pointer',
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

            {displayCategories.map((cat) => {
              const isActive = activeCategoryId === cat.id;

              return (
                <button
                  className={clsx(
                    'whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-normal tracking-wide transition-all duration-200 cursor-pointer',
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

      {/* Carousel Track: Left aligns with container, right bleeds to edge */}
      <div className="w-full pl-4 sm:pl-6 md:pl-8 lg:pl-10 xl:pl-[max(2rem,calc((100vw-1280px)/2+2rem))]">
        <div className="cursor-grab overflow-hidden active:cursor-grabbing" ref={emblaRef}>
          <div className="-ml-3 flex sm:-ml-4 lg:-ml-5 pr-4 sm:pr-6 lg:pr-10">
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
              : displayProducts.map((product, index) => (
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
