'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface SlideItem {
  id?: string | number;
  image: {
    src: string;
    alt: string;
    blurDataUrl?: string;
  };
  link?: string;
  tag?: string; // e.g. "ELLE EDITOR'S PICK"
  title?: string;
  subtitle?: string;
  openInNewTab?: boolean;
}

interface PeekSlideshowProps {
  slides: SlideItem[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  showPlayPause?: boolean;
  slideWidthPercent?: number;
  aspectRatio?: 'auto' | '16/9' | '21/9' | '4/3';
}

export function PeekSlideshow({
  slides,
  autoplay = true,
  interval = 5000,
  className,
  showArrows = true,
  showDots = true,
  showPlayPause = false,
  slideWidthPercent = 78,
  aspectRatio = '21/9',
}: PeekSlideshowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      containScroll: false,
    },
    autoplay ? [Autoplay({ delay: interval, stopOnInteraction: false })] : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedSnap());
  }, []);

  const onInit = useCallback((api: EmblaCarouselType) => {
    setScrollSnaps(api.snapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on('reinit', onInit).on('reinit', onSelect).on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.goToPrev();
    const autoplayPlugin = emblaApi.plugins().autoplay;
    if (autoplayPlugin) autoplayPlugin.reset();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.goToNext();
    const autoplayPlugin = emblaApi.plugins().autoplay;
    if (autoplayPlugin) autoplayPlugin.reset();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.goTo(index);
      const autoplayPlugin = emblaApi.plugins().autoplay;
      if (autoplayPlugin) autoplayPlugin.reset();
    },
    [emblaApi],
  );

  const toggleAutoplay = useCallback(() => {
    const autoplayPlugin = emblaApi?.plugins().autoplay;
    if (!autoplayPlugin) return;

    if (autoplayPlugin.isPlaying()) {
      autoplayPlugin.stop();
      setIsPlaying(false);
    } else {
      autoplayPlugin.play();
      setIsPlaying(true);
    }
  }, [emblaApi]);

  if (!slides || slides.length === 0) return null;

  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '4/3'
        ? 'aspect-[4/3]'
        : 'aspect-[16/10] md:aspect-[21/9] lg:aspect-[2.4/1]';

  return (
    <section className={clsx('relative w-full overflow-hidden select-none', className)}>
      {/* Slider Viewport */}
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            const content = (
              <div
                className={clsx(
                  'relative w-full overflow-hidden bg-neutral-100 transition-opacity duration-300',
                  aspectClass,
                  isActive ? 'opacity-100' : 'opacity-70 hover:opacity-95',
                )}
              >
                {/* Slide Background Image */}
                {slide.image?.src && (
                  <Image
                    alt={slide.image.alt || slide.title || `Slide ${index + 1}`}
                    blurDataURL={slide.image.blurDataUrl}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                    fill
                    placeholder={slide.image.blurDataUrl ? 'blur' : 'empty'}
                    priority={index === 0}
                    sizes="(max-width: 768px) 95vw, 80vw"
                    src={slide.image.src}
                  />
                )}

                {/* Left Vertical Badge / Tag (e.g. "ELLE EDITOR'S PICK") */}
                {slide.tag && (
                  <div className="absolute left-0 top-0 bottom-0 z-10 hidden sm:flex items-center">
                    <span className="[writing-mode:vertical-rl] rotate-180 bg-neutral-900/60 px-2 py-4 text-[10px] tracking-[0.25em] font-medium text-white uppercase backdrop-blur-xs">
                      {slide.tag}
                    </span>
                  </div>
                )}

                {/* Bottom Overlay Info (Title, Subtitle, and Inside Pagination) */}
                {(slide.title || slide.subtitle || showDots) && (
                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-12 text-center text-white sm:pb-6">
                    {slide.title && (
                      <h2 className="text-sm font-semibold tracking-wide sm:text-base md:text-lg lg:text-xl drop-shadow-md max-w-2xl">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="mt-1 text-xs sm:text-sm text-neutral-200/90 font-light max-w-xl line-clamp-2">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Pagination Dots INSIDE image bottom (exact ELLE style) */}
                    {showDots && scrollSnaps.length > 1 && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        {scrollSnaps.map((_, dotIndex) => (
                          <button
                            aria-label={`Go to slide ${dotIndex + 1}`}
                            className={clsx(
                              'h-1.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer',
                              dotIndex === selectedIndex
                                ? 'w-5 bg-white shadow-sm'
                                : 'w-1.5 bg-white/40 hover:bg-white/70',
                            )}
                            key={dotIndex}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              scrollTo(dotIndex);
                            }}
                            type="button"
                          />
                        ))}

                        {showPlayPause && (
                          <button
                            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                            className="ml-2 text-white/80 hover:text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleAutoplay();
                            }}
                            type="button"
                          >
                            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );

            return (
              <div
                className="min-w-0 shrink-0 grow-0 px-1 sm:px-2 md:px-2.5"
                key={slide.id || index}
                style={{ flex: `0 0 ${slideWidthPercent}%` }}
              >
                {slide.link ? (
                  <Link
                    className="block group cursor-pointer focus:outline-none h-full"
                    href={slide.link}
                    target={slide.openInNewTab ? '_blank' : undefined}
                    rel={slide.openInNewTab ? 'noopener noreferrer' : undefined}
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows (ELLE SHOP Style: Dark rectangular box at viewport center edge) */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-7 sm:h-12 sm:w-8 md:h-14 md:w-9 items-center justify-center bg-black/60 hover:bg-black/85 text-white transition-all shadow-md focus:outline-none"
            onClick={scrollPrev}
            type="button"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.75]" />
          </button>
          <button
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-7 sm:h-12 sm:w-8 md:h-14 md:w-9 items-center justify-center bg-black/60 hover:bg-black/85 text-white transition-all shadow-md focus:outline-none"
            onClick={scrollNext}
            type="button"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.75]" />
          </button>
        </>
      )}
    </section>
  );
}
