import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';
import { z } from 'zod';

import {
  getTabCarouselProducts,
  TabCarouselSortType,
} from '~/client/queries/get-tab-carousel-products';
import { getLocaleRouting } from '~/i18n/locale-config';

const SortSchema = z
  .enum(['BEST_SELLING', 'NEWEST', 'FEATURED', 'LOWEST_PRICE', 'HIGHEST_PRICE', 'BEST_REVIEWED'])
  .default('BEST_SELLING');

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const { locales, defaultLocale } = await getLocaleRouting();

  const locale = searchParams.get('locale') ?? defaultLocale;

  if (!hasLocale(locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  const categoryIdParam = searchParams.get('categoryId');
  const categoryIdsParam = searchParams.get('categoryIds');
  const skusParam = searchParams.get('skus');
  const limitParam = searchParams.get('limit');
  const rawSort = searchParams.get('sort')?.toUpperCase();

  const parsedSort = SortSchema.safeParse(rawSort);
  const sort: TabCarouselSortType = parsedSort.success ? parsedSort.data : 'BEST_SELLING';

  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 50) : 10;

  const categoryEntityId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
  const categoryEntityIds = categoryIdsParam
    ? categoryIdsParam
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !Number.isNaN(id) && id > 0)
    : undefined;

  const skus = skusParam
    ? skusParam
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : undefined;

  const result = await getTabCarouselProducts({
    categoryEntityId:
      categoryEntityId && !Number.isNaN(categoryEntityId) ? categoryEntityId : undefined,
    categoryEntityIds:
      categoryEntityIds && categoryEntityIds.length > 0 ? categoryEntityIds : undefined,
    skus,
    limit,
    sort,
    locale,
  });

  return NextResponse.json(result);
};
