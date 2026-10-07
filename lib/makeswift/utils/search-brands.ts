'use server';

import { getBrandsDirectoryData } from '~/app/[locale]/(default)/brands/page-data';

export interface BrandOption {
  id: string;
  label: string;
  value: string;
  path: string;
  name: string;
  productCount: number;
}

export async function searchBrands(query = ''): Promise<BrandOption[]> {
  try {
    const brands = await getBrandsDirectoryData();

    const options: BrandOption[] = brands.map((brand) => ({
      id: brand.entityId.toString(),
      label: `${brand.name}${brand.productCount > 0 ? ` (${brand.productCount})` : ''}`,
      value: brand.entityId.toString(),
      path: brand.path,
      name: brand.name,
      productCount: brand.productCount,
    }));

    if (!query.trim()) {
      return options;
    }

    const lowerQuery = query.toLowerCase();

    return options.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.path.toLowerCase().includes(lowerQuery),
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to search brands:', error);

    return [];
  }
}
