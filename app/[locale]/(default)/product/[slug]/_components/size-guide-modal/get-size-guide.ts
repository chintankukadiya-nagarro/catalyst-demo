import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const SizeGuidePageQuery = graphql(`
  query SizeGuidePageQuery {
    site {
      route(path: "/size-guide/") {
        node {
          __typename
          ... on RawHtmlPage {
            htmlBody
          }
          ... on NormalPage {
            htmlBody
          }
        }
      }
    }
  }
`);

export const getSizeGuideContent = cache(async (customerAccessToken?: string) => {
  try {
    const { data } = await client.fetch({
      document: SizeGuidePageQuery,
      customerAccessToken,
      fetchOptions: { next: { revalidate } },
    });

    const node = data.site.route?.node;

    if (node && ('htmlBody' in node) && node.htmlBody) {
      return node.htmlBody as string;
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch size guide page content:', error);
    return null;
  }
});
