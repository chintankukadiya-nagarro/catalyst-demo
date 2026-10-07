import { Checkbox, Group, Link, List, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSBreadcrumbs } from './client';

export const COMPONENT_TYPE = 'navigation-breadcrumbs';

runtime.registerComponent(MSBreadcrumbs, {
  type: COMPONENT_TYPE,
  label: 'Navigation / Breadcrumbs',
  icon: 'layout',
  props: {
    className: Style(),
    useAutoPath: Checkbox({
      label: 'Auto-detect from URL',
      defaultValue: true,
    }),
    breadcrumbs: List({
      label: 'Custom breadcrumbs',
      type: Group({
        label: 'Breadcrumb item',
        props: {
          label: TextInput({ label: 'Label', defaultValue: 'Item' }),
          href: Link({ label: 'Link' }),
        },
      }),
      getItemLabel(item) {
        return item?.label || 'Untitled breadcrumb';
      },
    }),
  },
});
