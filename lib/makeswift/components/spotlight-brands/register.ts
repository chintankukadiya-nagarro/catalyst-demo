import {
  Combobox,
  Group,
  Image,
  Link,
  List,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { searchBrands } from '../../utils/search-brands';

import { MSSpotlightBrands } from './client';

export const COMPONENT_TYPE = 'catalyst-spotlight-brands';

runtime.registerComponent(MSSpotlightBrands, {
  type: COMPONENT_TYPE,
  label: 'Catalog / Spotlight Brands',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({
      label: 'Main Title',
      defaultValue: 'Spotlight Picks',
    }),
    subtitle: TextInput({
      label: 'Subtitle',
      defaultValue: 'Brands to watch right now',
    }),
    viewMoreText: TextInput({
      label: 'Button Label',
      defaultValue: 'VIEW MORE',
    }),
    viewMoreLink: Link({
      label: 'Button Destination',
    }),
    brands: List({
      label: 'Spotlight Brand Cards',
      type: Group({
        label: 'Brand Card',
        props: {
          brandName: TextInput({
            label: 'Brand Name (or override)',
            defaultValue: 'MOTHER',
          }),
          brandSelection: Combobox({
            label: 'BigCommerce Brand',
            async getOptions(query) {
              const brands = await searchBrands(query);

              return brands.map((b) => ({
                id: b.id,
                label: b.label,
                value: b.value,
              }));
            },
          }),
          description: TextInput({
            label: 'Editorial Note / Description',
            defaultValue: "Find your must-have denim for this fall at 'Mother'",
          }),
          imageSrc: Image({
            label: 'Card Image',
          }),
          imageAlt: TextInput({
            label: 'Image Alt Text',
            defaultValue: 'Brand image',
          }),
          link: Link({
            label: 'Custom Link (Overrides Brand link)',
          }),
        },
      }),
      getItemLabel(item) {
        const brandLabel =
          item?.brandSelection != null && typeof item.brandSelection === 'object'
            ? (item.brandSelection as { label?: string }).label
            : undefined;

        return item?.brandName || brandLabel || 'Brand Card';
      },
    }),
  },
});
