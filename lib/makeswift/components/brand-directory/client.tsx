'use client';

import { useLocale } from 'next-intl';
import React, { forwardRef } from 'react';
import useSWR from 'swr';

import { BrandDirectory, BrandDirectoryItem, BrandDirectoryProps } from '~/components/brand-directory';

export interface MSBrandDirectoryProps {
  className?: string;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showAlphabetFilter?: boolean;
  showProductCount?: boolean;
}

interface BrandsApiResponse {
  status: 'success' | 'error';
  brands?: BrandDirectoryItem[];
  error?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const MSBrandDirectory = forwardRef<HTMLDivElement, MSBrandDirectoryProps>(
  (
    {
      className,
      title = 'BRAND LIST',
      subtitle = 'Discover designers and collections available in our catalog',
      showSearch = true,
      showAlphabetFilter = true,
      showProductCount = true,
    },
    ref,
  ) => {
    const locale = useLocale();

    const { data, isLoading } = useSWR<BrandsApiResponse>(
      `/api/brands?locale=${encodeURIComponent(locale)}`,
      fetcher,
      {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
      },
    );

    const brands = data?.brands ?? [];

    if (isLoading && brands.length === 0) {
      return (
        <div className={className} ref={ref}>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center animate-pulse">
              <div className="mx-auto h-8 w-48 rounded bg-gray-200" />
              <div className="mx-auto mt-3 h-4 w-72 rounded bg-gray-100" />
            </div>
            <div className="mx-auto mb-8 h-10 max-w-md rounded-full bg-gray-100 animate-pulse" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 animate-pulse">
              {Array.from({ length: 12 }).map((_, i) => (
                <div className="h-10 rounded border border-gray-100 bg-gray-50" key={i} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <BrandDirectory
        brands={brands}
        className={className}
        ref={ref}
        showAlphabetFilter={showAlphabetFilter}
        showProductCount={showProductCount}
        showSearch={showSearch}
        subtitle={subtitle}
        title={title}
      />
    );
  },
);

MSBrandDirectory.displayName = 'MSBrandDirectory';
