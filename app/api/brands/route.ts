import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getBrandsList } from '~/client/queries/get-brands';
import { getLocaleRouting } from '~/i18n/locale-config';

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { locales, defaultLocale } = await getLocaleRouting();

    const locale = searchParams.get('locale') ?? defaultLocale;

    if (!hasLocale(locales, locale)) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid locale parameter' },
        { status: 400 },
      );
    }

    const brands = await getBrandsList(locale);

    return NextResponse.json({
      status: 'success',
      brands,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch brands',
      },
      { status: 500 },
    );
  }
};
