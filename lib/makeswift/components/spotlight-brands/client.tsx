'use client';

import { useLocale } from 'next-intl';
import React, { forwardRef, useMemo } from 'react';
import useSWR from 'swr';

import { SpotlightBrandCard, SpotlightBrands } from '~/components/spotlight-brands';

export interface MakeswiftSpotlightBrandItem {
  brandName?: string;
  brandSelection?:
    | string
    | { value?: unknown; label?: string; id?: unknown; path?: unknown; name?: unknown }
    | null;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

export interface MSSpotlightBrandsProps {
  className?: string;
  title?: string;
  subtitle?: string;
  viewMoreText?: string;
  viewMoreLink?: { href?: string; target?: string };
  brands?: MakeswiftSpotlightBrandItem[];
}

interface BrandApiItem {
  entityId: number;
  name: string;
  path: string;
}

interface BrandsApiResponse {
  status: 'success' | 'error';
  brands?: BrandApiItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function parseBrandSelection(
  selection: MakeswiftSpotlightBrandItem['brandSelection'],
): { entityId?: string; path?: string; name?: string } {
  if (!selection) return {};

  if (typeof selection === 'string') {
    const trimmed = selection.trim();

    if (/^\d+$/.test(trimmed)) {
      return { entityId: trimmed };
    }

    if (trimmed.startsWith('/') || trimmed.includes('/')) {
      return { path: trimmed };
    }

    return { name: trimmed };
  }

  if (typeof selection === 'object') {
    const path = typeof selection.path === 'string' ? selection.path : undefined;
    const name =
      typeof selection.name === 'string'
        ? selection.name
        : typeof selection.label === 'string'
          ? selection.label.replace(/\s\(\d+\)$/, '')
          : undefined;

    const rawVal = selection.value ?? selection.id;
    const entityId = rawVal != null ? String(rawVal) : undefined;

    return { entityId, path, name };
  }

  return {};
}

export const MSSpotlightBrands = forwardRef<HTMLElement, MSSpotlightBrandsProps>(
  function MakeswiftSpotlightBrands(
    {
      className,
      title = 'Spotlight Picks',
      subtitle = 'Brands to watch right now',
      viewMoreText = 'VIEW MORE',
      viewMoreLink,
      brands = [],
    },
    ref,
  ) {
    const locale = useLocale();

    // Fetch brands list to resolve entityIds to live storefront paths
    const { data: brandsData } = useSWR<BrandsApiResponse>(
      brands.length > 0 ? `/api/brands?locale=${encodeURIComponent(locale)}` : null,
      fetcher,
      {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
      },
    );

    const brandsById = useMemo(() => {
      const map = new Map<string, BrandApiItem>();

      if (brandsData?.brands) {
        for (const b of brandsData.brands) {
          map.set(String(b.entityId), b);
        }
      }

      return map;
    }, [brandsData]);

    const mappedBrands: SpotlightBrandCard[] = useMemo(() => {
      if (!brands || brands.length === 0) {
        return [];
      }

      return brands.map((item, index) => {
        const parsed = parseBrandSelection(item.brandSelection);
        const resolvedFromApi = parsed.entityId ? brandsById.get(parsed.entityId) : undefined;

        const brandName =
          item.brandName?.trim() ||
          resolvedFromApi?.name ||
          parsed.name ||
          `Brand ${index + 1}`;

        let href = item.link?.href?.trim();

        if (!href || href === '#') {
          if (resolvedFromApi?.path) {
            href = resolvedFromApi.path;
          } else if (parsed.path) {
            href = parsed.path.startsWith('/') ? parsed.path : `/${parsed.path}`;
          } else if (parsed.entityId) {
            href = `/brands/${parsed.entityId}`;
          }
        }

        const image = item.imageSrc
          ? {
              src: item.imageSrc,
              alt: item.imageAlt || brandName,
            }
          : undefined;

        return {
          id: String(index),
          brandName,
          description: item.description,
          href,
          image,
        };
      });
    }, [brands, brandsById]);

    return (
      <SpotlightBrands
        brands={mappedBrands}
        className={className}
        ref={ref}
        subtitle={subtitle}
        title={title}
        viewMoreHref={viewMoreLink?.href || '/brands'}
        viewMoreText={viewMoreText}
      />
    );
  },
);

MSSpotlightBrands.displayName = 'MSSpotlightBrands';
