'use client';

import { ChevronRight } from 'lucide-react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { type EditorialMenuOverlayFeatured } from './types';

export function EditorialMenuFeaturedBlock({
  featured,
  linked = false,
  onNavigate,
}: {
  featured: EditorialMenuOverlayFeatured;
  linked?: boolean;
  onNavigate?: () => void;
}) {
  const caption = featured.caption?.trim();
  const hasImage = Boolean(featured.imageSrc?.trim());

  const content = (
    <div className="w-[262px] max-w-full">
      {hasImage ? (
        <div className="relative aspect-[262/328] w-full overflow-hidden bg-neutral-200/80">
          <Image
            alt={featured.imageAlt || caption || ''}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            fill
            sizes="262px"
            src={featured.imageSrc ?? ''}
            unoptimized
          />
        </div>
      ) : null}
      {caption ? (
        <div className="mt-3.5 flex items-start gap-5">
          <p className="min-w-0 flex-1 whitespace-pre-line text-[13px] font-semibold leading-[1.45] text-[#262626]">
            {caption}
          </p>
          {linked ? (
            <ChevronRight
              aria-hidden
              className="mt-0.5 shrink-0 text-[var(--nav-link-text,hsl(var(--foreground)))]"
              size={18}
              strokeWidth={1.5}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (linked && featured.href != null && featured.href !== '') {
    return (
      <Link className="group block" href={featured.href} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return content;
}
