import {
  Checkbox,
  Combobox,
  Group,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { searchCategories } from '../../utils/search-categories';

import { MSTabCarousel } from './client';

export const COMPONENT_TYPE = 'catalyst-tab-carousel';

runtime.registerComponent(MSTabCarousel, {
  type: COMPONENT_TYPE,
  label: 'Catalog / Tab Carousel',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({
      label: 'Main Title',
      defaultValue: 'Popular Products',
    }),
    subtitle: TextInput({
      label: 'Subtitle (optional)',
      defaultValue: '',
    }),
    showAllTab: Checkbox({
      label: 'Show "ALL" starting tab',
      defaultValue: true,
    }),
    allTabLabel: TextInput({
      label: '"ALL" Tab Label',
      defaultValue: 'ALL',
    }),
    tabs: List({
      label: 'Carousel Tabs',
      type: Group({
        label: 'Tab Item',
        props: {
          label: TextInput({
            label: 'Tab Display Label',
            defaultValue: '',
          }),
          category: Combobox({
            label: 'BigCommerce Category',
            async getOptions(query) {
              const categories = await searchCategories(query);

              return categories.map((cat) => ({
                id: cat.id,
                label: cat.label,
                value: cat.value,
              }));
            },
          }),
          skus: TextInput({
            label: 'Specific SKUs (comma-separated, optional)',
            defaultValue: '',
          }),
        },
      }),
      getItemLabel(item) {
        const catLabel =
          item?.category != null &&
          typeof item.category === 'object' &&
          'label' in item.category &&
          typeof item.category.label === 'string'
            ? item.category.label
            : undefined;

        const skuSnippet = item?.skus ? ` [SKUs: ${item.skus.slice(0, 15)}...]` : '';

        return (item?.label || catLabel || 'Tab') + skuSnippet;
      },
    }),
    limit: Number({
      label: 'Products in slider (count)',
      defaultValue: 10,
      min: 1,
      max: 30,
      step: 1,
    }),
    sort: Select({
      label: 'Sort Order',
      options: [
        { value: 'BEST_SELLING', label: 'Best selling' },
        { value: 'NEWEST', label: 'Newest arrivals' },
        { value: 'FEATURED', label: 'Featured products' },
        { value: 'LOWEST_PRICE', label: 'Lowest price' },
        { value: 'HIGHEST_PRICE', label: 'Highest price' },
        { value: 'BEST_REVIEWED', label: 'Best reviewed' },
      ],
      defaultValue: 'BEST_SELLING',
    }),
    showNumbers: Checkbox({
      label: 'Show number badges (No. 01, No. 02...)',
      defaultValue: false,
    }),
    aspectRatio: Select({
      label: 'Image aspect ratio',
      options: [
        { value: '5:6', label: '5:6 (Portrait)' },
        { value: '3:4', label: '3:4 (Portrait)' },
        { value: '1:1', label: '1:1 (Square)' },
      ],
      defaultValue: '5:6',
    }),
  },
});
