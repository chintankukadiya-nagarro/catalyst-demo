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
  hideOverflow?: boolean;
}

interface ResolvedTab extends TabCarouselCategoryItem {
  categoryEntityId?: string;
  skus: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractNumericEntityId(value: unknown, depth = 0): string | undefined {
  if (depth > 3 || value == null) {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return String(Math.trunc(value));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d+$/.test(trimmed)) {
      return trimmed;
    }

    return undefined;
  }

  if (isRecord(value)) {
    return (
      extractNumericEntityId(value.value, depth + 1) ?? extractNumericEntityId(value.id, depth + 1)
    );
  }

  return undefined;
}

function parseCombobox(selection: ComboboxSelection): { entityId?: string; label?: string } {
  if (selection == null) {
    return {};
  }

  if (typeof selection === 'string') {
    const trimmed = selection.trim();
    const parsedId = extractNumericEntityId(trimmed);

    return parsedId ? { entityId: parsedId } : { label: trimmed };
  }

  const label = typeof selection.label === 'string' ? selection.label : undefined;
  const entityId = extractNumericEntityId(selection.value) ?? extractNumericEntityId(selection.id);

  return { entityId, label };
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

const GraphQLConnectionSchema = <T extends z.ZodTypeAny>(nodeSchema: T) =>
  z
    .object({
      edges: z
        .array(
          z.object({
            node: nodeSchema,
          }),
        )
        .nullable()
        .optional(),
    })
    .nullable()
    .optional();

const TabCarouselApiProductSchema = BcProductSchema.extend({
  brand: z
    .object({
      name: z.string(),
      path: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  inventory: z
    .object({
      isInStock: z.boolean().optional(),
      hasVariantInventory: z.boolean().optional(),
    })
    .nullable()
    .optional(),
  featuredPromotions: GraphQLConnectionSchema(
    z.object({
      entityId: z.number().optional(),
      text: z.string(),
    }),
  ),
  customFields: GraphQLConnectionSchema(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
});

type TabCarouselApiProduct = z.infer<typeof TabCarouselApiProductSchema>;

const ApiResponseSchema = z.object({
  status: z.string(),
  products: z.array(z.unknown()),
});

function parseTabCarouselProducts(json: unknown): TabCarouselApiProduct[] {
  const envelope = ApiResponseSchema.safeParse(json);

  if (!envelope.success) {
    // eslint-disable-next-line no-console
    console.error('Tab carousel API response failed schema', envelope.error);

    return [];
  }

  return envelope.data.products.flatMap((item, index) => {
    const parsed = TabCarouselApiProductSchema.safeParse(item);

    if (!parsed.success) {
      // eslint-disable-next-line no-console
      console.error(`Tab carousel product at index ${index} failed schema`, parsed.error);

      return [];
    }

    return [parsed.data];
  });
}

const fetcher = async (url: string): Promise<TabCarouselApiProduct[]> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  return parseTabCarouselProducts(await res.json());
};

function resolveCdnImageUrl(url: string): string {
  return url.replaceAll('{:size}', '500w');
}

function firstPromotionText(product: TabCarouselApiProduct): string | undefined {
  const text = product.featuredPromotions?.edges?.[0]?.node.text.trim();

  return text !== '' ? text : undefined;
}

function customFieldBadge(product: TabCarouselApiProduct): string | undefined {
  const match = product.customFields?.edges?.find((edge) => {
    const name = edge.node.name.trim().toLowerCase();

    return name === 'badge' || name === 'label';
  });
  const value = match?.node.value.trim();

  return value !== '' ? value : undefined;
}

export const MSTabCarousel = forwardRef<HTMLElement, MSTabCarouselProps>(
  function MakeswiftTabCarousel(
    {
      className,
      title = 'Ranking',
      subtitle,
      showAllTab = true,
      allTabLabel = 'ALL',
      tabs = [],
      limit = 10,
      sort = 'BEST_SELLING',
      showNumbers = true,
      aspectRatio = '5:6',
      hideOverflow = true,
    },
    ref,
  ) {
    const locale = useLocale();
    const format = useFormatter();

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

    const [activeTabId, setActiveTabId] = useState<string>(
      showAllTab ? 'all' : (resolvedTabs[0]?.id ?? 'all'),
    );

    useEffect(() => {
      if (!showAllTab && activeTabId === 'all' && resolvedTabs.length > 0) {
        const firstTab = resolvedTabs[0];

        if (firstTab) {
          setActiveTabId(firstTab.id);
        }
      }
    }, [showAllTab, activeTabId, resolvedTabs]);

    const apiUrl = useMemo(() => {
      const params = new URLSearchParams();

      params.append('limit', String(limit));
      params.append('sort', sort);
      params.append('locale', locale);

      if (activeTabId === 'all') {
        const allCategoryIds = resolvedTabs
          .map((tab) => tab.categoryEntityId)
          .filter((id): id is string => id != null && /^\d+$/.test(id));
        const allSkus = Array.from(new Set(resolvedTabs.flatMap((tab) => tab.skus)));

        if (allCategoryIds.length === 0 && allSkus.length === 0) {
          return null;
        }

        if (allCategoryIds.length > 0) {
          params.append('categoryIds', allCategoryIds.join(','));
        }

        if (allSkus.length > 0) {
          params.append('skus', allSkus.join(','));
        }
      } else {
        const currentTab = resolvedTabs.find((tab) => tab.id === activeTabId);

        if (
          currentTab == null ||
          (currentTab.categoryEntityId == null && currentTab.skus.length === 0)
        ) {
          return null;
        }

        if (currentTab.categoryEntityId) {
          params.append('categoryId', currentTab.categoryEntityId);
        }

        if (currentTab.skus.length > 0) {
          params.append('skus', currentTab.skus.join(','));
        }
      }

      return `/api/products/tab-carousel?${params.toString()}`;
    }, [activeTabId, resolvedTabs, limit, sort, locale]);

    const { data: rawProducts, isLoading } = useSWR(apiUrl, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    });

    const products: TabCarouselProduct[] = useMemo(() => {
      if (!rawProducts) {
        return [];
      }

      return rawProducts.map((p) => {
        const isInStock = p.inventory?.isInStock ?? true;
        const price = pricesTransformer(p, format);
        const badge = firstPromotionText(p);
        const secondaryBadge = customFieldBadge(p);

        return {
          id: p.entityId.toString(),
          title: p.name,
          href: p.path,
          image:
            p.defaultImage != null
              ? { src: resolveCdnImageUrl(p.defaultImage.url), alt: p.defaultImage.altText }
              : undefined,
          price,
          subtitle: p.brand?.name ?? undefined,
          badge,
          secondaryBadge: secondaryBadge !== badge ? secondaryBadge : undefined,
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
        hideOverflow={hideOverflow}
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
