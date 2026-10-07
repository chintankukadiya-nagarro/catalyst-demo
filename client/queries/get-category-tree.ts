import { cache } from 'react';

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const GetCategoryTreeQuery = graphql(`
  query GetCategoryTreeQuery {
    site {
      categoryTree {
        entityId
        name
        path
        children {
          entityId
          name
          path
          children {
            entityId
            name
            path
            children {
              entityId
              name
              path
            }
          }
        }
      }
    }
  }
`);

export type CategoryTree = ResultOf<typeof GetCategoryTreeQuery>['site']['categoryTree'];
export type CategoryTreeNode = CategoryTree[number];

export const getCategoryTree = cache(
  async ({ locale }: { locale?: string } = {}): Promise<CategoryTree> => {
    const channelId = getChannelIdFromLocale(locale);

    try {
      const response = await client.fetch({
        document: GetCategoryTreeQuery,
        channelId,
        validateCustomerAccessToken: false,
        fetchOptions: {
          ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
          next: { revalidate },
        },
      });

      return response.data.site.categoryTree;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching category tree:', error);

      return [];
    }
  },
);

function collectDescendantIds(
  nodes: readonly CategoryTreeNode[],
  targetIds: Set<number>,
  result: Set<number>,
  isDescendantOfTarget = false,
): void {
  nodes.forEach((node) => {
    const isTarget = targetIds.has(node.entityId);
    const shouldInclude = isDescendantOfTarget || isTarget;

    if (shouldInclude) {
      result.add(node.entityId);
    }

    if (node.children.length > 0) {
      collectDescendantIds(node.children, targetIds, result, shouldInclude);
    }
  });
}

export const getCategoryDescendantIds = cache(
  async (categoryIds: number[], { locale }: { locale?: string } = {}): Promise<number[]> => {
    const validIds = categoryIds.filter((id) => !Number.isNaN(id) && id > 0);

    if (validIds.length === 0) {
      return [];
    }

    const tree = await getCategoryTree({ locale });
    const targetSet = new Set(validIds);
    const resultSet = new Set<number>();

    collectDescendantIds(tree, targetSet, resultSet);

    // Preserve all original valid IDs even if not found in category tree
    validIds.forEach((id) => {
      resultSet.add(id);
    });

    return Array.from(resultSet);
  },
);
