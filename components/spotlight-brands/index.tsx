'use client';

import { clsx } from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface SpotlightBrandCard {
  id?: string;
  brandName: string;
  description?: string;
  href?: string;
  image?: {
    src: string;
    alt?: string;
  };
}

export interface SpotlightBrandsProps {
  className?: string;
  title?: string;
  subtitle?: string;
  viewMoreText?: string;
  viewMoreHref?: string;
  brands?: SpotlightBrandCard[];
}

const DEFAULT_SAMPLE_BRANDS: SpotlightBrandCard[] = [
  {
    id: '1',
    brandName: 'by 104 PARIS',
    description: 'Jewelry from "By Saint Soixante Quatre Paris" to add color to your everyday life.',
    href: '/brands',
    image: {
      src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      alt: 'by 104 PARIS jewelry editorial collage',
    },
  },
  {
    id: '2',
    brandName: 'LANVIN en Bleu',
    description: 'Special outerwear from "Lanvin en Bleu" x "Taiyon" has arrived!',
    href: '/brands',
    image: {
      src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      alt: 'LANVIN en Bleu outerwear collage',
    },
  },
  {
    id: '3',
    brandName: 'Martinique',
    description: "Start autumn with knitwear. Martinique's Fall/Winter 2026 Collection",
    href: '/brands',
    image: {
      src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      alt: 'Martinique autumn collection collage',
    },
  },
  {
    id: '4',
    brandName: 'allureville',
    description: 'Achieve a new "French style" with "Allureville" autumn collection',
    href: '/brands',
    image: {
      src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      alt: 'allureville French style collection',
    },
  },
  {
    id: '5',
    brandName: 'MOTHER',
    description: 'Find your must-have denim for this fall at "Mother"',
    href: '/brands',
    image: {
      src: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      alt: 'MOTHER denim collection collage',
    },
  },
  {
    id: '6',
    brandName: 'objcts.io',
    description: 'Make your smartphone much smarter with "Objects.io" smartphone shoulder bag',
    href: '/brands',
    image: {
      src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      alt: 'objcts.io shoulder bag collage',
    },
  },
];

function BrandCardImage({ brand }: { brand: SpotlightBrandCard }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-100">
      {brand.image?.src ? (
        <Image
          alt={brand.image.alt || brand.brandName}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 40vw, 25vw"
          src={brand.image.src}
          unoptimized={brand.image.src.startsWith('http')}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
          <span className="font-serif text-lg text-neutral-400 italic">{brand.brandName}</span>
        </div>
      )}
    </div>
  );
}

