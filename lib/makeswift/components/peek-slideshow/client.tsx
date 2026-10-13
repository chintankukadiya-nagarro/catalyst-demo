import { PeekSlideshow, SlideItem } from '@/vibes/soul/sections/peek-slideshow';

interface MSSlide {
  imageSrc?: string;
  imageAlt?: string;
  imageLink?: { href?: string; target?: string };
  tag?: string;
  title?: string;
  subtitle?: string;
}

interface MSPeekSlideshowProps {
  className?: string;
  slides: MSSlide[];
  autoplay: boolean;
  interval: number;
  slideWidthPercent: number;
  aspectRatio: '21/9' | '16/9' | '4/3';
  showArrows: boolean;
  showDots: boolean;
}

export function MSPeekSlideshow({
  className,
  slides = [],
  autoplay = true,
  interval = 5,
  slideWidthPercent = 78,
  aspectRatio = '21/9',
  showArrows = true,
  showDots = true,
}: MSPeekSlideshowProps) {
  const formattedSlides: SlideItem[] = slides
    .filter((slide) => Boolean(slide.imageSrc))
    .map((slide, idx) => ({
      id: idx,
      image: {
        src: slide.imageSrc!,
        alt: slide.imageAlt || slide.title || `Slide ${idx + 1}`,
      },
      link: slide.imageLink?.href,
      openInNewTab: slide.imageLink?.target === '_blank',
      tag: slide.tag,
      title: slide.title,
      subtitle: slide.subtitle,
    }));

  return (
    <PeekSlideshow
      aspectRatio={aspectRatio}
      autoplay={autoplay}
      className={className}
      interval={interval * 1000}
      showArrows={showArrows}
      showDots={showDots}
      slideWidthPercent={slideWidthPercent}
      slides={formattedSlides}
    />
  );
}
