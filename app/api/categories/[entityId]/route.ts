import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { getLocaleRouting } from '~/i18n/locale-config';

const GetCategory = graphql(`
  query GetCategory($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        entityId
        name
        path
      }
    }
  }
`);

export type GetCategoryResponse = ResultOf<typeof GetCategory>['site']['category'];

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> },
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const searchParams = request.nextUrl.searchParams;
  const { locales, defaultLocale } = await getLocaleRouting();

  const locale = searchParams.get('locale') ?? defaultLocale;

  if (!hasLocale(locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  const { entityId } = await params;
  const parsedEntityId = parseInt(entityId, 10);

  if (Number.isNaN(parsedEntityId)) {
    return NextResponse.json({ status: 'error', error: 'Invalid entityId' }, { status: 400 });
  }

  const { data } = await client.fetch({
    document: GetCategory,
    customerAccessToken,
    variables: { entityId: parsedEntityId },
    fetchOptions: {
      headers: {
        'Accept-Language': locale,
      },
    },
  });

  const category = data.site.category;

  if (category == null) {
    return NextResponse.json({ status: 'error', error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json(category);
};