function SpotlightBrandCardItem({ brand }: { brand: SpotlightBrandCard }) {
  const content = (
    <div className="flex flex-col">
      {/* 1:1 Aspect ratio square container matching the reference design */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <BrandCardImage brand={brand} />
      </div>

      {/* Brand title: Muted gray, clean typography */}
      <div className="pt-2.5">
        <h3 className="truncate font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[10px] font-normal tracking-[0.04em] text-[#9e9e9e] uppercase transition-colors sm:text-[11px]">
          {brand.brandName}
        </h3>

        {/* Editorial description: 2-line clamped caption */}
        {brand.description ? (
          <p className="mt-1.5 line-clamp-2 font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[11px] font-normal leading-[1.4] text-neutral-900 transition-colors sm:text-xs">
            {brand.description}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (brand.href) {
    return (
      <Link className="group block w-full focus:outline-none" href={brand.href}>
        {content}
      </Link>
    );
  }

  return <div className="group block w-full">{content}</div>;
}

export const SpotlightBrands = forwardRef<HTMLElement, SpotlightBrandsProps>(
  function SpotlightBrandsSection(
    {
      className,
      title = 'Spotlight Picks',
      subtitle = 'Brands to watch right now',
      viewMoreText = 'VIEW MORE',
      viewMoreHref = '/brands',
      brands = [],
    },
    ref,
  ) {
    const displayBrands = brands.length > 0 ? brands : DEFAULT_SAMPLE_BRANDS;

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

    // Split title across two lines (e.g. "Spotlight" and "Picks") matching reference
    const titleParts = title.trim().split(/\s+/);
    const firstWord = titleParts[0] || 'Spotlight';
    const remainingWords = titleParts.slice(1).join(' ') || 'Picks';

    return (
      <section
        className={clsx('w-full overflow-hidden bg-white py-12 sm:py-16 lg:py-20', className)}
        ref={ref}
      >
        {/* Full-bleed layout:
            Left side aligns with the page's container grid:
            pl-4 sm:pl-6 md:pl-8 lg:pl-10 xl:pl-[max(2rem,calc((100vw-1280px)/2+2rem))]
            Right side has no constraint (pr-0) so carousel bleeds completely to the right edge */}
        <div className="w-full pl-4 sm:pl-6 md:pl-8 lg:pl-10 xl:pl-[max(2rem,calc((100vw-1280px)/2+2rem))]">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14 xl:gap-20">
            {/* Left Header Column */}
            <div className="flex shrink-0 flex-col items-start pr-4 sm:pr-6 lg:w-[280px] lg:pr-0 xl:w-[320px]">
              {/* High-fashion Editorial Serif Italic Title */}
              <h2 className="font-[family-name:Didot,'Bodoni_MT','Bodoni_72','Playfair_Display',var(--font-family-dm-serif-text),Georgia,serif] text-5xl leading-[0.88] tracking-[-0.03em] text-neutral-900 italic sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px]">
                <span className="block">{firstWord}</span>
                {remainingWords ? <span className="block">{remainingWords}</span> : null}
              </h2>

              {/* Subtitle */}
              {subtitle ? (
                <p className="mt-4 font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-xs font-normal tracking-[0.02em] text-neutral-900 sm:mt-5 sm:text-[13px]">
                  {subtitle}
                </p>
              ) : null}

              {/* VIEW MORE Button: Outline rectangle with luxury letter spacing */}
              {viewMoreText ? (
                <div className="mt-8 sm:mt-11">
                  <Link
                    className="inline-flex h-[46px] w-[172px] items-center justify-center rounded-none border border-neutral-900 bg-white text-center font-[family-name:var(--font-family-jost),var(--font-family-inter),sans-serif] text-[11px] font-medium tracking-[0.2em] text-neutral-900 uppercase transition-all duration-300 hover:bg-neutral-900 hover:text-white focus:outline-none"
                    href={viewMoreHref || '/brands'}
                  >
                    {viewMoreText}
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Right Carousel Column: Bleeds directly to right viewport edge */}
            <div className="relative min-w-0 flex-1 overflow-hidden">
              {/* Overlaid Navigation Arrows */}
              <button
                aria-label="Previous brands"
                className={clsx(
                  'absolute -left-2 top-[calc(50%-28px)] z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center text-neutral-800 transition-opacity duration-300 hover:text-black focus:outline-none sm:left-1 lg:left-2',
                  '[filter:drop-shadow(0_1px_3px_rgba(255,255,255,0.9))_drop-shadow(0_1px_2px_rgba(0,0,0,0.4))]',
                  canScrollPrev
                    ? 'opacity-80 hover:opacity-100'
                    : 'pointer-events-none opacity-0',
                )}
                disabled={!canScrollPrev}
                onClick={scrollPrev}
                type="button"
              >
                <ChevronLeft className="h-8 w-8 stroke-[1.25] sm:h-9 sm:w-9" />
              </button>

              <button
                aria-label="Next brands"
                className={clsx(
                  'absolute right-2 top-[calc(50%-28px)] z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center text-neutral-800 transition-opacity duration-300 hover:text-black focus:outline-none sm:right-4 lg:right-6',
                  '[filter:drop-shadow(0_1px_3px_rgba(255,255,255,0.9))_drop-shadow(0_1px_2px_rgba(0,0,0,0.4))]',
                  canScrollNext
                    ? 'opacity-80 hover:opacity-100'
                    : 'pointer-events-none opacity-0',
                )}
                disabled={!canScrollNext}
                onClick={scrollNext}
                type="button"
              >
                <ChevronRight className="h-8 w-8 stroke-[1.25] sm:h-9 sm:w-9" />
              </button>

              {/* Embla Viewport */}
              <div className="cursor-grab overflow-hidden active:cursor-grabbing" ref={emblaRef}>
                <div className="-ml-4 flex sm:-ml-5 lg:-ml-6 pr-4 sm:pr-6 lg:pr-10">
                  {displayBrands.map((brand, idx) => (
                    <div
                      className="w-[260px] min-w-0 shrink-0 grow-0 pl-4 sm:w-[290px] sm:pl-5 md:w-[310px] lg:w-[320px] lg:pl-6 xl:w-[340px]"
                      key={brand.id || `${brand.brandName}-${idx}`}
                    >
                      <SpotlightBrandCardItem brand={brand} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

SpotlightBrands.displayName = 'SpotlightBrands';
