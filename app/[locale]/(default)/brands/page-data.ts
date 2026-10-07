import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandsDirectoryQuery = graphql(`
  query BrandsDirectoryQuery {
    site {
      brands(first: 50) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            entityId
            name
            path
            defaultImage {
              url: urlTemplate(lossy: true)
              altText
            }
            metaDesc
          }
        }
      }
      popularBrands(first: 50) {
        edges {
          node {
            entityId
            count
          }
        }
      }
    }
  }
`);

export interface BrandItem {
  entityId: number;
  name: string;
  path: string;
  productCount: number;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export const getBrandsDirectoryData = cache(async (customerAccessToken?: string) => {
  const { data } = await client.fetch({
    document: BrandsDirectoryQuery,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  // Build product count map from popularBrands
  const productCountMap = new Map<number, number>();
  const popularBrandEdges = data.site.popularBrands.edges ?? [];

  for (const edge of popularBrandEdges) {
    productCountMap.set(edge.node.entityId, edge.node.count);
  }

  const brandEdges = data.site.brands.edges ?? [];

  const brands: BrandItem[] = brandEdges.map(({ node }) => ({
    entityId: node.entityId,
    name: node.name,
    path: node.path,
    productCount: productCountMap.get(node.entityId) ?? 0,
    imageUrl: node.defaultImage?.url ?? null,
    imageAlt: node.defaultImage?.altText ?? node.name,
  }));

  // Sort alphabetically by name
  return brands.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
});
