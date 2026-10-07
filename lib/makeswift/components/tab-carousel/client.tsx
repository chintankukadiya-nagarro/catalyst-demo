'use client';

import { useFormatter, useLocale } from 'next-intl';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import {
  TabCarousel,
  TabCarouselCategoryItem,
  TabCarouselProduct,
} from '~/components/tab-carousel';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { BcProductSchema } from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

type ComboboxSelection =
  string | { value?: unknown; label?: string; id?: unknown; path?: unknown } | null | undefined;

export interface MakeswiftTabConfig {
  label?: string;
  category?: ComboboxSelection;
  skus?: string;
}

export interface MSTabCarouselProps {
  className?: string;
  title?: string;
  subtitle?: string;
  showAllTab?: boolean;
  allTabLabel?: string;
  tabs?: MakeswiftTabConfig[];
  limit?: number;
  sort?:
    'BEST_SELLING' | 'NEWEST' | 'FEATURED' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'BEST_REVIEWED';
  showNumbers?: boolean;
  aspectRatio?: '5:6' | '3:4' | '1:1';
}

interface ResolvedTab extends TabCarouselCategoryItem {
  categoryEntityId?: string;
  skus: string[];
}

function parseCombobox(selection: ComboboxSelection): { entityId?: string; label?: string } {
  if (selection == null) {
    return {};
  }

  if (typeof selection === 'string') {
    const trimmed = selection.trim();

    if (/^\d+$/.test(trimmed)) {
      return { entityId: trimmed };
    }

    return { label: trimmed };
  }

  const rawValue = selection.value ?? selection.id;
  const label = typeof selection.label === 'string' ? selection.label : undefined;

  if (typeof rawValue === 'number') {
    return { entityId: String(rawValue), label };
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();

    if (/^\d+$/.test(trimmed)) {
      return { entityId: trimmed, label };
    }
  }

  return { label };
}

function parseSkus(skusString?: string): string[] {
  if (!skusString) {
    return [];
  }

  return skusString
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const TabCarouselApiProductSchema = BcProductSchema.extend({
  inventory: z
    .object({
      isInStock: z.boolean().optional(),
      hasVariantInventory: z.boolean().optional(),
    })
    .nullable()
    .optional(),
});

type TabCarouselApiProduct = z.infer<typeof TabCarouselApiProductSchema>;

const ApiResponseSchema = z.object({
  status: z.string(),
  products: z.array(TabCarouselApiProductSchema),
});

const fetcher = async (url: string): Promise<TabCarouselApiProduct[]> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  const json: unknown = await res.json();
  const parsed = ApiResponseSchema.safeParse(json);

  return parsed.success ? parsed.data.products : [];
};

export const MSTabCarousel = forwardRef<HTMLElement, MSTabCarouselProps>(
  function MakeswiftTabCarousel(
    {
      className,
      title = 'Popular Products',
      subtitle,
      showAllTab = true,
      allTabLabel = 'ALL',
      tabs = [],
      limit = 10,
      sort = 'BEST_SELLING',
      showNumbers = false,
      aspectRatio = '5:6',
    },
    ref,
  ) {
    const locale = useLocale();
    const format = useFormatter();

    // Parse configured tabs into display items, entity IDs, and SKU lists
    const resolvedTabs: ResolvedTab[] = useMemo(() => {
      return tabs
        .map((tab, idx) => {
          const parsed = parseCombobox(tab.category);
          const entityId = parsed.entityId;
          const defaultLabel = parsed.label ? parsed.label.split('>').pop()?.trim() : undefined;
          const label = tab.label?.trim() || defaultLabel || `Tab ${idx + 1}`;
          const tabId = entityId ?? `tab-${idx}`;
          const skus = parseSkus(tab.skus);

          return {
            id: tabId,
            label,
            categoryEntityId: entityId,
            skus,
          };
        })
        .filter((tab) => tab.id !== '');
    }, [tabs]);

    // Initial active tab
    const [activeTabId, setActiveTabId] = useState<string>(
      showAllTab ? 'all' : (resolvedTabs[0]?.id ?? 'all'),
    );

    // Keep activeTabId in sync if showAllTab changes or active tab is removed
    useEffect(() => {
      if (!showAllTab && activeTabId === 'all' && resolvedTabs.length > 0) {
        const firstTab = resolvedTabs[0];

        if (firstTab) {
          setActiveTabId(firstTab.id);
        }
      }
    }, [showAllTab, activeTabId, resolvedTabs]);

    // Build API query URL based on active tab
    const apiUrl = useMemo(() => {
      const params = new URLSearchParams();

      params.append('limit', String(limit));
      params.append('sort', sort);
      params.append('locale', locale);

      if (activeTabId === 'all') {
        // Collect all category IDs across all tabs
        const allCategoryIds = resolvedTabs
          .map((tab) => tab.categoryEntityId)
          .filter((id): id is string => id != null && /^\d+$/.test(id));

        // Collect all SKUs across all tabs
        const allSkus = Array.from(new Set(resolvedTabs.flatMap((tab) => tab.skus)));

        if (allCategoryIds.length > 0) {
          params.append('categoryIds', allCategoryIds.join(','));
        }

        if (allSkus.length > 0) {
          params.append('skus', allSkus.join(','));
        }
      } else {
        const currentTab = resolvedTabs.find((tab) => tab.id === activeTabId);

        if (currentTab) {
          if (currentTab.categoryEntityId) {
            params.append('categoryId', currentTab.categoryEntityId);
          }

          if (currentTab.skus.length > 0) {
            params.append('skus', currentTab.skus.join(','));
          }
        }
      }

      return `/api/products/tab-carousel?${params.toString()}`;
    }, [activeTabId, resolvedTabs, limit, sort, locale]);

    const { data: rawProducts, isLoading } = useSWR(apiUrl, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    });

    // Map raw BigCommerce products to TabCarouselProduct items
    const products: TabCarouselProduct[] = useMemo(() => {
      if (!rawProducts) {
        return [];
      }

      return rawProducts.map((p) => {
        const isInStock = p.inventory?.isInStock ?? true;
        const price = pricesTransformer(p, format);

        return {
          id: p.entityId.toString(),
          title: p.name,
          href: p.path,
          image:
            p.defaultImage != null
              ? { src: p.defaultImage.url, alt: p.defaultImage.altText }
              : undefined,
          price,
          subtitle: p.brand?.name ?? undefined,
          isInStock,
          inventoryMessage: !isInStock ? 'Out of stock' : undefined,
        };
      });
    }, [rawProducts, format]);

    return (
      <TabCarousel
        activeCategoryId={activeTabId}
        allTabLabel={showAllTab ? allTabLabel : undefined}
        aspectRatio={aspectRatio}
        categories={resolvedTabs}
        className={className}
        isLoading={isLoading}
        onCategoryChange={setActiveTabId}
        products={products}
        ref={ref}
        showNumbers={showNumbers}
        subtitle={subtitle}
        title={title}
      />
    );
  },
);

MSTabCarousel.displayName = 'MSTabCarousel';
