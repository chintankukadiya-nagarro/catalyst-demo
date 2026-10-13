import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const SizeGuidePageQuery = graphql(`
  query SizeGuidePageQuery($path: String!) {
    site {
      route(path: $path) {
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

const BUILT_IN_BAG_SIZE_CHART = `
<div class="space-y-4 text-xs leading-relaxed text-gray-700">
  <div>
    <h3 class="text-sm font-semibold text-gray-900 mb-1">Bag &amp; Backpack Size and Capacity Guide</h3>
    <p class="text-gray-500">Compare bag capacities and dimensions to find the perfect pack for your daily commute, outdoor trips, or travel.</p>
  </div>

  <div class="overflow-x-auto rounded border border-gray-200">
    <table class="w-full text-left divide-y divide-gray-200 text-xs">
      <thead class="bg-gray-50 text-gray-700 font-semibold">
        <tr>
          <th class="px-3 py-2.5">Capacity</th>
          <th class="px-3 py-2.5">Category</th>
          <th class="px-3 py-2.5">Approx. Dimensions (H × W × D)</th>
          <th class="px-3 py-2.5">Laptop Sleeve</th>
          <th class="px-3 py-2.5">Recommended Use</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900">15L – 20L</td>
          <td class="px-3 py-2.5 text-gray-600">Compact / Daypack</td>
          <td class="px-3 py-2.5 text-gray-600">42 × 28 × 14 cm (16.5" × 11" × 5.5")</td>
          <td class="px-3 py-2.5 text-gray-600">Up to 13"</td>
          <td class="px-3 py-2.5 text-gray-600">Everyday essentials, light commute</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900">21L – 26L</td>
          <td class="px-3 py-2.5 text-gray-600">Standard Daypack (Refugio 26L)</td>
          <td class="px-3 py-2.5 text-gray-600">46 × 31 × 17 cm (18" × 12" × 6.5")</td>
          <td class="px-3 py-2.5 text-gray-600">Up to 15"</td>
          <td class="px-3 py-2.5 text-gray-600">Work, campus, day hikes &amp; travel</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900">27L – 32L</td>
          <td class="px-3 py-2.5 text-gray-600">Large Commuter</td>
          <td class="px-3 py-2.5 text-gray-600">50 × 33 × 20 cm (19.5" × 13" × 8")</td>
          <td class="px-3 py-2.5 text-gray-600">Up to 16"</td>
          <td class="px-3 py-2.5 text-gray-600">Gym + work gear, weekend trips</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900">35L+</td>
          <td class="px-3 py-2.5 text-gray-600">Travel / Adventure Pack</td>
          <td class="px-3 py-2.5 text-gray-600">54 × 35 × 24 cm (21" × 14" × 9.5")</td>
          <td class="px-3 py-2.5 text-gray-600">Up to 17"</td>
          <td class="px-3 py-2.5 text-gray-600">Multi-day travel, carry-on flights</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="rounded bg-gray-50 p-3 space-y-1 text-gray-600 text-xs">
    <p class="font-medium text-gray-900">Fit &amp; Sizing Notes:</p>
    <p>• External dimensions are measured at the widest points when the pack is moderately filled.</p>
    <p>• Laptop sleeve fit depends on overall device thickness and width, not only screen diagonal.</p>
    <p>• Padded shoulder straps and sternum straps can be adjusted to fit torso lengths between 43 cm and 53 cm.</p>
  </div>
</div>
`;

const BUILT_IN_SHOE_SIZE_CHART = `
<div class="space-y-4 text-xs leading-relaxed text-gray-700">
  <div>
    <h3 class="text-sm font-semibold text-gray-900 mb-1">Footwear &amp; Shoe Size Conversion Chart</h3>
    <p class="text-gray-500">Standard international shoe size conversion chart based on foot length (cm).</p>
  </div>

  <div class="overflow-x-auto rounded border border-gray-200">
    <table class="w-full text-center divide-y divide-gray-200 text-xs">
      <thead class="bg-gray-50 text-gray-700 font-semibold">
        <tr>
          <th class="px-3 py-2.5 text-left">Japan (cm)</th>
          <th class="px-3 py-2.5">US Men</th>
          <th class="px-3 py-2.5">US Women</th>
          <th class="px-3 py-2.5">EU</th>
          <th class="px-3 py-2.5">UK</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">22.5 cm</td>
          <td class="px-3 py-2.5 text-gray-600">4.5</td>
          <td class="px-3 py-2.5 text-gray-600">5.5</td>
          <td class="px-3 py-2.5 text-gray-600">36.0</td>
          <td class="px-3 py-2.5 text-gray-600">3.5</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">23.0 cm</td>
          <td class="px-3 py-2.5 text-gray-600">5.0</td>
          <td class="px-3 py-2.5 text-gray-600">6.0</td>
          <td class="px-3 py-2.5 text-gray-600">36.5</td>
          <td class="px-3 py-2.5 text-gray-600">4.0</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">23.5 cm</td>
          <td class="px-3 py-2.5 text-gray-600">5.5</td>
          <td class="px-3 py-2.5 text-gray-600">6.5</td>
          <td class="px-3 py-2.5 text-gray-600">37.5</td>
          <td class="px-3 py-2.5 text-gray-600">4.5</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">24.0 cm</td>
          <td class="px-3 py-2.5 text-gray-600">6.0</td>
          <td class="px-3 py-2.5 text-gray-600">7.0</td>
          <td class="px-3 py-2.5 text-gray-600">38.5</td>
          <td class="px-3 py-2.5 text-gray-600">5.0</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">24.5 cm</td>
          <td class="px-3 py-2.5 text-gray-600">6.5</td>
          <td class="px-3 py-2.5 text-gray-600">7.5</td>
          <td class="px-3 py-2.5 text-gray-600">39.0</td>
          <td class="px-3 py-2.5 text-gray-600">5.5</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">25.0 cm</td>
          <td class="px-3 py-2.5 text-gray-600">7.0</td>
          <td class="px-3 py-2.5 text-gray-600">8.0</td>
          <td class="px-3 py-2.5 text-gray-600">40.0</td>
          <td class="px-3 py-2.5 text-gray-600">6.0</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">25.5 cm</td>
          <td class="px-3 py-2.5 text-gray-600">7.5</td>
          <td class="px-3 py-2.5 text-gray-600">8.5</td>
          <td class="px-3 py-2.5 text-gray-600">40.5</td>
          <td class="px-3 py-2.5 text-gray-600">6.5</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">26.0 cm</td>
          <td class="px-3 py-2.5 text-gray-600">8.0</td>
          <td class="px-3 py-2.5 text-gray-600">9.0</td>
          <td class="px-3 py-2.5 text-gray-600">41.5</td>
          <td class="px-3 py-2.5 text-gray-600">7.0</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">26.5 cm</td>
          <td class="px-3 py-2.5 text-gray-600">8.5</td>
          <td class="px-3 py-2.5 text-gray-600">9.5</td>
          <td class="px-3 py-2.5 text-gray-600">42.0</td>
          <td class="px-3 py-2.5 text-gray-600">7.5</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">27.0 cm</td>
          <td class="px-3 py-2.5 text-gray-600">9.0</td>
          <td class="px-3 py-2.5 text-gray-600">10.0</td>
          <td class="px-3 py-2.5 text-gray-600">43.0</td>
          <td class="px-3 py-2.5 text-gray-600">8.0</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="rounded bg-gray-50 p-3 space-y-1 text-gray-600 text-xs">
    <p class="font-medium text-gray-900">How to Measure &amp; Fit Recommendations:</p>
    <p>• Place a piece of paper against a wall and stand on it with your heel lightly touching the wall.</p>
    <p>• Mark the tip of your longest toe and measure the distance in centimeters.</p>
    <p>• For boots worn with thick socks or for wider feet, we recommend choosing a half size larger (+0.5 cm).</p>
  </div>
</div>
`;

const BUILT_IN_CLOTHING_SIZE_CHART = `
<div class="space-y-4 text-xs leading-relaxed text-gray-700">
  <div>
    <h3 class="text-sm font-semibold text-gray-900 mb-1">アパレル・ウェア サイズガイド (Clothing Size Chart)</h3>
    <p class="text-gray-500">標準的なヌード寸法の目安表（単位：cm）です。</p>
  </div>

  <div class="overflow-x-auto rounded border border-gray-200">
    <table class="w-full text-center divide-y divide-gray-200 text-xs">
      <thead class="bg-gray-50 text-gray-700 font-semibold">
        <tr>
          <th class="px-3 py-2.5 text-left">サイズ</th>
          <th class="px-3 py-2.5">胸囲 (Chest)</th>
          <th class="px-3 py-2.5">胴囲 (Waist)</th>
          <th class="px-3 py-2.5">腰囲 (Hips)</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">S</td>
          <td class="px-3 py-2.5 text-gray-600">86 – 91 cm</td>
          <td class="px-3 py-2.5 text-gray-600">71 – 76 cm</td>
          <td class="px-3 py-2.5 text-gray-600">89 – 94 cm</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">M</td>
          <td class="px-3 py-2.5 text-gray-600">97 – 102 cm</td>
          <td class="px-3 py-2.5 text-gray-600">79 – 84 cm</td>
          <td class="px-3 py-2.5 text-gray-600">97 – 102 cm</td>
        </tr>
        <tr>
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">L</td>
          <td class="px-3 py-2.5 text-gray-600">107 – 112 cm</td>
          <td class="px-3 py-2.5 text-gray-600">86 – 91 cm</td>
          <td class="px-3 py-2.5 text-gray-600">104 – 109 cm</td>
        </tr>
        <tr class="bg-gray-50/50">
          <td class="px-3 py-2.5 font-medium text-gray-900 text-left">XL</td>
          <td class="px-3 py-2.5 text-gray-600">117 – 122 cm</td>
          <td class="px-3 py-2.5 text-gray-600">97 – 102 cm</td>
          <td class="px-3 py-2.5 text-gray-600">112 – 117 cm</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
`;

async function fetchRouteHtml(path: string, customerAccessToken?: string): Promise<string | null> {
  try {
    const { data } = await client.fetch({
      document: SizeGuidePageQuery,
      variables: { path },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const node = data.site.route?.node;

    console.log(`[fetchRouteHtml] path="${path}" node=`, node ? `${node.__typename}` : 'null');

    if (node && 'htmlBody' in node && node.htmlBody) {
      return node.htmlBody as string;
    }

    return null;
  } catch (error) {
    console.error(`[fetchRouteHtml] error for "${path}":`, error);
    return null;
  }
}

/**
 * Returns conditional size guide HTML content based on the `Size Chart` custom field.
 *
 * Supported values for `sizeChartValue`:
 * - "Bag", "Backpack", "バッグ", etc. -> Bag & Backpack size / capacity guide
 * - "Shoe", "Shoes", "Boots", "シューズ", "靴", etc. -> Footwear size conversion chart
 * - "Clothing", "Apparel", "Clothes", etc. -> Clothing size guide
 * - "/my-custom-guide/" -> Loads that page directly from BigCommerce Storefront
 * - "None", "No", "False" -> Disables size guide for this product
 *
 * When BigCommerce has a corresponding CMS page (e.g., /size-guide-bag/), that page is preferred.
 * Otherwise, the built-in responsive template is used.
 */
export const getSizeGuideContent = cache(
  async (sizeChartValue?: string | null, customerAccessToken?: string): Promise<string | null> => {
    console.log('[getSizeGuideContent] input sizeChartValue:', sizeChartValue);
    const normalized = sizeChartValue?.trim().toLowerCase();

    // 1. Explicitly disabled
    if (normalized && ['none', 'no', 'false', '0', 'off'].includes(normalized)) {
      return null;
    }

    // 2. Custom path or URL specified in custom field
    if (normalized?.startsWith('/')) {
      const customHtml = await fetchRouteHtml(normalized, customerAccessToken);

      if (customHtml) {
        return customHtml;
      }
    }

    // 3. Category match: Bag / Backpack
    if (
      normalized &&
      [
        'bag',
        'bags',
        'backpack',
        'backpacks',
        'daypack',
        'daypacks',
        'バッグ',
        'バックパック',
        'リュック',
      ].includes(normalized)
    ) {
      const cmsHtml =
        (await fetchRouteHtml('/size-guide-bag/', customerAccessToken)) ??
        (await fetchRouteHtml('/size-guide-bags/', customerAccessToken));

      return cmsHtml || BUILT_IN_BAG_SIZE_CHART;
    }

    // 4. Category match: Shoe / Boots / Footwear
    if (
      normalized &&
      [
        'shoe',
        'shoes',
        'boot',
        'boots',
        'footwear',
        'sneaker',
        'sneakers',
        'シューズ',
        '靴',
        'ブーツ',
      ].includes(normalized)
    ) {
      const cmsHtml =
        (await fetchRouteHtml('/size-guide-shoe/', customerAccessToken)) ??
        (await fetchRouteHtml('/size-guide-shoes/', customerAccessToken));

      return cmsHtml || BUILT_IN_SHOE_SIZE_CHART;
    }

    // 5. Category match: Clothing / Apparel
    if (
      normalized &&
      ['clothing', 'clothes', 'apparel', 'wear', '服', 'アパレル'].includes(normalized)
    ) {
      const cmsHtml =
        (await fetchRouteHtml('/size-guide-clothing/', customerAccessToken)) ??
        (await fetchRouteHtml('/size-guide-apparel/', customerAccessToken));

      return cmsHtml || BUILT_IN_CLOTHING_SIZE_CHART;
    }

    // 6. Generic custom category: attempt to fetch /size-guide-${name}/
    if (normalized) {
      const cmsHtml = await fetchRouteHtml(`/size-guide-${normalized}/`, customerAccessToken);

      if (cmsHtml) {
        return cmsHtml;
      }
    }

    // 7. Fallback: standard /size-guide/ page
    return fetchRouteHtml('/size-guide/', customerAccessToken);
  },
);
