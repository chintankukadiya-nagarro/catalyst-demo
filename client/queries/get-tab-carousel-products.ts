import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { getCategoryDescendantIds } from './get-category-tree';
import { getBestSellingProducts, getFeaturedProducts, getNewestProducts } from './get-products';

const GetTabCarouselProductsQuery = graphql(
  `
    query GetTabCarouselProductsQuery(
      $first: Int
      $filters: SearchProductsFiltersInput!
      $sort: SearchProductsSortInput
      $currencyCode: currencyCode
    ) {
      site {
        search {
          searchProducts(filters: $filters, sort: $sort) {
            products(first: $first) {
              edges {
                node {
                  categories {
                    edges {
                      node {
                        name
                        path
                      }
                    }
                  }
                  ...ProductCardFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

const GetProductBySkuQuery = graphql(
  `
    query GetProductBySkuQuery($sku: String!, $currencyCode: currencyCode) {
      site {
        product(sku: $sku) {
          categories {
            edges {
              node {
                name
                path
              }
            }
          }
          ...ProductCardFragment
        }
      }
    }
  `,
  [ProductCardFragment],
);

export type TabCarouselSortType =
  'BEST_SELLING' | 'NEWEST' | 'FEATURED' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'BEST_REVIEWED';

export type TabSliderSortType = TabCarouselSortType;

export interface GetTabCarouselProductsOptions {
  categoryEntityId?: number;
  categoryEntityIds?: number[];
  skus?: string[];
  limit?: number;
  sort?: TabCarouselSortType;
  locale?: string;
}

export type GetTabSliderProductsOptions = GetTabCarouselProductsOptions;

export const getProductBySku = cache(async ({ sku, locale }: { sku: string; locale?: string }) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);

  try {
    const response = await client.fetch({
      document: GetProductBySkuQuery,
      variables: {
        sku: sku.trim(),
        currencyCode,
      },
      customerAccessToken,
      channelId,
      fetchOptions: {
        ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
        ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
      },
    });

    return response.data.site.product;
  } catch {
    return null;
  }
});

export const getProductsBySkus = cache(
  async ({ skus, locale }: { skus: string[]; locale?: string }) => {
    const validSkus = skus.map((s) => s.trim()).filter((s) => s.length > 0);

    if (validSkus.length === 0) {
      return [];
    }

    const results = await Promise.all(validSkus.map((sku) => getProductBySku({ sku, locale })));

    return results.filter((p): p is NonNullable<typeof p> => p != null);
  },
);

async function fetchDefaultCatalogProducts(
  sort: TabSliderSortType,
  limit: number,
  locale?: string,
) {
  if (sort === 'FEATURED') {
    const featuredRes = await getFeaturedProducts({ locale });

    return featuredRes.status === 'success' && featuredRes.products
      ? featuredRes.products.slice(0, limit)
      : [];
  }

  if (sort === 'NEWEST') {
    const newestRes = await getNewestProducts({ locale });

    return newestRes.status === 'success' && newestRes.products
      ? newestRes.products.slice(0, limit)
      : [];
  }

  const bestSellingRes = await getBestSellingProducts({ locale });

  return bestSellingRes.status === 'success' && bestSellingRes.products
    ? bestSellingRes.products.slice(0, limit)
    : [];
}

async function fetchCategoryFilteredProducts(
  filters: {
    categoryEntityId?: number;
    categoryEntityIds?: number[];
    searchSubCategories?: boolean;
  },
  sort: TabCarouselSortType,
  limit: number,
  locale?: string,
) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);

  try {
    const response = await client.fetch({
      document: GetTabCarouselProductsQuery,
      variables: {
        first: limit,
        filters,
        sort,
        currencyCode,
      },
      customerAccessToken,
      channelId,
      fetchOptions: {
        ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
        ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
      },
    });

    const searchProducts = response.data.site.search.searchProducts;

    return removeEdgesAndNodes(searchProducts.products);
  } catch {
    return [];
  }
}

export const getTabCarouselProducts = cache(async (options: GetTabCarouselProductsOptions = {}) => {
  const {
    categoryEntityId,
    categoryEntityIds,
    skus,
    limit = 10,
    sort = 'BEST_SELLING',
    locale,
  } = options;

  const skuProducts = skus && skus.length > 0 ? await getProductsBySkus({ skus, locale }) : [];

  const rawCategoryIds = Array.from(
    new Set([
      ...(categoryEntityId != null && !Number.isNaN(categoryEntityId) && categoryEntityId > 0
        ? [categoryEntityId]
        : []),
      ...(categoryEntityIds ? categoryEntityIds.filter((id) => !Number.isNaN(id) && id > 0) : []),
    ]),
  );

  let categoryProducts: typeof skuProducts = [];

  if (rawCategoryIds.length > 0) {
    // Resolve all descendant category IDs so child category products are included
    const expandedCategoryIds = await getCategoryDescendantIds(rawCategoryIds, { locale });

    const filters: {
      categoryEntityId?: number;
      categoryEntityIds?: number[];
      searchSubCategories?: boolean;
    } = {
      searchSubCategories: true,
    };

    if (expandedCategoryIds.length === 1 && expandedCategoryIds[0] != null) {
      filters.categoryEntityId = expandedCategoryIds[0];
    } else {
      filters.categoryEntityIds = expandedCategoryIds;
    }

    categoryProducts = await fetchCategoryFilteredProducts(filters, sort, limit, locale);
  } else if (skuProducts.length === 0) {
    categoryProducts = await fetchDefaultCatalogProducts(sort, limit, locale);
  }

  // Combine SKU products and category products, deduplicated by entityId
  const seenIds = new Set<number>();
  const combined = [...skuProducts, ...categoryProducts].filter((item) => {
    if (seenIds.has(item.entityId)) {
      return false;
    }

    seenIds.add(item.entityId);

    return true;
  });

  return {
    status: 'success' as const,
    products: combined.slice(0, limit),
  };
});

export const getTabSliderProducts = getTabCarouselProducts;
