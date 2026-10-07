import { Checkbox, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSBrandDirectory } from './client';

export const COMPONENT_TYPE = 'catalyst-brand-directory';

runtime.registerComponent(MSBrandDirectory, {
  type: COMPONENT_TYPE,
  label: 'Catalog / Brand List',
  icon: 'gallery',
  props: {
    className: Style(),
    title: TextInput({
      label: 'Main Title',
      defaultValue: 'BRAND LIST',
    }),
    subtitle: TextInput({
      label: 'Subtitle',
      defaultValue: 'Discover designers and collections available in our catalog',
    }),
    showSearch: Checkbox({
      label: 'Show Search Bar',
      defaultValue: true,
    }),
    showAlphabetFilter: Checkbox({
      label: 'Show Alphabet A-Z Filter',
      defaultValue: true,
    }),
    showProductCount: Checkbox({
      label: 'Show Product Count & Stock Badges',
      defaultValue: true,
    }),
  },
});
