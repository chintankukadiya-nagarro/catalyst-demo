import {
  Combobox,
  Group,
  Image,
  Link,
  List,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { searchCategories } from '../../utils/search-categories';

import { MSCategoryGrid } from './client';

export const COMPONENT_TYPE = 'catalyst-category-grid';

runtime.registerComponent(MSCategoryGrid, {
  type: COMPONENT_TYPE,
  label: 'Catalog / Category Grid',
  icon: 'gallery',
  props: {
    className: Style(),
    title: TextInput({
      label: 'Main Title',
      defaultValue: 'The target categories are listed here.',
    }),
    subtitle: TextInput({
      label: 'Category Subtitle',
      defaultValue: 'Furniture',
    }),
    columns: Select({
      label: 'Columns',
      options: [
        { value: '4', label: '4 Columns' },
        { value: '3', label: '3 Columns' },
        { value: '2', label: '2 Columns' },
      ],
      defaultValue: '4',
    }),
    categories: List({
      label: 'Category Cards',
      type: Group({
        label: 'Category Card',
        props: {
          title: TextInput({
            label: 'Display Label',
            defaultValue: 'Chairs & Sofas',
          }),
          categoryPath: Combobox({
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
          imageSrc: Image({
            label: 'Card Image',
          }),
          imageAlt: TextInput({
            label: 'Image Alt Text',
            defaultValue: 'Category photo',
          }),
          link: Link({
            label: 'Custom Link (override category path)',
          }),
        },
      }),
      getItemLabel(item) {
        const categoryLabel =
          item?.categoryPath != null && typeof item.categoryPath === 'object'
            ? item.categoryPath.label
            : undefined;

        return item?.title || categoryLabel || 'Category';
      },
    }),
  },
});
