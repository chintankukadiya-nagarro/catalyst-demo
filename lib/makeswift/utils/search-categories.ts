'use server';

import { GetLinksAndSectionsQuery } from '~/app/[locale]/(default)/page-data';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { HeaderLinksFragment } from '~/components/header/fragment';

export interface CategoryOption {
  id: string;
  label: string;
  value: string;
  path: string;
  name: string;
}

interface CategoryTreeNode {
  entityId: number;
  name: string;
  path: string;
  children?: CategoryTreeNode[];
}

function flattenCategoryTree(cats: CategoryTreeNode[], parentName = ''): CategoryOption[] {
  return cats.flatMap((cat) => {
    const fullLabel = parentName ? `${parentName} > ${cat.name}` : cat.name;
    const entityId = cat.entityId.toString();
    const option: CategoryOption = {
      id: entityId,
      label: fullLabel,
      value: entityId,
      path: cat.path,
      name: cat.name,
    };
    const childNodes = cat.children ?? [];

    return [option, ...flattenCategoryTree(childNodes, fullLabel)];
  });
}

export async function searchCategories(query = ''): Promise<CategoryOption[]> {
  try {
    const response = await client.fetch({
      document: GetLinksAndSectionsQuery,
      validateCustomerAccessToken: false,
    });

    const categoryTree = readFragment(HeaderLinksFragment, response.data).site.categoryTree;

    const flattened = flattenCategoryTree(categoryTree);

    if (!query.trim()) {
      return flattened;
    }

    const lowerQuery = query.toLowerCase();

    return flattened.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.path.toLowerCase().includes(lowerQuery),
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching categories for Makeswift:', error);

    return [];
  }
}
